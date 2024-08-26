import os
from django.conf import settings
from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .models import InteractiveBook, Enrollment, Annotation
from .serializers import InteractiveBookSerializer, EnrollmentSerializer, AnnotationSerializer
from django.http import JsonResponse
from .tasks import convert_pdf_to_html_task 
import fitz  # Import if using directly in the view
import logging

logger = logging.getLogger(__name__)

class InteractiveBookViewSet(viewsets.ModelViewSet):
    queryset = InteractiveBook.objects.order_by('-created_at')
    serializer_class = InteractiveBookSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_context(self):
        """Ensures the serializer has access to the request object"""
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        }

    def perform_create(self, serializer):
        """Override to use the request object directly from the context"""
        serializer.save()

    @action(detail=True, methods=['post'])
    def convert_pdf_to_html(self, request, pk=None):
        book = self.get_object()
        pdf_file_path = book.pdf_file.path
        if not pdf_file_path:
            return Response({"error": "PDF file not found"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            html_file_name = f"{book.title.replace(' ', '_')}_content.html"
            html_file_path = os.path.join(settings.MEDIA_ROOT, 'html', html_file_name)
            convert_pdf_to_html_task.delay(pdf_file_path, html_file_path)
            return Response({"message": "Conversion started"}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            logger.error(f"Error during conversion: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='list-html-pages')
    def list_html_pages(self, request, pk=None):
        book = self.get_object()
        directory_path = os.path.join(settings.MEDIA_ROOT, book.html_directory)

        if not os.path.exists(directory_path):
            return Response({"error": "Directory not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            html_files = [f for f in os.listdir(directory_path) if f.endswith('.html')]
            html_files.sort()  # Ensure files are returned in a consistent order
            # Build absolute URLs for each HTML file
            pages_urls = [request.build_absolute_uri(settings.MEDIA_URL + os.path.join(book.html_directory, f)) for f in html_files]
            return JsonResponse({'pages': pages_urls})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.none()  # Safe default for migrations
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Only return enrollments for the currently authenticated user.
        """
        if self.request is None:
            return Enrollment.objects.none()
        return Enrollment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        book_id = self.request.data.get('book')
        book = InteractiveBook.objects.get(id=book_id)
        serializer.save(user=self.request.user, book=book)

    @action(detail=False, methods=['post'])
    def enroll(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        book = serializer.validated_data['book']
        user = request.user
        if Enrollment.objects.filter(user=user, book=book).exists():
            return Response({"message": "User is already enrolled in this book"}, status=status.HTTP_409_CONFLICT)
        serializer.save(user=user, book=book)
        return Response({"message": "User successfully enrolled in book"}, status=status.HTTP_201_CREATED)

class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]
