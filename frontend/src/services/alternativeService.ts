import api from './api';
import type { PaginatedResponse } from '../types/common';
import type {
  GenericAlternative,
  GenericAlternativeWithNames,
  GenericAlternativeCreate,
  GenericAlternativeUpdate,
} from '../types/alternative';

const BASE_URL = '/alternatives';

export const alternativeService = {
  // List all alternatives with optional filtering by primary generic
  list: async (params?: {
    skip?: number;
    limit?: number;
    primary_generic_id?: number;
  }): Promise<PaginatedResponse<GenericAlternative>> => {
    const response = await api.get(BASE_URL + '/', { params });
    return response.data;
  },

  // Get a specific alternative by ID
  get: async (id: number): Promise<GenericAlternativeWithNames> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new alternative relationship
  create: async (data: GenericAlternativeCreate): Promise<GenericAlternative> => {
    const response = await api.post(BASE_URL + '/', data);
    return response.data;
  },

  // Update an alternative relationship
  update: async (id: number, data: GenericAlternativeUpdate): Promise<GenericAlternative> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete an alternative relationship
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
