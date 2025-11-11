from datetime import datetime
from fastapi import APIRouter
from ..schemas import ApiResponse, ClinicalData

router = APIRouter()

CLINICALS: dict[str, list[ClinicalData]] = {}

@router.get('/patients/{patient_id}/clinical-data', response_model=ApiResponse)
def get_clinical_data(patient_id: str):
    items = CLINICALS.get(patient_id, [
        ClinicalData(
            id="cd_001",
            patient_id=patient_id,
            measurement_date=datetime.utcnow().isoformat(),
            blood_glucose_fasting=6.2,
            hba1c=6.8,
            bmi=24.5,
            blood_pressure_systolic=125,
            blood_pressure_diastolic=80,
        )
    ])
    return ApiResponse(success=True, data=[i.model_dump() for i in items], timestamp=datetime.utcnow().isoformat())

@router.post('/clinical-data', response_model=ApiResponse)
def create_clinical_data(payload: ClinicalData):
    CLINICALS.setdefault(payload.patient_id, []).append(payload)
    return ApiResponse(success=True, data=payload.model_dump(), timestamp=datetime.utcnow().isoformat())