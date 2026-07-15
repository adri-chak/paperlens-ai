from backend.config import CHUNK_SIZE, CHUNK_OVERLAP


class Chunker:

    @staticmethod
    def create_chunks(pages):

        chunks = []

        for page in pages:

            text = page["text"]

            page_number = page["page"]

            start = 0

            while start < len(text):

                end = start + CHUNK_SIZE

                chunk = text[start:end]

                chunks.append(
                    {
                        "text": chunk,
                        "page": page_number
                    }
                )

                start += CHUNK_SIZE - CHUNK_OVERLAP

        return chunks