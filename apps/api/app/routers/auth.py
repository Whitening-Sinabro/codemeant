import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# 임시 저장소 (프로덕션에서는 Redis 사용)
device_codes: dict[str, dict] = {}


class DeviceCodeRequest(BaseModel):
    client_id: str = "codemeant-cli"


class DeviceCodeResponse(BaseModel):
    device_code: str
    user_code: str
    verification_uri: str
    expires_in: int


class TokenRequest(BaseModel):
    device_code: str
    client_id: str = "codemeant-cli"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


@router.post("/device", response_model=DeviceCodeResponse)
async def create_device_code(request: DeviceCodeRequest):
    """디바이스 인증 시작 - CLI에서 호출"""
    device_code = secrets.token_urlsafe(32)
    user_code = secrets.token_hex(3).upper()  # 6자리 코드

    device_codes[device_code] = {
        "user_code": user_code,
        "client_id": request.client_id,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=15),
        "authorized": False,
        "user_id": None,
    }

    return DeviceCodeResponse(
        device_code=device_code,
        user_code=user_code,
        verification_uri="https://codemeant.dev/auth/device",
        expires_in=900,  # 15분
    )


@router.post("/device/token")
async def exchange_device_token(request: TokenRequest):
    """디바이스 코드로 토큰 교환 - CLI에서 폴링"""
    if request.device_code not in device_codes:
        raise HTTPException(status_code=400, detail="invalid_device_code")

    code_data = device_codes[request.device_code]

    if datetime.now(timezone.utc) > code_data["expires_at"]:
        del device_codes[request.device_code]
        raise HTTPException(status_code=400, detail="expired_token")

    if not code_data["authorized"]:
        raise HTTPException(status_code=400, detail="authorization_pending")

    # 인증 완료 - 토큰 발급
    # 실제로는 Supabase JWT 사용
    access_token = secrets.token_urlsafe(32)
    refresh_token = secrets.token_urlsafe(32)

    del device_codes[request.device_code]

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=3600,
    )


@router.post("/device/authorize")
async def authorize_device(user_code: str, user_id: str):
    """웹에서 디바이스 인증 승인"""
    for device_code, data in device_codes.items():
        if data["user_code"] == user_code.upper():
            if datetime.now(timezone.utc) > data["expires_at"]:
                raise HTTPException(status_code=400, detail="expired_code")

            device_codes[device_code]["authorized"] = True
            device_codes[device_code]["user_id"] = user_id
            return {"status": "authorized"}

    raise HTTPException(status_code=404, detail="invalid_user_code")
