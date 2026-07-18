from fastapi import APIRouter

from backend.core.services import (
    vector_db,
)

from backend.config import (
    EMBEDDING_MODEL,
    GROQ_MODEL,
)

router = APIRouter(tags=["System"])


@router.get("/health")
def health():

    return {
        "status": "healthy",
        "database": "connected",
        "embedding_model": "loaded",
        "llm": "connected"
    }


@router.get("/version")
def version():

    return {
        "project": "PaperLens AI",
        "version": "1.0.0",
        "author": "Adrija Chakraborty"
    }


@router.get("/stats")
def stats():

    return {
        "documents": vector_db.total_documents(),
        "vectors": vector_db.total_chunks(),
        "embedding_model": EMBEDDING_MODEL,
        "llm": GROQ_MODEL
    }