import asyncio
from aiokafka import AIOKafkaConsumer
from pydantic import ValidationError
from app.schemas.events import OmniSightEvent, DLQEvent
from app.config.settings import settings
from app.core.kafka_broker import broker

async def process_event(event: OmniSightEvent):
    # This is where Neo4j spatial checks or Postgres ingestion happens
    print(f"Processed valid event: {event.event_id} from {event.source_id}")

async def run_ingest_worker():
    consumer = AIOKafkaConsumer(
        settings.KAFKA_RAW_EVENTS_TOPIC,
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        group_id="omnisight_ingest_group",
        auto_offset_reset="earliest"
    )
    
    await consumer.start()
    print("Ingest worker listening for events...")
    
    try:
        async for msg in consumer:
            raw_payload = msg.value.decode('utf-8')
            try:
                # 1. Strict Validation
                event = OmniSightEvent.parse_raw(raw_payload)
                # 2. Processing
                await process_event(event)
            except ValidationError as e:
                # 3. DLQ Routing for Malformed Sensors
                print(f"Validation error on payload: {raw_payload}. Sending to DLQ.")
                dlq_event = DLQEvent(error_reason=str(e), original_payload=raw_payload)
                await broker.publish_event(settings.KAFKA_DLQ_TOPIC, dlq_event.dict())
    finally:
        await consumer.stop()

if __name__ == "__main__":
    asyncio.run(run_ingest_worker())
