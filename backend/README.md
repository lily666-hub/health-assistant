# 糖尿病 RAG 后端服务（FastAPI）

## 启动
- 安装依赖：`pip install -r backend/requirements.txt`
- 本地启动：`uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`

前端已配置 `VITE_API_BASE_URL=/api`，请在反向代理中将 `/api` 转发到该服务的 `http://<host>:8000/api`。

## 路由概览（与前端完全匹配）
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/patients`
- `GET /api/patients/{id}`
- `POST /api/patients`
- `PUT /api/patients/{id}`
- `DELETE /api/patients/{id}`
- `GET /api/patients/{patient_id}/clinical-data`
- `POST /api/clinical-data`
- `POST /api/upload`
- `POST /api/diagnosis`
- `GET /api/diagnosis/patient/{patient_id}`
- `GET /api/reports`
- `GET /api/reports/{id}`
- `POST /api/reports`
- `PUT /api/reports/{id}`
- `GET /api/knowledge/categories`
- `GET /api/knowledge/search`

## 生产部署建议
- 采用同域反向代理：前端域名 `https://app.example.com`，反向代理 `/api` 到后端 `http://backend:8000/api`
- 启用 CORS（已在代码中设置为允许同源及常见跨域开发场景）
- 日志与监控：建议搭配 `uvicorn --access-log`、反向代理层记录访问日志