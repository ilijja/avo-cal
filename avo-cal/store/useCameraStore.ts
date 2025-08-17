import { create } from 'zustand';

// Camera store interface
interface CameraState {
  // Camera state
  isCameraOpen: boolean;
  capturedImage: string | null;
  
  // Actions
  openCamera: () => void;
  closeCamera: () => void;
  setCapturedImage: (imageUri: string | null) => void;
  clearCapturedImage: () => void;
}

// Create camera store
export const useCameraStore = create<CameraState>((set) => ({
  // Initial state
  isCameraOpen: false,
  capturedImage: null,
  
  // Actions
  openCamera: () => set({ isCameraOpen: true }),
  closeCamera: () => set({ isCameraOpen: false }),
  setCapturedImage: (capturedImage) => set({ capturedImage }),
  clearCapturedImage: () => set({ capturedImage: null }),
}));
