from fastapi import APIRouter

from app.api import agendamentos, auth, dashboard, pets, profissionais, tutores

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(tutores.router)
api_router.include_router(pets.router)
api_router.include_router(profissionais.router)
api_router.include_router(agendamentos.router)
api_router.include_router(dashboard.router)
