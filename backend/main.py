from fastapi import FastAPI

app = FastAPI(
    title="PaperLens AI",
    version="1.0.0",
    description="AI-powered Document Question Answering using RAG"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to PaperLens AI 🚀"
    }