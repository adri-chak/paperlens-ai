import chromadb

from backend.config import (
    CHROMA_DB_PATH,
    COLLECTION_NAME
)


class ChromaService:

    def __init__(self):

        self.client = chromadb.PersistentClient(
            path=str(CHROMA_DB_PATH)
        )

        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME
        )

    def add_document(
        self,
        filename,
        chunks,
        embeddings
    ):

        ids = []

        documents = []

        metadatas = []

        for i, chunk in enumerate(chunks):

            ids.append(
                f"{filename}_{i}"
            )

            documents.append(
                chunk["text"]
            )

            metadatas.append(
                {
                    "page": chunk["page"],
                    "source": filename
                }
            )

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def total_chunks(self):

        return self.collection.count()