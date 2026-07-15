from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.config import UPLOAD_FOLDER
from backend.services.pdf_service import PDFService

router = APIRouter()


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    unique_name = f"{uuid.uuid4().hex}_{file.filename}"

    save_path = UPLOAD_FOLDER / unique_name

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted = PDFService.extract_text(str(save_path))

    return {
        "status": "success",
        "filename": file.filename,
        "stored_as": unique_name,
        "pages": len(extracted["pages"]),
        "characters": len(extracted["full_text"]),
        "preview": extracted["full_text"][:1000]
    }