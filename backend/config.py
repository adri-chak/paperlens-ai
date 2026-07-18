from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

UPLOAD_FOLDER = DATA_DIR / "uploads"
CHROMA_DB_PATH = DATA_DIR / "chroma"

UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
CHROMA_DB_PATH.mkdir(parents=True, exist_ok=True)

# ------------------------
# Embeddings
# ------------------------

EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# ------------------------
# Chroma
# ------------------------

COLLECTION_NAME = "paperlens_documents"

# ------------------------
# Chunking
# ------------------------

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

# ------------------------
# Retrieval
# ------------------------

TOP_K_RESULTS = 5

# ------------------------
# LLM
# ------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_MODEL = "llama-3.3-70b-versatile"

TEMPERATURE = 0.2

MAX_OUTPUT_TOKENS = 1024