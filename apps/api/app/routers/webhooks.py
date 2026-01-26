import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel

from app.config import get_settings
from app.services.credits import add_credits

router = APIRouter()

# 크레딧 팩 매핑
CREDIT_PACKS = {
    "starter": 50,
    "basic": 150,
    "pro": 500,
}


class PolarWebhookEvent(BaseModel):
    type: str
    data: dict


def verify_polar_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Polar 웹훅 서명 검증"""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)


@router.post("/polar")
async def handle_polar_webhook(
    request: Request,
    x_polar_signature: str = Header(None, alias="X-Polar-Signature"),
):
    """Polar 결제 웹훅 처리"""
    settings = get_settings()

    # 웹훅 페이로드 읽기
    payload = await request.body()

    # 서명 검증 (프로덕션에서만)
    if settings.polar_webhook_secret and x_polar_signature:
        if not verify_polar_signature(payload, x_polar_signature, settings.polar_webhook_secret):
            raise HTTPException(status_code=401, detail="Invalid signature")

    # 이벤트 파싱
    import json
    event_data = json.loads(payload)
    event_type = event_data.get("type")

    # 결제 완료 이벤트 처리
    if event_type == "order.paid":
        await handle_order_paid(event_data.get("data", {}))
    elif event_type == "subscription.created":
        await handle_subscription_created(event_data.get("data", {}))

    return {"status": "ok"}


async def handle_order_paid(data: dict):
    """주문 결제 완료 처리"""
    user_id = data.get("customer_metadata", {}).get("user_id")
    product_id = data.get("product_id")
    order_id = data.get("id")

    if not user_id:
        # 메타데이터에서 이메일로 사용자 찾기
        customer_email = data.get("customer", {}).get("email")
        if customer_email:
            from app.services.supabase_client import get_supabase_client
            supabase = get_supabase_client()
            result = supabase.table("profiles").select("id").eq("email", customer_email).single().execute()
            if result.data:
                user_id = result.data["id"]

    if not user_id:
        return  # 사용자 찾을 수 없음

    # 상품에 따라 크레딧 추가
    # product_id는 Polar에서 설정한 상품 ID
    credits_to_add = CREDIT_PACKS.get(product_id, 0)

    if credits_to_add > 0:
        await add_credits(
            user_id=user_id,
            amount=credits_to_add,
            transaction_type="purchase",
            reference_id=f"polar:{order_id}",
        )


async def handle_subscription_created(data: dict):
    """구독 생성 처리 (향후 확장)"""
    pass
