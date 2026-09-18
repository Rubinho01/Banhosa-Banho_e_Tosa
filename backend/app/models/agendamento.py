import uuid
from datetime import date as date_type, datetime, time as time_type

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Date, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import StatusAgendamento


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    pet_id: Mapped[str] = mapped_column(ForeignKey("pets.id", ondelete="RESTRICT"), nullable=False)
    profissional_id: Mapped[str] = mapped_column(ForeignKey("profissionais.id", ondelete="RESTRICT"), nullable=False)

    service: Mapped[str] = mapped_column(String(60), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    start_time: Mapped[time_type] = mapped_column(Time, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[StatusAgendamento] = mapped_column(
        Enum(
            StatusAgendamento,
            name="status_agendamento",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        default=StatusAgendamento.PENDENTE,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    pet: Mapped["Pet"] = relationship(back_populates="agendamentos")
    profissional: Mapped["Profissional"] = relationship(back_populates="agendamentos")

    # Propriedades de conveniência para o schema AgendamentoRead, que
    # espelha o formato "achatado" (denormalizado) esperado pelo frontend.
    @property
    def pet_name(self) -> str:
        return self.pet.name if self.pet else ""

    @property
    def tutor_name(self) -> str:
        return self.pet.tutor.name if self.pet and self.pet.tutor else ""

    @property
    def professional_name(self) -> str:
        return self.profissional.name if self.profissional else ""

    @property
    def size(self):  # PortePet, evitando import circular no type hint
        return self.pet.size if self.pet else None
