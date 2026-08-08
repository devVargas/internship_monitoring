import re

from rest_framework import serializers


def validate_company_document(value):
    normalized_value = value.strip()
    cleaned = re.sub(r"[^A-Za-z0-9]", "", normalized_value).upper()

    is_cpf = len(cleaned) == 11 and cleaned.isdigit()
    is_cnpj = len(cleaned) == 14 and cleaned.isalnum()

    if not is_cpf and not is_cnpj:
        raise serializers.ValidationError("Informe um CNPJ ou CPF válido.")

    return normalized_value
