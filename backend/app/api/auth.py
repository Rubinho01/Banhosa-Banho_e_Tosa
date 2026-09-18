from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.auth import LoginRequest, TokenResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    token = auth_service.authenticate(db, payload)
    return TokenResponse(access_token=token)


@router.get("/me")
def read_current_user(current_user: CurrentUser) -> dict:
    return {"username": current_user.username, "active": current_user.active}
