from datetime import date as date_type
from datetime import time as time_type

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import PortePet, StatusAgendamento


class AgendamentoBase(BaseModel):
    """Campos comuns à criação e à remarcação. O backend recalcula a duração
    (RN-01) e valida disponibilidade (RN-02) — nada disso é confiado ao cliente."""

    pet_id: str
    profissional_id: str
    service: str = Field(min_length=1, max_length=60)
    date: date_type
    start_time: time_type

    @field_validator("start_time")
    @classmethod
    def _normalize_to_whole_minute(cls, value: time_type) -> time_type:
        # PI-04: a agenda trabalha em minutos inteiros. Segundos/microssegundos
        # são descartados aqui para que a regra em memória (RN-02), a constraint
        # EXCLUDE do banco e a checagem de "passado" enxerguem o mesmo horário.
        return value.replace(second=0, microsecond=0)


class AgendamentoCreate(AgendamentoBase):
    """Payload de criação. Não há campo de status: todo agendamento nasce
    Pendente (PI-01) e muda de status apenas por PATCH /agendamentos/{id}/status.
    Um "status" enviado por clientes antigos é ignorado."""


class AgendamentoUpdate(AgendamentoBase):
    """Payload de edição/remarcação. Passa pelas mesmas validações da
    criação (RN-01, RN-02, M02). O status muda apenas pelo endpoint
    dedicado (PATCH /agendamentos/{id}/status), preservando o histórico."""


class AgendamentoStatusUpdate(BaseModel):
    status: StatusAgendamento


class AgendamentoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    # IDs de referência: permitem ao frontend pré-preencher a tela de edição.
    petId: str = Field(validation_alias="pet_id", serialization_alias="petId")
    professionalId: str = Field(validation_alias="profissional_id", serialization_alias="professionalId")
    petName: str = Field(validation_alias="pet_name", serialization_alias="petName")
    tutorName: str = Field(validation_alias="tutor_name", serialization_alias="tutorName")
    service: str
    size: PortePet
    professionalName: str = Field(
        validation_alias="professional_name", serialization_alias="professionalName"
    )
    date: date_type
    startTime: time_type = Field(validation_alias="start_time", serialization_alias="startTime")
    durationMinutes: int = Field(validation_alias="duration_minutes", serialization_alias="durationMinutes")
    status: StatusAgendamento
