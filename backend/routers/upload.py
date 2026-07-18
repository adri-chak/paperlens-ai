from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.config import UPLOAD_FOLDER
from backend.models.responses import (
    UploadResponse,
    DocumentInfo,
    DatabaseInfo,
)

from backend.services.pdf_service import PDFService
from backend.services.chunker import Chunker

from backend.core.services import (
    embedding_service,
    vector_db,
)

router = APIRouter()


@router.post(
    "/upload",
    response_model=UploadResponse
)
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    unique_name = f"{uuid.uuid4().hex}_{file.filename}"

    save_path = UPLOAD_FOLDER / unique_name

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted = PDFService.extract_text(
        str(save_path)
    )

    chunks = Chunker.create_chunks(
        extracted["pages"]
    )

    embeddings = embedding_service.embed_chunks(
        chunks
    )

    vector_db.add_document(
        file.filename,
        chunks,
        embeddings
    )

    return UploadResponse(
        status="success",
        document=DocumentInfo(
            name=file.filename,
            pages=len(extracted["pages"]),
            chunks=len(chunks),
            embedding_dimension=len(embeddings[0])
        ),
        database=DatabaseInfo(
            documents=1,
            vectors=vector_db.total_chunks()
        )
    )