from django.contrib import admin
from django.utils.html import format_html
from django.conf import settings
from pathlib import Path
from .models import InteractiveBook, Enrollment

@admin.register(InteractiveBook)
class InteractiveBookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'isbn', 'pdf_link', 'html_link', 'created_at')
    search_fields = ('title', 'author__username', 'isbn', 'publisher', 'category', 'language')
    readonly_fields = ('pdf_link', 'html_link')

    def pdf_link(self, obj):
        if obj.pdf_file:
            return format_html(f"<a href='{obj.pdf_file.url}' target='_blank'>View PDF</a>")
        return "No file available"
    pdf_link.short_description = "PDF File"

    def html_link(self, obj):
        links = []
        if obj.html_directory:
            html_folder_path = Path(settings.MEDIA_ROOT) / obj.html_directory
            for html_file in html_folder_path.glob("*.html"):
                if html_file.is_file():
                    page_web_path = html_file.relative_to(settings.MEDIA_ROOT).as_posix()
                    links.append(format_html("<a href='{}' target='_blank'>{}</a>", settings.MEDIA_URL + page_web_path, html_file.name))

        if links:
            dropdown_html = format_html(
                '<div class="dropdown-btn" style="cursor: pointer; color: blue; text-decoration: underline;">Show HTML Files</div>'
                '<div class="dropdown-content" style="display: none;">{}</div>',
                format_html("<br>".join(links))
            )
            return dropdown_html
        return "No HTML files"

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'enrolled_at', 'view_book_pdf')
    list_filter = ('book', 'enrolled_at')
    search_fields = ('user__username', 'book__title')
    autocomplete_fields = ('user', 'book')

    def view_book_pdf(self, obj):
        if obj.book.pdf_file:
            return format_html(f"<a href='{obj.book.pdf_file.url}' target='_blank'>View Book PDF</a>")
        return "No file"
    view_book_pdf.short_description = "Book PDF"
