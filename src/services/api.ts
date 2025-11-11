import { createClient } from '@supabase/supabase-js';
import { LoginRequest, LoginResponse, Patient, ClinicalData, DiagnosisReport, OCRRequest, OCRResponse, DiagnosisRequest, DiagnosisResponse, ApiResponse, PaginatedResponse } from '@/types';

// 从环境变量获取Supabase配置
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 只有当配置完整时才创建Supabase客户端
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        timestamp: new Date(),
      };
    }
  }

  // 认证相关API
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // 患者管理API
  async getPatients(params?: { page?: number; page_size?: number; search?: string }): Promise<ApiResponse<PaginatedResponse<Patient>>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedResponse<Patient>>(`/patients?${queryParams.toString()}`);
  }

  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    return this.request<Patient>(`/patients/${id}`);
  }

  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Patient>> {
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<ApiResponse<Patient>> {
    return this.request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  }

  async deletePatient(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  // 临床数据API
  async getClinicalData(patientId: string): Promise<ApiResponse<ClinicalData[]>> {
    return this.request<ClinicalData[]>(`/patients/${patientId}/clinical-data`);
  }

  async createClinicalData(data: Omit<ClinicalData, 'id' | 'created_at'>): Promise<ApiResponse<ClinicalData>> {
    return this.request<ClinicalData>('/clinical-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // OCR和文件上传API
  async uploadFiles(formData: FormData): Promise<ApiResponse<OCRResponse>> {
    return this.request<OCRResponse>('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    });
  }

  async processOCR(ocrRequest: OCRRequest): Promise<ApiResponse<OCRResponse>> {
    const formData = new FormData();
    ocrRequest.files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('patient_id', ocrRequest.patient_id);
    formData.append('document_type', ocrRequest.document_type);

    return this.uploadFiles(formData);
  }

  // 智能诊断API
  async createDiagnosis(diagnosisRequest: DiagnosisRequest): Promise<ApiResponse<DiagnosisResponse>> {
    return this.request<DiagnosisResponse>('/diagnosis', {
      method: 'POST',
      body: JSON.stringify(diagnosisRequest),
    });
  }

  async performDiagnosis(data: { patient_id: string; clinical_data: ClinicalData; mode: string; search_query?: string }): Promise<ApiResponse<DiagnosisResponse>> {
    return this.createDiagnosis({
      patient_id: data.patient_id,
      clinical_data: data.clinical_data,
      query_type: data.mode === 'rag' ? 'initial' : 'follow_up',
      context: data.search_query,
    });
  }

  async getDiagnosisHistory(patientId: string): Promise<ApiResponse<DiagnosisResponse[]>> {
    return this.request<DiagnosisResponse[]>(`/diagnosis/patient/${patientId}`);
  }

  // 诊断报告API
  async getDiagnosisReports(params?: { page?: number; page_size?: number; patient_id?: string }): Promise<ApiResponse<PaginatedResponse<DiagnosisReport>>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request<PaginatedResponse<DiagnosisReport>>(`/reports?${queryParams.toString()}`);
  }

  async getDiagnosisReport(id: string): Promise<ApiResponse<DiagnosisReport>> {
    return this.request<DiagnosisReport>(`/reports/${id}`);
  }

  async createDiagnosisReport(report: Omit<DiagnosisReport, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<DiagnosisReport>> {
    return this.request<DiagnosisReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  async updateDiagnosisReport(id: string, report: Partial<DiagnosisReport>): Promise<ApiResponse<DiagnosisReport>> {
    return this.request<DiagnosisReport>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(report),
    });
  }

  // 知识库API
  async searchKnowledge(query: string, category?: string): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (category) {
      queryParams.append('category', category);
    }
    
    return this.request<any>(`/knowledge/search?${queryParams.toString()}`);
  }

  async getKnowledgeCategories(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/knowledge/categories');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Supabase客户端辅助函数
export const supabaseHelpers = {
  // 获取当前用户
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // 文件上传
  async uploadFile(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('medical-images')
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },

  // 获取文件URL
  getFileUrl(path: string) {
    const { data } = supabase.storage.from('medical-images').getPublicUrl(path);
    return data.publicUrl;
  },

  // 向量化文本
  async createEmbedding(text: string) {
    // 这里可以集成OpenAI或其他embedding服务
    // 暂时返回模拟数据
    return new Array(1536).fill(0).map(() => Math.random());
  },

  // 向量搜索
  async vectorSearch(query: number[], table: string, limit: number = 5) {
    const { data, error } = await supabase.rpc('vector_search', {
      query_embedding: query,
      table_name: table,
      match_limit: limit,
    });

    if (error) throw error;
    return data;
  },
};