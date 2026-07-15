from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.config import UPLOAD_FOLDER
from backend.services.pdf_service import PDFService
from backend.services.chunker import Chunker
from backend.services.embedding_service import EmbeddingService
from backend.services.chroma_service import ChromaService

router = APIRouter()

embedder = EmbeddingService()
vector_db = ChromaService()


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    unique_name = f"{uuid.uuid4().hex}_{file.filename}"

    save_path = UPLOAD_FOLDER / unique_name

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted = PDFService.extract_text(str(save_path))

    chunks = Chunker.create_chunks(
        extracted["pages"]
    )

    embeddings = embedder.embed_chunks(chunks)

    vector_db.add_document(
        file.filename,
        chunks,
        embeddings
    )

    return {
        "status": "success",
        "filename": file.filename,
        "pages": len(extracted["pages"]),
        "chunks_created": len(chunks),
        "stored_vectors": vector_db.total_chunks(),
        "embedding_dimension": len(embeddings[0]),
        "preview": chunks[0]["text"][:300]
    }