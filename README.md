# 📄 PaperLens AI

<div align="center">

### 🔍 AI-Powered Document Intelligence using Retrieval-Augmented Generation (RAG)

Upload any PDF, ask questions in natural language, and receive context-aware answers powered by semantic search and Groq LLMs.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)
![Groq](https://img.shields.io/badge/Groq-LLM-orange)
![ChromaDB](https://img.shields.io/badge/ChromaDB-VectorDB-red)
![SentenceTransformers](https://img.shields.io/badge/SentenceTransformers-Embeddings-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

# 🌟 Overview

PaperLens AI is an intelligent document question-answering system that enables users to upload PDF documents and interact with them using natural language.

Instead of keyword matching, PaperLens AI performs **semantic search** using vector embeddings to retrieve the most relevant document sections before generating an answer with a Large Language Model (LLM).

The project demonstrates a complete **Retrieval-Augmented Generation (RAG)** pipeline built with modern AI engineering tools.

---

# ✨ Features

- 📄 Upload PDF documents
- 🔍 Automatic text extraction
- ✂️ Intelligent document chunking
- 🧠 Sentence Transformer embeddings
- 📚 ChromaDB vector database
- 🔎 Semantic similarity search
- 🤖 Groq Llama 3.3 integration
- 💬 AI-powered conversational interface
- 📑 Source citation for every answer
- 🌙 Dark & ☀️ Light themes
- 🎨 Modern animated UI
- ⚡ FastAPI backend
- 📖 Interactive Swagger API documentation

---

# 🏗️ System Architecture

```
                User

                  │

                  ▼

          Upload PDF Document

                  │

                  ▼

          PDF Text Extraction

                  │

                  ▼

          Intelligent Chunking

                  │

                  ▼

      Sentence Transformer Model

                  │

                  ▼

          Vector Embeddings

                  │

                  ▼

            ChromaDB Storage

                  │

                  ▼

          User asks a question

                  │

                  ▼

         Semantic Vector Search

                  │

                  ▼

      Relevant Context Retrieved

                  │

                  ▼

          Groq Llama 3.3 LLM

                  │

                  ▼

      Context-aware Final Answer
```

---

# 🧠 Tech Stack

## Backend

- FastAPI
- Pydantic
- Uvicorn

## AI

- Groq API
- Llama 3.3 70B Versatile
- Sentence Transformers
- all-MiniLM-L6-v2

## Vector Database

- ChromaDB

## PDF Processing

- PyPDF

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript

---

# 📂 Project Structure

```
PaperLens-AI/

│
├── backend/
│
│   ├── routers/
│   │     ├── upload.py
│   │     └── chat.py
│   │
│   ├── services/
│   │     ├── pdf_service.py
│   │     ├── chunker.py
│   │     ├── embedding_service.py
│   │     ├── chroma_service.py
│   │     ├── retriever.py
│   │     └── groq_service.py
│   │
│   ├── models/
│   ├── core/
│   ├── config.py
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── uploads/
├── chroma_db/
├── requirements.txt
├── README.md
└── .env
```

---

# ⚙️ Installation

## Clone the repository

```bash
git clone https://github.com/adri-chak/PaperLens-AI.git

cd PaperLens-AI
```

---

## Create Virtual Environment

```bash
python -m venv .venv
```

Activate

Windows

```bash
.venv\Scripts\activate
```

Linux / macOS

```bash
source .venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file

```env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## Run Backend

```bash
python -m uvicorn backend.main:app --reload
```

Backend

```
http://127.0.0.1:8000
```

Swagger

```
http://127.0.0.1:8000/docs
```

---

## Run Frontend

Simply open

```
frontend/index.html
```

or serve using VS Code Live Server.

---

# 📡 API Endpoints

## Upload PDF

```
POST /upload
```

Uploads a PDF, extracts text, generates embeddings and stores them in ChromaDB.

---

## Ask Questions

```
POST /chat
```

Example

```json
{
    "question": "What are the data structures used?"
}
```

Response

```json
{
    "answer":"Linked List and Priority Queue (Min Heap)"
}
```

---

# 🚀 Future Improvements

- Multi-document chat
- Conversation history
- User authentication
- PDF highlighting
- Streaming AI responses
- OCR for scanned PDFs
- Image understanding
- Citation highlighting
- Docker deployment
- Cloud storage integration

---

# 📈 Learning Outcomes

This project demonstrates practical experience with

- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Vector Databases
- Embedding Models
- Large Language Models
- REST API Development
- AI System Design
- Prompt Engineering
- FastAPI
- Production-ready Backend Development

---

# 📜 License

This project is licensed under the MIT License.

---

# 👩‍💻 Author

## Adrija Chakraborty

B.Tech Information Technology

Passionate about

- Artificial Intelligence
- Machine Learning
- Retrieval-Augmented Generation
- Agentic AI
- Deep Learning
- Computer Vision

GitHub

https://github.com/adri-chak

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

Made with ❤️ using FastAPI, ChromaDB, Sentence Transformers and Groq LLM.

</div>