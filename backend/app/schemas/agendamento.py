from datetime import date as date_type, time as time_type

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import PortePet, StatusAgendamento


class AgendamentoCreate(BaseModel):
    """Payload de criação. O backend recalcula a duração (RN-01) e valida
    disponibilidade (RN-02) — nada disso é confiado ao cliente."""

    pet_id: str
    profissional_id: str
    service: str = Field(min_length=1, max_length=60)
    date: date_type
    start_time: time_type
    status: StatusAgendamento = StatusAgendamento.PENDENTE


class AgendamentoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    petName: str = Field(validation_alias="pet_name", serialization_alias="petName")
    tutorName: str = Field(validation_alias="tutor_name", serialization_alias="tutorName")
    service: str
    size: PortePet
    professionalName: str = Field(validation_alias="professional_name", serialization_alias="professionalName")
    date: date_type
    startTime: time_type = Field(validation_alias="start_time", serialization_alias="startTime")
    durationMinutes: int = Field(validation_alias="duration_minutes", serialization_alias="durationMinutes")
    status: StatusAgendamento
