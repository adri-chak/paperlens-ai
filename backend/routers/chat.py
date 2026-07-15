from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.retriever import Retriever
from backend.services.groq_service import GroqService

router = APIRouter()

retriever = Retriever()
groq = GroqService()


class ChatRequest(BaseModel):
    question: str


@router.post("/chat")
def chat(request: ChatRequest):

    chunks = retriever.retrieve(request.question)

    context = "\n\n".join(
        chunk["text"]
        for chunk in chunks
    )

    answer = groq.generate_answer(
        request.question,
        context
    )

    return {
        "question": request.question,
        "answer": answer,
        "sources": chunks
    }