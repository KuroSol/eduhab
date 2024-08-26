from rest_framework import serializers
from .models import User, UserType
from django.contrib.auth import get_user_model

User = get_user_model()

class UserTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserType
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    user_types = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=UserType.objects.all(),
        required=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'user_types']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user_types_data = validated_data.pop('user_types', [])
        user = User.objects.create_user(**validated_data)
        user.user_types.set(UserType.objects.filter(name__in=user_types_data))
        user.save()
        return user

    def update(self, instance, validated_data):
        user_types_data = validated_data.pop('user_types', None)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)

        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        instance.save()

        if user_types_data:
            instance.user_types.set(UserType.objects.filter(name__in=user_types_data))
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    user_types = UserTypeSerializer(many=True, read_only=True)  # Nested for detailed view
    extra_info = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'user_types', 'extra_info']

    def get_extra_info(self, obj):
        if obj.user_types.filter(name="Teacher").exists():
            return "Information specific to teachers"
        return "General user information"
