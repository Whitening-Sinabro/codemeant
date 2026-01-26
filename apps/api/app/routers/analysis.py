import asyncio
from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel

from app.services.supabase_client import get_supabase_client
from app.services.credits import deduct_credits, ANALYSIS_COST
from app.services.ai_analyzer import get_ai_analyzer

router = APIRouter()


class AnalysisRequest(BaseModel):
    project_name: str
    tech_stack: dict | None = None
    file_tree: dict | None = None
    dependencies: dict | None = None
    readme_content: str | None = None


class AnalysisResponse(BaseModel):
    id: str
    status: str
    message: str


class AnalysisResult(BaseModel):
    id: str
    project_name: str
    status: str
    price_estimation: dict | None = None
    sales_strategy: dict | None = None
    credits_used: int
    created_at: str


async def get_current_user_id(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    return authorization[7:]


@router.post("", response_model=AnalysisResponse)
async def create_analysis(
    request: AnalysisRequest,
    user_id: str = Depends(get_current_user_id),
):
    """분석 요청 생성"""
    supabase = get_supabase_client()

    # 크레딧 확인 및 차감
    try:
        await deduct_credits(user_id, ANALYSIS_COST, f"analysis:{request.project_name}")
    except ValueError as e:
        raise HTTPException(status_code=402, detail=str(e))

    # 분석 레코드 생성
    result = (
        supabase.table("analyses")
        .insert({
            "user_id": user_id,
            "project_name": request.project_name,
            "tech_stack": request.tech_stack,
            "file_tree": request.file_tree,
            "dependencies": request.dependencies,
            "status": "pending",
            "credits_used": ANALYSIS_COST,
        })
        .execute()
    )

    analysis_id = result.data[0]["id"]

    # 백그라운드에서 AI 분석 실행
    asyncio.create_task(run_analysis(analysis_id, {
        "tech_stack": request.tech_stack,
        "file_tree": request.file_tree,
        "dependencies": request.dependencies,
        "readme_content": request.readme_content,
    }))

    return AnalysisResponse(
        id=analysis_id,
        status="processing",
        message="분석이 시작되었습니다. 잠시 후 결과를 확인하세요.",
    )


async def run_analysis(analysis_id: str, metadata: dict):
    """백그라운드에서 AI 분석 실행"""
    supabase = get_supabase_client()

    try:
        # 상태 업데이트: processing
        supabase.table("analyses").update({"status": "processing"}).eq("id", analysis_id).execute()

        # AI 분석 실행
        analyzer = get_ai_analyzer()
        result = await analyzer.analyze(metadata)

        # 결과 저장
        supabase.table("analyses").update({
            "status": "completed",
            "price_estimation": result.get("price_estimation"),
            "sales_strategy": result.get("sales_strategy"),
        }).eq("id", analysis_id).execute()

    except Exception as e:
        # 실패 기록
        supabase.table("analyses").update({
            "status": "failed",
            "error_message": str(e),
        }).eq("id", analysis_id).execute()


@router.get("/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(
    analysis_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """분석 결과 조회"""
    supabase = get_supabase_client()

    result = (
        supabase.table("analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="분석을 찾을 수 없습니다.")

    return AnalysisResult(**result.data)


@router.get("", response_model=list[AnalysisResult])
async def list_analyses(
    user_id: str = Depends(get_current_user_id),
    limit: int = 20,
):
    """분석 히스토리 조회"""
    supabase = get_supabase_client()

    result = (
        supabase.table("analyses")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return result.data or []
