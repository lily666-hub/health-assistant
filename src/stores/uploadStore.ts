import { create } from 'zustand';
import { UploadFile } from '@/types';

interface UploadState {
  files: UploadFile[];
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  ocrResults: Record<string, any>;
  ocrLoading: boolean;
  
  // Actions
  addFile: (file: UploadFile) => void;
  updateFileProgress: (fileId: string, progress: number) => void;
  updateFileStatus: (fileId: string, status: UploadFile['status'], error?: string) => void;
  removeFile: (fileId: string) => void;
  setUploading: (uploading: boolean) => void;
  setUploadProgress: (progress: number | ((prev: number) => number)) => void;
  setOCRResults: (fileId: string, results: any) => void;
  setOCRLoading: (loading: boolean) => void;
  clearFiles: () => void;
  setOCRResult: (fileId: string, results: any) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  files: [],
  loading: false,
  uploading: false,
  uploadProgress: 0,
  ocrResults: {},
  ocrLoading: false,
  
  addFile: (file) => set((state) => ({
    files: [...state.files, file],
  })),
  
  updateFileProgress: (fileId, progress) => set((state) => ({
    files: state.files.map((f) =>
      f.id === fileId ? { ...f, upload_progress: progress } : f
    ),
  })),
  
  updateFileStatus: (fileId, status, error) => set((state) => ({
    files: state.files.map((f) =>
      f.id === fileId ? { ...f, status, error } : f
    ),
  })),
  
  removeFile: (fileId) => set((state) => ({
    files: state.files.filter((f) => f.id !== fileId),
  })),
  
  setUploading: (uploading) => set({ uploading }),
  setUploadProgress: (progress) => {
      if (typeof progress === 'function') {
        set((state) => ({ 
          uploadProgress: progress(state.uploadProgress) 
        }));
      } else {
        set({ uploadProgress: progress });
      }
    },
  setOCRResults: (fileId, results) => set((state) => ({
    ocrResults: { ...state.ocrResults, [fileId]: results },
  })),
  setOCRResult: (fileId, results) => set((state) => ({
    ocrResults: { ...state.ocrResults, [fileId]: results },
  })),
  setOCRLoading: (ocrLoading) => set({ ocrLoading }),
  clearFiles: () => set({ files: [], ocrResults: {} }),
}));