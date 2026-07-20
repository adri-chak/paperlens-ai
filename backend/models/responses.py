from pydantic import BaseModel
from typing import List


class DocumentInfo(BaseModel):
    name: str
    pages: int
    chunks: int
    embedding_dimension: int


class DatabaseInfo(BaseModel):
    documents: int
    vectors: int


class UploadResponse(BaseModel):
    status: str
    document: DocumentInfo
    database: DatabaseInfo


class SourceResponse(BaseModel):
    text: str
    page: int
    source: str

class RetrievalQuality(BaseModel):
    chunks_used: int
    average_similarity: float

class ChatResponse(BaseModel):
    question: str
    answer: str
    model: str
    retrieved_chunks: int
    response_time: float
    retrieval_quality: RetrievalQuality
    sources: list[SourceResponse]


class HealthResponse(BaseModel):
    status: str
    api: str
    version: str
    llm: str
    vector_db: str


class ErrorResponse(BaseModel):
    status: str
    message: str