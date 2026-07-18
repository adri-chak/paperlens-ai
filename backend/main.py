from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers.upload import router as upload_router
from backend.routers.chat import router as chat_router
from backend.routers.system import router as system_router


app = FastAPI(
    title="PaperLens AI",
    version="1.0.0",
    description="AI-powered Document Intelligence using Retrieval-Augmented Generation"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(system_router)


@app.get("/")
def home():

    return {
        "message": "PaperLens AI Backend Running 🚀"
    }