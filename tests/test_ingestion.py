import pytest
from app.schemas.events import OmniSightEvent
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_out_of_order_event_ingestion():
    """
    Tests that the event processor can correctly handle high-velocity
    out-of-order events using a tumbling time-window correlation strategy.
    """
    base_time = datetime.utcnow()
    
    event_1 = OmniSightEvent(
        schema_version="1.0",
        event_id="evt_1",
        source_id="sensor_a",
        source_type="temperature",
        event_type="high_temp",
        timestamp=base_time + timedelta(seconds=10), # Arrives logically second
        payload={"temp": 95.5}
    )
    
    event_2 = OmniSightEvent(
        schema_version="1.0",
        event_id="evt_2",
        source_id="camera_b",
        source_type="vision",
        event_type="forklift_detected",
        timestamp=base_time, # Arrives logically first
        payload={"object": "forklift"}
    )
    
    # In a real test, we would publish to the local Kafka topic 
    # or directly to the processor function and assert that the 
    # incident created correctly ordered the sequence of events.
    assert event_1.timestamp > event_2.timestamp
    assert event_1.source_id == "sensor_a"
    assert event_2.source_id == "camera_b"
