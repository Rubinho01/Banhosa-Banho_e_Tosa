"""RN-02: agenda não pode ter horários sobrepostos para o mesmo profissional.

Também puramente unitário — ExistingBooking é um dataclass simples,
sem tocar em banco de dados.
"""
from datetime import time

import pytest

from app.core.exceptions import ConflictError, ValidationError
from app.services.availability_service import (
    ExistingBooking,
    assert_no_conflict,
    assert_within_business_hours,
)


def test_no_conflict_when_no_existing_bookings() -> None:
    assert_no_conflict(time(10, 0), 60, existing_bookings=[])  # não deve levantar


def test_no_conflict_when_bookings_dont_overlap() -> None:
    existing = [ExistingBooking(id="1", start_time=time(9, 0), duration_minutes=60)]  # 09:00-10:00
    assert_no_conflict(time(10, 0), 60, existing)  # 10:00-11:00, começa exatamente quando o outro acaba


def test_conflict_when_new_booking_starts_during_existing() -> None:
    existing = [ExistingBooking(id="1", start_time=time(9, 0), duration_minutes=60)]  # 09:00-10:00
    with pytest.raises(ConflictError):
        assert_no_conflict(time(9, 30), 30, existing)  # 09:30-10:00, dentro do existente


def test_conflict_when_new_booking_fully_contains_existing() -> None:
    existing = [ExistingBooking(id="1", start_time=time(9, 30), duration_minutes=15)]  # 09:30-09:45
    with pytest.raises(ConflictError):
        assert_no_conflict(time(9, 0), 120, existing)  # 09:00-11:00, engloba o existente


def test_conflict_with_double_duration_large_pet() -> None:
    """Caso realista: tosador com um Banho às 9h para um pet Grande (RN-01
    dobra para 120min, terminando às 11h) — um novo agendamento às 10h30
    deve ser recusado, mesmo que o horário "pareça" livre à primeira vista."""
    existing = [ExistingBooking(id="1", start_time=time(9, 0), duration_minutes=120)]
    with pytest.raises(ConflictError):
        assert_no_conflict(time(10, 30), 45, existing)


def test_within_business_hours_ok() -> None:
    assert_within_business_hours(time(9, 0), 60)  # não deve levantar


def test_outside_business_hours_raises_validation_error() -> None:
    with pytest.raises(ValidationError):
        assert_within_business_hours(time(18, 30), 60)  # terminaria às 19:30, após o fechamento
