from django.conf import settings
from rest_framework import serializers
from .models import InteractiveBook, Enrollment, Annotation

# Assuming you have a function to get the user model
from django.contrib.auth import get_user_model
User = get_user_model()

class EnrollmentSerializer(serializers.ModelSerializer):
    book_details = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['user', 'book', 'enrolled_at', 'book_details']
        read_only_fields = ['user', 'book_details']

    def get_book_details(self, obj):
        return {
            'title': obj.book.title,
            'author': obj.book.author.username,
            'pdf_file': obj.book.pdf_file.url if obj.book.pdf_file else None,
            'html_file': obj.book.html_file.url if obj.book.html_file else None,
            'cover_image': obj.book.cover_image.url if obj.book.cover_image else None,
            'html_directory': settings.MEDIA_URL + obj.book.html_directory if obj.book.html_directory else None
            #'html_directory': obj.book.html_directory  # Include directory path
        }

class InteractiveBookSerializer(serializers.ModelSerializer):
    enrollments = EnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = InteractiveBook
        fields = '__all__'  # This will expose all fields but we control critical fields in the serializer methods
        read_only_fields = ['author', 'html_file']  # Make 'author' and 'html_file' read-only to prevent them from being set through API

    def create(self, validated_data):
        # Automatically set the author to the current user and prepare HTML conversion
        validated_data['author'] = self.context['request'].user
        instance = super().create(validated_data)
        instance.start_conversion()  # Assuming this method handles HTML file creation
        return instance

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = '__all__'

