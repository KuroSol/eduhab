import os
import subprocess
import logging
from django.conf import settings
from pathlib import Path
from PyPDF2 import PdfReader
import uuid
from django.utils.text import slugify

logger = logging.getLogger(__name__)

def convert_pdf_to_html(pdf_path, output_dir_path=None):
    """
    Convert a PDF file to HTML using pdf2htmlEX, both as separate HTML files for each page and as a single HTML file for the entire document.

    Args:
        pdf_path (str): The relative path to the PDF document to be converted.
        output_dir_path (str, optional): Directory where the HTML files will be saved. Defaults to a specific directory under the MEDIA_ROOT.

    Returns:
        tuple: (list of paths to the page-specific HTML files, path to the single combined HTML file)

    Raises:
        FileNotFoundError: If the input PDF file does not exist.
        PermissionError: If there's a permission issue accessing the file or directory.
        RuntimeError: If the pdf2htmlEX conversion fails.
    """
    pdf2htmlEX_path = '/usr/local/bin/pdf2htmlEX'
    absolute_pdf_path = Path(settings.MEDIA_ROOT) / pdf_path

    if not absolute_pdf_path.is_file():
        raise FileNotFoundError(f"PDF file not found: {absolute_pdf_path}")

    # Generate a unique directory name with slugified title and uuid
    base_name = slugify(absolute_pdf_path.stem)
    unique_dir_name = f"{base_name}-{uuid.uuid4()}"

    # Ensure the output directory is directly under 'interactivebooks/html'
    output_dir = Path(settings.MEDIA_ROOT) / 'interactivebooks' / 'html' / unique_dir_name
    output_dir.mkdir(parents=True, exist_ok=True)

    combined_html_path = output_dir / f"{unique_dir_name}.html"

    original_dir = os.getcwd()
    os.chdir('/')

    reader = PdfReader(absolute_pdf_path)
    total_pages = len(reader.pages)
    page_html_files = []

    for page_number in range(1, total_pages + 1):
        page_html_path = output_dir / f"{unique_dir_name}_page_{page_number}.html"
        page_command = [
            pdf2htmlEX_path,
            '--embed-css', '1',
            '--embed-javascript', '1',
            '--embed-image', '1',
            '--embed-font', '1',
            '--fallback', '1',
            '--font-format', 'woff',
            '--optimize-text', '1',
            '--process-annotation', '1',
            '--printing', '1',
            '--correct-text-visibility', '1',
            '--fit-width', '1280',
            '--first-page', str(page_number),
            '--last-page', str(page_number),
            str(absolute_pdf_path),
            str(page_html_path)
        ]

        try:
            subprocess.run(page_command, check=True, capture_output=True)
            logger.info(f"Successfully converted page {page_number} of '{absolute_pdf_path}' to '{page_html_path}'")
            page_html_files.append(str(page_html_path))
        except subprocess.CalledProcessError as e:
            handle_conversion_error(e)

    full_command = [
        pdf2htmlEX_path,
        '--embed-css', '1',
        '--embed-javascript', '1',
        '--embed-image', '1',
        '--embed-font', '1',
        '--optimize-text', '1',
        '--process-annotation', '1',
        '--printing', '1',
        '--correct-text-visibility', '1',
        '--fit-width', '1280',
        str(absolute_pdf_path),
        str(combined_html_path)
    ]

    try:
        subprocess.run(full_command, check=True, capture_output=True)
        logger.info(f"Successfully converted entire PDF '{absolute_pdf_path}' to HTML '{combined_html_path}'")
    except subprocess.CalledProcessError as e:
        handle_conversion_error(e)

    os.chdir(original_dir)

    return page_html_files, str(combined_html_path)

def handle_conversion_error(e):
    logger.error("pdf2htmlEX conversion failed:")
    logger.error(f"Command: {e.cmd}")
    logger.error(f"Return code: {e.returncode}")
    logger.error(f"stdout: {e.stdout}")
    logger.error(f"stderr: {e.stderr}")
    if "Permission denied" in e.stderr.decode():
        raise PermissionError("Permission denied")
    else:
        raise RuntimeError("Conversion failed")

if __name__ == "__main__":
    # Example of converting a PDF to both single and multiple HTML files
    convert_pdf_to_html("path_to_pdf_file.pdf", "output_directory")
