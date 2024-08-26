import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

def is_text_based_pdf(pdf_path):
    document = fitz.open(pdf_path)
    for page in document:
        if page.get_text("text"):
            return True
    return False

def pdf_to_text(pdf_path):
    document = fitz.open(pdf_path)
    text = ""
    for page_number in range(len(document)):
        page = document.load_page(page_number)
        text += page.get_text("text")
    return text

def text_to_html(text):
    html_content = f"<html><body><p>{text}</p></body></html>"
    return html_content

def convert_pdf_to_html(pdf_path, output_html_path):
    try:
        # Extract text directly from PDF
        text = pdf_to_text(pdf_path)

        # Convert text to HTML
        html_content = text_to_html(text)

        # Save the HTML content to a file
        with open(output_html_path, 'w') as html_file:
            html_file.write(html_content)

        logger.info(f"Successfully converted PDF {pdf_path} to HTML {output_html_path}")
        return output_html_path

    except Exception as e:
        logger.error(f"Failed to convert PDF {pdf_path} to HTML due to {e}", exc_info=True)
        raise


# def pdf_to_text_ocr(pdf_path):
#     document = fitz.open(pdf_path)
#     text = ""
#
#     for page_number in range(len(document)):
#         page = document.load_page(page_number)
#         pix = page.get_pixmap()
#         with tempfile.NamedTemporaryFile(delete=True, suffix=".png") as temp:
#             pix.save(temp.name)
#             text += pytesseract.image_to_string(Image.open(temp.name))
#             
#     return text

