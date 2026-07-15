from pathlib import Path
from pypdf import PdfReader


class PDFService:

    @staticmethod
    def extract_text(pdf_path: str):

        reader = PdfReader(pdf_path)

        pages = []

        full_text = ""

        for page_number, page in enumerate(reader.pages, start=1):

            text = page.extract_text()

            if text is None:
                text = ""

            pages.append(
                {
                    "page": page_number,
                    "text": text
                }
            )

            full_text += text + "\n"

        return {
            "filename": Path(pdf_path).name,
            "pages": pages,
            "full_text": full_text
        }