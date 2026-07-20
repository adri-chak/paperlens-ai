from backend.core.services import (
    embedding_service,
    vector_db,
)


class Retriever:

    def retrieve(
        self,
        question: str,
        top_k: int = 5,
        similarity_threshold: float = 1.2,
    ):

        question_embedding = embedding_service.model.encode(
            question
        ).tolist()

        results = vector_db.collection.query(
            query_embeddings=[question_embedding],
            n_results=top_k * 2,
        )

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        seen = set()
        retrieved = []

        for doc, meta, distance in zip(
            documents,
            metadatas,
            distances,
        ):

            if distance > similarity_threshold:
                continue

            key = (meta["source"], meta["page"], doc[:120])

            if key in seen:
                continue

            seen.add(key)

            retrieved.append(
                {
                    "text": doc,
                    "page": meta["page"],
                    "source": meta["source"],
                    "score": round(1 - distance, 3),
                }
            )

        retrieved.sort(
            key=lambda x: x["score"],
            reverse=True,
        )

        return retrieved