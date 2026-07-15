from backend.services.embedding_service import EmbeddingService
from backend.services.chroma_service import ChromaService


class Retriever:

    def __init__(self):
        from backend.core.services import (embedding_service,vector_db,)
        self.embedder = embedding_service
        self.vector_db = vector_db

    def retrieve(self, query: str, top_k: int = 5):

        query_embedding = self.embedder.model.encode(
            query,
            convert_to_numpy=True
        ).tolist()

        results = self.vector_db.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        retrieved_chunks = []

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]

        for doc, meta in zip(documents, metadatas):

            retrieved_chunks.append(
                {
                    "text": doc,
                    "page": meta["page"],
                    "source": meta["source"]
                }
            )

        return retrieved_chunks