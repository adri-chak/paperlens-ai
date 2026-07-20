import time

from fastapi import APIRouter
from pydantic import BaseModel

from backend.models.responses import (
    ChatResponse,
    SourceResponse,
)

from backend.config import GROQ_MODEL
from backend.services.retriever import Retriever
from backend.services.groq_service import GroqService

router = APIRouter()

retriever = Retriever()
groq = GroqService()


class ChatRequest(BaseModel):
    question: str


@router.post(
    "/chat",
    response_model=ChatResponse
)
def chat(request: ChatRequest):

    start_time = time.time()

    chunks = retriever.retrieve(request.question)

    context = "\n\n".join(
        f"""
    Source: {chunk['source']}
    Page: {chunk['page']}
    Similarity: {chunk['score']}

    {chunk['text']}
    """
        for chunk in chunks
    )

    answer = groq.generate_answer(
        request.question,
        context
    )

    elapsed = round(
        time.time() - start_time,
        2
    )

    sources = [
        SourceResponse(
            text=chunk["text"],
            page=chunk["page"],
            source=chunk["source"]
        )
        for chunk in chunks
    ]

    from backend.models.responses import (
        ChatResponse,
        SourceResponse,
        RetrievalQuality,
    )

    return ChatResponse(
    question=request.question,
    answer=answer,
    model=GROQ_MODEL,
    retrieved_chunks=len(chunks),
    response_time=elapsed,

    retrieval_quality=RetrievalQuality(
        chunks_used=len(chunks),
        average_similarity=round(
            sum(chunk["score"] for chunk in chunks) / len(chunks),
            3,
        ) if chunks else 0,
    ),

    sources=sources,
)