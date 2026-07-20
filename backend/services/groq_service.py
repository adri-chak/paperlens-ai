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

You answer questions ONLY from the retrieved context.

Rules:
- Never make up information.
- If the answer isn't explicitly mentioned, reply exactly:

"I could not find that information in the uploaded document."

- Keep answers concise.
- Use bullet points whenever appropriate.

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