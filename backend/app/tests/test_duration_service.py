"""RN-01: a duração do atendimento dobra para portes Grande e Gigante.

Teste puramente unitário: nenhuma dependência de banco de dados,
HTTP ou fixture — só chama a função de serviço diretamente.
"""
import pytest

from app.core.exceptions import ValidationError
from app.models.enums import PortePet
from app.services.duration_service import calculate_duration_minutes


@pytest.mark.parametrize(
    "size,expected_multiplier",
    [
        (PortePet.PEQUENO, 1),
        (PortePet.MEDIO, 1),
        (PortePet.GRANDE, 2),
        (PortePet.GIGANTE, 2),
    ],
)
def test_duration_multiplier_by_size(size: PortePet, expected_multiplier: int) -> None:
    base_minutes = 60  # "Banho"
    duration = calculate_duration_minutes("Banho", size)
    assert duration == base_minutes * expected_multiplier


def test_duration_uses_correct_base_per_service() -> None:
    assert calculate_duration_minutes("Tosa higiênica", PortePet.PEQUENO) == 45
    assert calculate_duration_minutes("Tosa higiênica", PortePet.GRANDE) == 90
    assert calculate_duration_minutes("Consulta veterinária", PortePet.MEDIO) == 30
    assert calculate_duration_minutes("Consulta veterinária", PortePet.GIGANTE) == 60


def test_unknown_service_raises_validation_error() -> None:
    with pytest.raises(ValidationError):
        calculate_duration_minutes("Serviço inexistente", PortePet.PEQUENO)
