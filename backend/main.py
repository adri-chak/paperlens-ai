from pathlib import Path
import shutil

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from backend.services.pdf_service import PDFService

app = FastAPI(
    title="PaperLens AI",
    version="1.0.0"
)

UPLOAD_FOLDER = "uploads"

Path(UPLOAD_FOLDER).mkdir(exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():

    return {
        "message": "PaperLens AI Backend Running 🚀"
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):

        return {
            "error": "Only PDF files are allowed."
        }

    save_path = Path(UPLOAD_FOLDER) / file.filename

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted = PDFService.extract_text(str(save_path))

    return {
        "filename": extracted["filename"],
        "pages": len(extracted["pages"]),
        "characters": len(extracted["full_text"]),
        "preview": extracted["full_text"][:1000]
    }