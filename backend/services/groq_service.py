from groq import Groq

from backend.config import GROQ_API_KEY


class GroqService:

    def __init__(self):

        self.client = Groq(
            api_key=GROQ_API_KEY
        )

    def generate_answer(
        self,
        question,
        context
    ):

        prompt = f"""
You are PaperLens AI.

Answer ONLY from the context below.

If the answer is not present, say:
"I could not find that information in the uploaded document."

Context:
{context}

Question:
{question}

Answer:
"""

        response = self.client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.2,
            max_tokens=500
        )

        return response.choices[0].message.content