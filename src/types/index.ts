// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'doctor' | 'admin' | 'reviewer';
  hospital_id: string;
  license_number?: string;
  is_active: boolean;
  created_at: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
  hospital_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_info: User;
  expires_in: number;
}

// 患者相关类型
export interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  id_card?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_history?: MedicalHistory[];
  allergies?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface MedicalHistory {
  condition: string;
  diagnosis_date: Date;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

// 临床指标类型
export interface ClinicalIndicators {
  blood_glucose: {
    fasting: number;
    postprandial: number;
    hba1c: number;
  };
  bmi: number;
  blood_pressure: {
    systolic: number;
    diastolic: number;
  };
  lipid_profile: {
    total_cholesterol: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
  };
}

export interface ClinicalData {
  id: string;
  patient_id: string;
  measurement_date: Date;
  blood_glucose_fasting?: number;
  blood_glucose_postprandial?: number;
  hba1c?: number;
  bmi?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  total_cholesterol?: number;
  ldl_cholesterol?: number;
  hdl_cholesterol?: number;
  triglycerides?: number;
  notes?: string;
  created_at: Date;
  // 兼容字段
  age?: number;
  gender?: 'male' | 'female';
  fasting_glucose?: number;
  postprandial_glucose?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  family_history?: boolean;
  symptoms?: string[];
}

// 诊断报告类型
export interface DiagnosisReport {
  id: string;
  patient_id: string;
  doctor_id: string;
  report_date: Date;
  diagnosis_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'very_high';
  confidence_score: number;
  main_diagnosis: string;
  differential_diagnosis: string[];
  recommendations: Recommendation[];
  similar_cases: SimilarCase[];
  evidence: Evidence[];
  reasoning_process: string;
  status: 'draft' | 'reviewed' | 'finalized';
  reviewer_id?: string;
  review_notes?: string;
  created_at: Date;
  updated_at: Date;
  // 兼容前端使用的字段
  clinical_data?: {
    fasting_glucose?: number;
    blood_glucose?: {
      fasting?: number;
      hba1c?: number;
    };
    bmi?: number;
    blood_pressure?: {
      systolic?: number;
      diastolic?: number;
    };
    age?: number;
    gender?: 'male' | 'female';
    family_history?: boolean;
    symptoms?: string[];
  };
  patient_name?: string;
  risk_factors?: string[];
  diagnosis?: string;
}

export interface Recommendation {
  type: 'lifestyle' | 'medication' | 'monitoring' | 'referral';
  priority: 'low' | 'medium' | 'high';
  description: string;
  details?: string;
  timeframe?: string;
}

export interface SimilarCase {
  case_id: string;
  similarity_score: number;
  patient_demographics: {
    age: number;
    gender: 'male' | 'female';
  };
  clinical_summary: string;
  diagnosis: string;
  outcome: string;
}

export interface Evidence {
  type: 'medical_literature' | 'clinical_guideline' | 'similar_case';
  source: string;
  relevance_score: number;
  content: string;
  url?: string;
}

// OCR相关类型
export interface OCRRequest {
  files: File[];
  patient_id: string;
  document_type: string;
}

export interface OCRResponse {
  upload_id: string;
  files: ProcessedFile[];
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ProcessedFile {
  file_id: string;
  original_name: string;
  file_url: string;
  ocr_result?: OCRResult;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface OCRResult {
  text: string;
  structured_data: Record<string, any>;
  confidence: number;
  processing_time: number;
}

// 诊断请求类型
export interface DiagnosisRequest {
  patient_id: string;
  clinical_data: Partial<ClinicalIndicators>;
  query_type: 'initial' | 'follow_up' | 'second_opinion';
  context?: string;
}

export interface DiagnosisResponse {
  diagnosis_id: string;
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high' | 'very_high';
    risk_factors: string[];
    risk_score: number;
  };
  recommendations: Recommendation[];
  confidence_score: number;
  similar_cases: SimilarCase[];
  reasoning_process: string;
  processing_time: number;
}

// 知识库类型
export interface MedicalKnowledge {
  id: string;
  content: string;
  content_type: 'guideline' | 'literature' | 'case_study' | 'protocol';
  category: string;
  source: string;
  vector?: number[];
  metadata?: Record<string, any>;
  created_at: Date;
}

// 上传文件类型
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  upload_progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 搜索和筛选类型
export interface SearchFilters {
  query?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  risk_level?: ('low' | 'medium' | 'high' | 'very_high')[];
  status?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  page_size: number;
  total?: number;
}