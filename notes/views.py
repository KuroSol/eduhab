from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Note
from .serializers import NoteSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().order_by('-created_at')
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure users only get access to their own notes
        return Note.objects.filter(user=self.request.user).order_by('-created_at')
    def perform_create(self, serializer):
        # Automatically set the user to the logged-in user
        serializer.save(user=self.request.user)

