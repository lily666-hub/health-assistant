from datetime import datetime
from fastapi import APIRouter, Query
from ..schemas import ApiResponse

router = APIRouter()

REPORTS: dict[str, dict] = {}

@router.get('', response_model=ApiResponse)
def list_reports(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), patient_id: str | None = None):
    items = list(REPORTS.values()) or [
        {
            "id": "r_001",
            "patient_id": patient_id or "p_001",
            "doctor_id": "u_001",
            "report_date": datetime.utcnow().isoformat(),
            "diagnosis_type": "rag",
            "risk_level": "medium",
            "confidence_score": 0.84,
            "main_diagnosis": "2型糖尿病倾向",
            "differential_diagnosis": ["代谢综合征"],
            "recommendations": [],
            "similar_cases": [],
            "evidence": [],
            "reasoning_process": "基于指标与向量检索的综合判断",
            "status": "reviewed",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
    ]
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]
    data = {
        "items": page_items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1)//page_size,
    }
    return ApiResponse(success=True, data=data, timestamp=datetime.utcnow().isoformat())

@router.get('/{id}', response_model=ApiResponse)
def get_report(id: str):
    data = REPORTS.get(id) or {
        "id": id,
        "patient_id": "p_001",
        "doctor_id": "u_001",
        "report_date": datetime.utcnow().isoformat(),
        "diagnosis_type": "rag",
        "risk_level": "medium",
        "confidence_score": 0.84,
        "main_diagnosis": "2型糖尿病倾向",
        "differential_diagnosis": ["代谢综合征"],
        "recommendations": [],
        "similar_cases": [],
        "evidence": [],
        "reasoning_process": "基于指标与向量检索的综合判断",
        "status": "reviewed",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    return ApiResponse(success=True, data=data, timestamp=datetime.utcnow().isoformat())

@router.post('', response_model=ApiResponse)
def create_report(payload: dict):
    rid = payload.get("id", "r_new")
    REPORTS[rid] = payload
    return ApiResponse(success=True, data=payload, timestamp=datetime.utcnow().isoformat())

@router.put('/{id}', response_model=ApiResponse)
def update_report(id: str, payload: dict):
    REPORTS[id] = payload
    return ApiResponse(success=True, data=payload, timestamp=datetime.utcnow().isoformat())