import os
from django.conf import settings
from celery import shared_task
from django.apps import apps
from .utils import convert_pdf_to_html
import logging

logger = logging.getLogger(__name__)

@shared_task
def convert_pdf_to_html_task(pdf_path):
    """
    A Celery task to convert a PDF file to HTML format.
    Args:
        pdf_path (str): The file path to the PDF document to be converted.
    """
    try:
        InteractiveBook = apps.get_model('interactivebooks', 'InteractiveBook')
        book = InteractiveBook.objects.get(pdf_file__endswith=os.path.basename(pdf_path))

        # No need for output_html_path, the utility function handles directory creation
        page_html_files, combined_html_path = convert_pdf_to_html(pdf_path)

        # Store the directory relative to MEDIA_ROOT
        book.html_directory = os.path.relpath(os.path.dirname(combined_html_path), settings.MEDIA_ROOT)
        book.save()

        logger.info(f"Successfully converted PDF {pdf_path} to HTML in directory {book.html_directory}")
    except Exception as e:
        logger.error(f"Error converting PDF {pdf_path} to HTML: {e}", exc_info=True)
        raise
