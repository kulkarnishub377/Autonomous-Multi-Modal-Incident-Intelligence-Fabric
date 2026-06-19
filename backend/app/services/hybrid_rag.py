import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from typing import List, Dict, Any

# We use BAAI/bge-reranker-base as a lightweight, highly effective local cross-encoder
RERANKER_MODEL_NAME = "BAAI/bge-reranker-base"

class HybridRAGService:
    def __init__(self):
        # Initialize the cross-encoder for reranking locally
        self.tokenizer = AutoTokenizer.from_pretrained(RERANKER_MODEL_NAME)
        self.model = AutoModelForSequenceClassification.from_pretrained(RERANKER_MODEL_NAME)
        self.model.eval()

    async def hybrid_search(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Mock implementation of Hybrid Search (Dense Vectors + BM25).
        In a real scenario, this queries Qdrant using its hybrid search capabilities.
        """
        # Mock retrieved chunks from Qdrant
        retrieved_chunks = [
            {"id": "chunk_1", "text": "Machine A safety protocols require a full shutdown.", "source": "manual_v1"},
            {"id": "chunk_2", "text": "Standard forklift operating procedures in Zone B.", "source": "sop_v2"},
            {"id": "chunk_3", "text": "Emergency override for Machine A overheating events.", "source": "manual_v1"},
        ]
        return retrieved_chunks

    async def rerank_results(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Applies a HuggingFace Cross-Encoder to accurately score and re-rank the retrieved chunks.
        """
        if not chunks:
            return []

        pairs = [[query, chunk["text"]] for chunk in chunks]
        
        with torch.no_grad():
            inputs = self.tokenizer(pairs, padding=True, truncation=True, return_tensors='pt', max_length=512)
            scores = self.model(**inputs, return_dict=True).logits.view(-1, ).float()
            
        # Add scores back to the chunks and sort
        for chunk, score in zip(chunks, scores):
            chunk["rerank_score"] = score.item()
            
        reranked_chunks = sorted(chunks, key=lambda x: x["rerank_score"], reverse=True)
        return reranked_chunks[:top_k]

    async def retrieve_context(self, query: str) -> List[Dict[str, Any]]:
        # Step 1: Broad retrieval using Hybrid Search from Qdrant
        broad_results = await self.hybrid_search(query, top_k=15)
        
        # Step 2: Precision Reranking using local Cross-Encoder
        refined_results = await self.rerank_results(query, broad_results, top_k=3)
        return refined_results

rag_service = HybridRAGService()
