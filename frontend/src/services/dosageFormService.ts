import api from './api';
import type { PaginatedResponse } from '../types/common';
import type {
  DosageForm,
  DosageFormCreate,
  DosageFormUpdate,
} from '../types/dosageForm';

const BASE_URL = '/dosage-forms';

export const dosageFormService = {
  // List all dosage forms with optional search
  list: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<DosageForm>> => {
    const response = await api.get(BASE_URL + '/', { params });
    return response.data;
  },

  // Get a specific dosage form by ID
  get: async (id: number): Promise<DosageForm> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new dosage form
  create: async (data: DosageFormCreate): Promise<DosageForm> => {
    const response = await api.post(BASE_URL + '/', data);
    return response.data;
  },

  // Update a dosage form
  update: async (id: number, data: DosageFormUpdate): Promise<DosageForm> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a dosage form
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
