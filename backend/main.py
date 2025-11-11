from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, patients, clinical, upload, diagnosis, reports, knowledge

app = FastAPI(title="Diabetes RAG Backend", version="1.0.0")

# CORS 设置：生产建议收敛到前端域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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