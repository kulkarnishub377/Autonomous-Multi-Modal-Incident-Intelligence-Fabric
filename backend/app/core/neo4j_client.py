from neo4j import AsyncGraphDatabase
from app.config.settings import settings

class Neo4jClient:
    def __init__(self):
        self.driver = None

    async def connect(self):
        self.driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
        print("Connected to Neo4j.")

    async def close(self):
        if self.driver:
            await self.driver.close()

neo4j_client = Neo4jClient()
