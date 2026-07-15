from pathlib import Path
import fitz  # PyMuPDF


class PDFService:

    @staticmethod
    def extract_text(pdf_path: str):

        document = fitz.open(pdf_path)

        pages = []
        full_text = ""

        for page_index in range(len(document)):

            page = document.load_page(page_index)

            text = page.get_text("text")

            if not text:
                text = ""

            pages.append(
                {
                    "page": page_index + 1,
                    "text": text
                }
            )

            full_text += text + "\n"

        document.close()

        return {
            "filename": Path(pdf_path).name,
            "pages": pages,
            "full_text": full_text
        }