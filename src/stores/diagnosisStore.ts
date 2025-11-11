import { create } from 'zustand';
import { DiagnosisReport, ClinicalData, DiagnosisRequest, DiagnosisResponse } from '@/types';

interface DiagnosisState {
  currentDiagnosis: DiagnosisResponse | null;
  diagnosisReports: DiagnosisReport[];
  clinicalData: ClinicalData | null;
  loading: boolean;
  error: string | null;
  isDiagnosing: boolean;
  diagnosisHistory: DiagnosisResponse[];
  
  // Actions
  setCurrentDiagnosis: (diagnosis: DiagnosisResponse | DiagnosisReport | null) => void;
  setDiagnosisReports: (reports: DiagnosisReport[]) => void;
  setClinicalData: (data: ClinicalData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsDiagnosing: (diagnosing: boolean) => void;
  addDiagnosisToHistory: (diagnosis: DiagnosisResponse) => void;
  addDiagnosisReport: (report: DiagnosisReport) => void;
  updateDiagnosisReport: (id: string, report: Partial<DiagnosisReport>) => void;
}

export const useDiagnosisStore = create<DiagnosisState>((set) => ({
  currentDiagnosis: null,
  diagnosisReports: [],
  clinicalData: null,
  loading: false,
  error: null,
  isDiagnosing: false,
  diagnosisHistory: [],
  
  setCurrentDiagnosis: (currentDiagnosis) => set({ currentDiagnosis: currentDiagnosis as DiagnosisResponse | null }),
  setDiagnosisReports: (diagnosisReports) => set({ diagnosisReports }),
  setClinicalData: (clinicalData) => set({ clinicalData }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setIsDiagnosing: (isDiagnosing) => set({ isDiagnosing }),
  
  addDiagnosisToHistory: (diagnosis) => set((state) => ({
    diagnosisHistory: [diagnosis, ...state.diagnosisHistory].slice(0, 10), // Keep last 10
  })),
  
  addDiagnosisReport: (report) => set((state) => ({
    diagnosisReports: [report, ...state.diagnosisReports],
  })),
  
  updateDiagnosisReport: (id, reportData) => set((state) => ({
    diagnosisReports: state.diagnosisReports.map((r) =>
      r.id === id ? { ...r, ...reportData } : r
    ),
  })),
}));