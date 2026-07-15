from sentence_transformers import SentenceTransformer

from backend.config import EMBEDDING_MODEL


class EmbeddingService:

    def __init__(self):

        print("Loading embedding model...")

        self.model = SentenceTransformer(
            EMBEDDING_MODEL
        )

        print("Embedding model loaded!")

    def embed_chunks(self, chunks):

        texts = [
            chunk["text"]
            for chunk in chunks
        ]

        vectors = self.model.encode(
            texts,
            convert_to_numpy=True
        )

        return vectors.tolist()