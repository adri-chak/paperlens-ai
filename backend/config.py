from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_FOLDER = BASE_DIR / "uploads"

UPLOAD_FOLDER.mkdir(exist_ok=True)

EMBEDDING_MODEL = "all-MiniLM-L6-v2"

CHROMA_DB_PATH = BASE_DIR / "chroma_db"

TOP_K = 4