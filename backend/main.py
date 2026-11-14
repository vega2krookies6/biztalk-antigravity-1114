import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# backend 디렉터리를 sys.path에 추가하여 routers, services, models, prompts 임포트 보장
BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# 프로젝트 루트의 .env 파일 로드
env_path = ROOT_DIR / ".env"
load_dotenv(dotenv_path=env_path)

from routers import convert

app = FastAPI(
    title="업무 말투 변환기 (BizTalk) API",
    description="일상 구어체 텍스트를 비즈니스 업무 언어로 변환하는 AI 서비스 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 미들웨어 설정 (프론트엔드와의 통신 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영 배포 환경에서는 특정 도메인으로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록 (/api/convert)
app.include_router(convert.router, prefix="/api")


# 헬스 체크 엔드포인트
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok"}


# 프론트엔드 정적 파일 서빙 (Static Files)
FRONTEND_DIR = ROOT_DIR / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/", tags=["Frontend"])
    async def serve_index():
        index_file = FRONTEND_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {
            "message": "BizTalk API Server is running.",
            "docs": "/docs",
            "health": "/health"
        }
