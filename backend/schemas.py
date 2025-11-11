from __future__ import annotations
from typing import List, Optional, Literal, Any, Dict
from pydantic import BaseModel

class User(BaseModel):
    id: str
    username: str
    email: str
    name: str
    role: Literal['doctor','admin','reviewer']
    hospital_id: str
    license_number: Optional[str] = None
    is_active: bool = True

class LoginRequest(BaseModel):
    username: str
    password: str
    hospital_id: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_info: User
    expires_in: int

class MedicalHistory(BaseModel):
    condition: str
    diagnosis_date: str
    status: Literal['active','resolved','chronic']
    notes: Optional[str] = None

class Patient(BaseModel):
    id: str
    name: str
    gender: Literal['male','female']
    age: int
    id_card: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    medical_history: Optional[List[MedicalHistory]] = None
    allergies: Optional[List[str]] = None
    created_at: str
    updated_at: str

class ClinicalData(BaseModel):
    id: str
    patient_id: str
    measurement_date: str
    blood_glucose_fasting: Optional[float] = None
    blood_glucose_postprandial: Optional[float] = None
    hba1c: Optional[float] = None
    bmi: Optional[float] = None
    blood_pressure_systolic: Optional[float] = None
    blood_pressure_diastolic: Optional[float] = None
    total_cholesterol: Optional[float] = None
    ldl_cholesterol: Optional[float] = None
    hdl_cholesterol: Optional[float] = None
    triglycerides: Optional[float] = None
    notes: Optional[str] = None
    # 兼容字段
    age: Optional[int] = None
    gender: Optional[Literal['male','female']] = None
    fasting_glucose: Optional[float] = None
    postprandial_glucose: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    family_history: Optional[bool] = None
    symptoms: Optional[List[str]] = None

class Recommendation(BaseModel):
    type: Literal['lifestyle','medication','monitoring','referral']
    priority: Literal['low','medium','high']
    description: str
    details: Optional[str] = None
    timeframe: Optional[str] = None

class SimilarCase(BaseModel):
    case_id: str
    similarity_score: float
    patient_demographics: Dict[str, Any]
    clinical_summary: str
    diagnosis: str
    outcome: str

class Evidence(BaseModel):
    type: Literal['medical_literature','clinical_guideline','similar_case']
    source: str
    relevance_score: float
    content: str
    url: Optional[str] = None

class DiagnosisRequest(BaseModel):
    patient_id: str
    clinical_data: Dict[str, Any]
    query_type: Literal['initial','follow_up','second_opinion']
    context: Optional[str] = None

class DiagnosisResponse(BaseModel):
    diagnosis_id: str
    risk_assessment: Dict[str, Any]
    recommendations: List[Recommendation]
    confidence_score: float
    similar_cases: List[SimilarCase]
    reasoning_process: str
    processing_time: float

class OCRRequest(BaseModel):
    patient_id: str
    document_type: str

class ProcessedFile(BaseModel):
    file_id: str
    original_name: str
    file_url: str
    ocr_result: Optional[Dict[str, Any]] = None
    status: Literal['pending','processing','completed','failed']
    error: Optional[str] = None

class OCRResponse(BaseModel):
    upload_id: str
    files: List[ProcessedFile]
    ocr_status: Literal['pending','processing','completed','failed']

class ApiError(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[ApiError] = None
    timestamp: str

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int