import api from './api';
import type { PaginatedResponse } from '../types/common';
import type {
  GenericDrug,
  GenericDrugWithDetails,
  GenericDrugCreate,
  GenericDrugUpdate,
} from '../types/generic';
import type { GenericAlternativeWithNames } from '../types/alternative';

const BASE_URL = '/generics';

export const genericService = {
  // List all generics with optional search and filtering
  list: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    therapeutic_class_id?: number;
  }): Promise<PaginatedResponse<GenericDrug>> => {
    const response = await api.get(BASE_URL + '/', { params });
    return response.data;
  },

  // Get a specific generic by ID
  get: async (id: number): Promise<GenericDrugWithDetails> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get alternatives for a specific generic
  getAlternatives: async (id: number): Promise<GenericAlternativeWithNames[]> => {
    const response = await api.get(`${BASE_URL}/${id}/alternatives`);
    return response.data;
  },

  // Create a new generic
  create: async (data: GenericDrugCreate): Promise<GenericDrug> => {
    const response = await api.post(BASE_URL + '/', data);
    return response.data;
  },

  // Update a generic
  update: async (id: number, data: GenericDrugUpdate): Promise<GenericDrug> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a generic
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
