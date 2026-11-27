"""
@file Unitários: Schemas de agendamento
@description Valida a normalização do horário para minuto inteiro (PI-04) e a
ausência de status no payload de criação (PI-01).

@type {Teste Unitário}
"""

from datetime import time

import pytest

from app.models.enums import StatusAgendamento
from app.schemas.agendamento import AgendamentoCreate, AgendamentoUpdate

BASE = {"pet_id": "p", "profissional_id": "pr", "service": "Banho", "date": "2030-01-15"}


@pytest.mark.parametrize("schema", [AgendamentoCreate, AgendamentoUpdate])
@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("09:00", time(9, 0)),
        ("09:00:00", time(9, 0)),
        ("09:00:45", time(9, 0)),
        ("09:59:59.999", time(9, 59)),
        ("18:30:01", time(18, 30)),
    ],
)
def test_start_time_is_truncated_to_the_whole_minute(schema, raw, expected):
    assert schema(**BASE, start_time=raw).start_time == expected


def test_create_payload_has_no_status_field_and_ignores_a_client_supplied_one():
    payload = AgendamentoCreate(**BASE, start_time="09:00", status=StatusAgendamento.CONCLUIDO.value)

    assert "status" not in AgendamentoCreate.model_fields
    assert not hasattr(payload, "status")
