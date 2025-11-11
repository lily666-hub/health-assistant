import { create } from 'zustand';
import { Patient, SearchFilters, PaginationParams } from '@/types';

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
  pagination: PaginationParams;
  totalCount: number;
  
  // Actions
  setPatients: (patients: Patient[]) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: SearchFilters) => void;
  setPagination: (pagination: PaginationParams) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    page_size: 10,
  },
  totalCount: 0,
  
  setPatients: (patients) => set({ patients }),
  setSelectedPatient: (selectedPatient) => set({ selectedPatient }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  setPagination: (pagination) => set({ pagination }),
  
  addPatient: (patient) => set((state) => ({
    patients: [patient, ...state.patients],
  })),
  
  updatePatient: (id, patientData) => set((state) => ({
    patients: state.patients.map((p) =>
      p.id === id ? { ...p, ...patientData } : p
    ),
    selectedPatient: state.selectedPatient?.id === id
      ? { ...state.selectedPatient, ...patientData }
      : state.selectedPatient,
  })),
  
  deletePatient: (id) => set((state) => ({
    patients: state.patients.filter((p) => p.id !== id),
    selectedPatient: state.selectedPatient?.id === id
      ? null
      : state.selectedPatient,
  })),
}));