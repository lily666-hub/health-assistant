from datetime import datetime
from fastapi import APIRouter, Query, HTTPException
from ..schemas import ApiResponse, PaginatedResponse, Patient

router = APIRouter()

# 简单内存数据
PATIENTS: dict[str, Patient] = {}

def _demo_patient(pid: str) -> Patient:
    return Patient(
        id=pid,
        name="张三",
        gender="male",
        age=42,
        created_at=datetime.utcnow().isoformat(),
        updated_at=datetime.utcnow().isoformat(),
    )

@router.get('', response_model=ApiResponse)
def list_patients(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), search: str | None = None):
    if not PATIENTS:
        PATIENTS["p_001"] = _demo_patient("p_001")
        PATIENTS["p_002"] = _demo_patient("p_002")

    items = list(PATIENTS.values())
    if search:
        items = [p for p in items if search in p.name]
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]
    data = PaginatedResponse(items=[i.model_dump() for i in page_items], total=total, page=page, page_size=page_size, total_pages=(total + page_size - 1)//page_size)
    return ApiResponse(success=True, data=data.model_dump(), timestamp=datetime.utcnow().isoformat())

@router.get('/{id}', response_model=ApiResponse)
def get_patient(id: str):
    patient = PATIENTS.get(id) or _demo_patient(id)
    return ApiResponse(success=True, data=patient.model_dump(), timestamp=datetime.utcnow().isoformat())

@router.post('', response_model=ApiResponse)
def create_patient(payload: Patient):
    PATIENTS[payload.id] = payload
    return ApiResponse(success=True, data=payload.model_dump(), timestamp=datetime.utcnow().isoformat())

@router.put('/{id}', response_model=ApiResponse)
def update_patient(id: str, payload: dict):
    if id not in PATIENTS:
        raise HTTPException(status_code=404, detail="Patient not found")
    current = PATIENTS[id].model_dump()
    current.update(payload)
    PATIENTS[id] = Patient(**current)
    return ApiResponse(success=True, data=PATIENTS[id].model_dump(), timestamp=datetime.utcnow().isoformat())

@router.delete('/{id}', response_model=ApiResponse)
def delete_patient(id: str):
    PATIENTS.pop(id, None)
    return ApiResponse(success=True, data=None, timestamp=datetime.utcnow().isoformat())