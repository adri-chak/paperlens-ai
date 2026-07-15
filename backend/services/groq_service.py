from groq import Groq

from backend.config import (
    GROQ_API_KEY,
    GROQ_MODEL,
    TEMPERATURE,
    MAX_OUTPUT_TOKENS,
)


class GroqService:

    def __init__(self):
        self.client = Groq(
            api_key=GROQ_API_KEY
        )

    def generate_answer(self, question: str, context: str):

        prompt = f"""
You are PaperLens AI.

You answer questions ONLY using the provided document context.

Rules:
1. Never use outside knowledge.
2. If the answer is not found in the context, reply:
   "I could not find that information in the uploaded document."
3. Keep answers concise and accurate.
4. If appropriate, answer using bullet points.

Context:
{context}

Question:
{question}

Answer:
"""

        response = self.client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_OUTPUT_TOKENS,
        )

        return response.choices[0].message.content