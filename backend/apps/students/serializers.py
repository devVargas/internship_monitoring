from rest_framework import serializers
from .models import Student, Documents, DocActivity


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'


class DocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documents
        fields = '__all__'
        read_only_fields = ['documents_id', 'server_timestamp']


class DocActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocActivity
        fields = '__all__'
        read_only_fields = ['doc_activity_id', 'server_timestamp'] 