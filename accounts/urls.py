# accounts/urls.py
from django.urls import path, include
from .views import (UserViewSet, UserTypeViewSet, LoginView, UserProfileView, LogoutView, PasswordResetConfirm, PasswordResetRequestView)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'usertypes', UserTypeViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('', include(router.urls)),
    path('password_reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password_reset/confirm/<uidb64>/<token>/', PasswordResetConfirm.as_view(), name='password_reset_confirm'),
]
