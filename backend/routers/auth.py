from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from ..schemas import LoginRequest, ApiResponse, LoginResponse, User
from ..deps import get_bearer_token

router = APIRouter()

@router.post('/login', response_model=ApiResponse)
def login(payload: LoginRequest):
    user = User(
        id="u_001",
        username=payload.username,
        email=f"{payload.username}@example.com",
        name="示例医生",
        role="doctor",
        hospital_id=payload.hospital_id,
        is_active=True,
    )
    expires_in = 3600
    data = LoginResponse(
        access_token="demo-access-token",
        refresh_token="demo-refresh-token",
        user_info=user,
        expires_in=expires_in,
    )
    return ApiResponse(success=True, data=data.model_dump(), timestamp=datetime.utcnow().isoformat())

@router.post('/logout', response_model=ApiResponse)
def logout(token: str | None = Depends(get_bearer_token)):
    return ApiResponse(success=True, data=None, timestamp=datetime.utcnow().isoformat())