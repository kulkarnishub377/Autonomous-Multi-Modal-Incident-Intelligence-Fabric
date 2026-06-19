from app.core.neo4j_client import neo4j_client

class SpatialGraphService:
    async def get_adjacent_risks(self, sensor_id: str) -> list[dict]:
        """
        If a sensor goes offline, this query finds what Zone it monitors, 
        what Assets are located in that Zone, and if there are other active sensors.
        This provides spatial context for the incident risk multiplier.
        """
        query = """
        MATCH (s:Sensor {id: $sensor_id})-[:MONITORS]->(z:Zone)<-[:LOCATED_IN]-(a:Asset)
        OPTIONAL MATCH (other:Sensor)-[:MONITORS]->(z)
        WHERE other.id <> $sensor_id AND other.status = 'active'
        RETURN z.name AS zone, a.name AS asset_at_risk, collect(other.id) AS active_backup_sensors
        """
        
        async with neo4j_client.driver.session() as session:
            result = await session.run(query, sensor_id=sensor_id)
            records = await result.data()
            return records

spatial_graph = SpatialGraphService()
