from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, credits, analysis, webhooks

app = FastAPI(
    title="CodeMeant API",
    description="바이브코더를 위한 프로젝트 가치 분석 서비스",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://codemeant.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(credits.router, prefix="/api/v1/credits", tags=["credits"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
