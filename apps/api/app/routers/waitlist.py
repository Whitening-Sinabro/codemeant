from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import os
from supabase import create_client, Client

router = APIRouter()

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    return create_client(url, key)


class WaitlistRequest(BaseModel):
    email: EmailStr
    source: str = "landing"


class WaitlistResponse(BaseModel):
    success: bool
    message: str


@router.post("/join", response_model=WaitlistResponse)
async def join_waitlist(request: WaitlistRequest):
    """Add email to waitlist"""
    try:
        supabase = get_supabase()

        # Check if already exists
        existing = supabase.table("waitlist").select("id").eq("email", request.email).execute()

        if existing.data:
            return WaitlistResponse(
                success=True,
                message="You're already on the list!"
            )

        # Insert new entry
        supabase.table("waitlist").insert({
            "email": request.email,
            "source": request.source
        }).execute()

        return WaitlistResponse(
            success=True,
            message="You're in! We'll reach out when beta opens."
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/count")
async def get_waitlist_count():
    """Get current waitlist count"""
    try:
        supabase = get_supabase()
        result = supabase.table("waitlist").select("id", count="exact").execute()
        return {"count": result.count or 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
