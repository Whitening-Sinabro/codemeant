from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from app.services.supabase_client import get_supabase_client

router = APIRouter()


class CreditBalance(BaseModel):
    balance: int
    user_id: str


class CreditTransaction(BaseModel):
    id: str
    amount: int
    balance_after: int
    type: str
    reference_id: str | None
    created_at: str


async def get_current_user_id(authorization: str = Header(...)) -> str:
    """Bearer 토큰에서 사용자 ID 추출"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization[7:]
    # TODO: Supabase JWT 검증
    # 임시로 토큰을 user_id로 사용
    return token


@router.get("", response_model=CreditBalance)
async def get_credits(user_id: str = Depends(get_current_user_id)):
    """현재 크레딧 잔액 조회"""
    supabase = get_supabase_client()

    result = supabase.table("credits").select("balance").eq("user_id", user_id).single().execute()

    if not result.data:
        # 신규 사용자 - 기본 크레딧 생성
        supabase.table("credits").insert({"user_id": user_id, "balance": 0}).execute()
        return CreditBalance(balance=0, user_id=user_id)

    return CreditBalance(balance=result.data["balance"], user_id=user_id)


@router.get("/transactions", response_model=list[CreditTransaction])
async def get_transactions(
    user_id: str = Depends(get_current_user_id),
    limit: int = 20,
):
    """크레딧 거래 내역 조회"""
    supabase = get_supabase_client()

    result = (
        supabase.table("credit_transactions")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return result.data or []
