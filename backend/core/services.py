from backend.services.embedding_service import EmbeddingService
from backend.services.chroma_service import ChromaService
from backend.services.groq_service import GroqService

embedding_service = EmbeddingService()

vector_db = ChromaService()

groq_service = GroqService()