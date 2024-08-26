from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import get_resolver
import logging

# Set up a logger
logger = logging.getLogger(__name__)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    path('api/interactivebooks/', include('interactivebooks.urls')),
    path('api/notes/', include('notes.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Log all registered URL patterns
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

for pattern in get_resolver().url_patterns:
    logger.debug(f"Registered URL pattern: {pattern}")