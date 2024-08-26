import os
import uuid
from django.utils.text import slugify
from django.db import models
from django.conf import settings
from .tasks import convert_pdf_to_html_task
import logging

logger = logging.getLogger(__name__)

def unique_file_path(instance, filename):
    # Extract extension and base file name
    base, ext = os.path.splitext(filename)
    # Slugify the original filename to make it URL and filesystem safe
    safe_base = slugify(base)
    # Generate a unique ID
    unique_id = uuid.uuid4()

    # Determine the directory based on the type of file
    if isinstance(instance, InteractiveBook):
        if 'pdf' in ext.lower():
            base_dir = 'interactivebooks/pdfs/'
        else:
            base_dir = 'interactivebooks/bookCovers/'
    else:
        base_dir = 'interactivebooks/uploads/'  # Default for other types if extended

    # Create the new filename with a unique ID and the original name
    new_filename = f"{unique_id}-{safe_base}{ext}"
    # Return the full path where the file should be saved
    return os.path.join(base_dir, new_filename)

class InteractiveBook(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pdf_file = models.FileField(upload_to=unique_file_path)  # Use unique_file_path for PDFs
    cover_image = models.ImageField(upload_to=unique_file_path, null=True, blank=True)  # Also use unique_file_path for images
    isbn = models.CharField(max_length=20, unique=True)
    publisher = models.CharField(max_length=100)
    language = models.CharField(max_length=30)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    html_file = models.FileField(upload_to='interactivebooks/html/', null=True, blank=True)  # HTML file path
    html_directory = models.CharField(max_length=255, blank=True, null=True)  # Path to the directory containing HTML files

    def start_conversion(self):
        logger.info("Starting conversion...")
        if not self.pdf_file:
            logger.error("No PDF file available for conversion.")
            return

        # Trigger the conversion task without needing to specify paths
        convert_pdf_to_html_task.delay(self.pdf_file.path)
        logger.info(f"Conversion task started for {self.pdf_file.path}")

    def __str__(self):
        return f"{self.title} by {self.author} (ISBN: {self.isbn})"
    
class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(InteractiveBook, on_delete=models.CASCADE, related_name='enrollments')

    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} enrolled in {self.book.title}"
    
class Annotation(models.Model):
    book = models.ForeignKey('InteractiveBook', on_delete=models.CASCADE, related_name='annotations')
    page_number = models.IntegerField()
    data = models.JSONField()  # Now using the built-in JSONField

    def __str__(self):
        return f"Annotation on page {self.page_number} of {self.book.title}"