from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import Group, Permission

class UserType(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    user_types = models.ManyToManyField(UserType, blank=False)

    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        related_name='custom_user_groups',  # Unique related_name
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        related_name='custom_user_permissions',  # Unique related_name
        blank=True
    )
