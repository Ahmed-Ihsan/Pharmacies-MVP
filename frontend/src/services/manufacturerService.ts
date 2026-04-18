import api from './api';
import type { PaginatedResponse } from '../types/common';
import type {
  Manufacturer,
  ManufacturerWithBrands,
  ManufacturerCreate,
  ManufacturerUpdate,
} from '../types/manufacturer';

const BASE_URL = '/manufacturers';

export const manufacturerService = {
  // List all manufacturers with optional search
  list: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Manufacturer>> => {
    const response = await api.get(BASE_URL + '/', { params });
    return response.data;
  },

  // Get a specific manufacturer by ID
  get: async (id: number): Promise<ManufacturerWithBrands> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new manufacturer
  create: async (data: ManufacturerCreate): Promise<Manufacturer> => {
    const response = await api.post(BASE_URL + '/', data);
    return response.data;
  },

  // Update a manufacturer
  update: async (id: number, data: ManufacturerUpdate): Promise<Manufacturer> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a manufacturer
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
