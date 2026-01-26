from app.services.supabase_client import get_supabase_client

ANALYSIS_COST = 5  # 분석 1회 = 5 크레딧


async def deduct_credits(user_id: str, amount: int, reference_id: str) -> int:
    """크레딧 차감 (트랜잭션 기록 포함)"""
    supabase = get_supabase_client()

    # 현재 잔액 조회
    result = supabase.table("credits").select("balance").eq("user_id", user_id).single().execute()

    if not result.data:
        raise ValueError("크레딧 계정이 없습니다.")

    current_balance = result.data["balance"]

    if current_balance < amount:
        raise ValueError(f"크레딧이 부족합니다. 현재: {current_balance}, 필요: {amount}")

    new_balance = current_balance - amount

    # 잔액 업데이트
    supabase.table("credits").update({"balance": new_balance}).eq("user_id", user_id).execute()

    # 트랜잭션 기록
    supabase.table("credit_transactions").insert({
        "user_id": user_id,
        "amount": -amount,
        "balance_after": new_balance,
        "type": "analysis",
        "reference_id": reference_id,
    }).execute()

    return new_balance


async def add_credits(user_id: str, amount: int, transaction_type: str, reference_id: str) -> int:
    """크레딧 추가 (충전/보너스)"""
    supabase = get_supabase_client()

    # 현재 잔액 조회 (없으면 생성)
    result = supabase.table("credits").select("balance").eq("user_id", user_id).single().execute()

    if not result.data:
        supabase.table("credits").insert({"user_id": user_id, "balance": 0}).execute()
        current_balance = 0
    else:
        current_balance = result.data["balance"]

    new_balance = current_balance + amount

    # 잔액 업데이트
    supabase.table("credits").update({"balance": new_balance}).eq("user_id", user_id).execute()

    # 트랜잭션 기록
    supabase.table("credit_transactions").insert({
        "user_id": user_id,
        "amount": amount,
        "balance_after": new_balance,
        "type": transaction_type,
        "reference_id": reference_id,
    }).execute()

    return new_balance
