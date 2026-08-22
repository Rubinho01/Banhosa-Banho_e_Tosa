from pydantic import BaseModel

from app.schemas.agendamento import AgendamentoRead


class DashboardTotals(BaseModel):
    appointmentsToday: int
    activeClients: int
    pets: int
    professionals: int


class DashboardResponse(BaseModel):
    totals: DashboardTotals
    appointments: list[AgendamentoRead]
