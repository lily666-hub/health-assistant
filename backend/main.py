import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, patients, clinical, upload, diagnosis, reports, knowledge

app = FastAPI(title="Diabetes RAG Backend", version="1.0.0")

# CORS 设置：从环境变量读取，生产建议收敛到前端域名
# CORS_ALLOW_ORIGINS 支持逗号分隔多个域，例如：
# "https://health-assistant.vercel.app,http://localhost:5173,http://localhost:4173"
# 可选：CORS_ALLOW_ORIGIN_REGEX 支持预览域名的正则，例如：
# "^https://health-assistant-git-.*\\.vercel\\.app$"
origins_env = os.getenv("CORS_ALLOW_ORIGINS", "*")
origin_regex_env = os.getenv("CORS_ALLOW_ORIGIN_REGEX", "")

allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
allow_origin_regex = origin_regex_env.strip() or None

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins if allow_origins != ["*"] else ["*"],
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由前缀 /api 保持与前端一致
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(clinical.router, prefix="/api", tags=["clinical"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(diagnosis.router, prefix="/api", tags=["diagnosis"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["knowledge"])
