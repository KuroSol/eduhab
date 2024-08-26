from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InteractiveBookViewSet, EnrollmentViewSet, AnnotationViewSet

router = DefaultRouter()
router.register(r'interactivebooks', InteractiveBookViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'annotations', AnnotationViewSet)

list_html_pages = InteractiveBookViewSet.as_view({
    'get': 'list_html_pages',
})

urlpatterns = [
    path('', include(router.urls)),
    path('interactivebooks/<int:pk>/list-html-pages/', list_html_pages, name='interactivebook-list-html-pages'),
]
