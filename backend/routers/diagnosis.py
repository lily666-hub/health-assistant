from datetime import datetime
from fastapi import APIRouter
from ..schemas import ApiResponse, DiagnosisRequest, DiagnosisResponse, Recommendation, SimilarCase

router = APIRouter()

@router.post('/diagnosis', response_model=ApiResponse)
def create_diagnosis(payload: DiagnosisRequest):
    data = DiagnosisResponse(
        diagnosis_id="d_001",
        risk_assessment={
            "overall_risk": "medium",
            "risk_factors": ["family_history", "elevated_hba1c"],
            "risk_score": 0.65,
        },
        recommendations=[
            Recommendation(type="lifestyle", priority="medium", description="增加有氧运动，控制碳水摄入")
        ],
        confidence_score=0.82,
        similar_cases=[
            SimilarCase(
                case_id="c_1001",
                similarity_score=0.78,
                patient_demographics={"age": 45, "gender": "male"},
                clinical_summary="血糖偏高，家族史明显",
                diagnosis="2型糖尿病倾向",
                outcome="良好控制"
            )
        ],
        reasoning_process="根据临床指标与家族史进行风险评估",
        processing_time=0.25,
    )
    return ApiResponse(success=True, data=data.model_dump(), timestamp=datetime.utcnow().isoformat())

@router.get('/diagnosis/patient/{patient_id}', response_model=ApiResponse)
def get_diagnosis_history(patient_id: str):
    items = [
        {
            "diagnosis_id": "d_001",
            "risk_assessment": {"overall_risk": "medium", "risk_factors": ["family_history"], "risk_score": 0.62},
            "recommendations": [],
            "confidence_score": 0.8,
            "similar_cases": [],
            "reasoning_process": "示例历史记录",
            "processing_time": 0.2,
        }
    ]
    return ApiResponse(success=True, data=items, timestamp=datetime.utcnow().isoformat())