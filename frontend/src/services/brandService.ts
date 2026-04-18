import api from './api';
import type { PaginatedResponse } from '../types/common';
import type {
  BrandName,
  BrandNameWithDetails,
  BrandNameCreate,
  BrandNameUpdate,
} from '../types/brand';
import type { DrugPrice } from '../types/price';

const BASE_URL = '/brands';

export const brandService = {
  // List all brands with optional search and filtering
  list: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    generic_id?: number;
    manufacturer_id?: number;
  }): Promise<PaginatedResponse<BrandName>> => {
    const response = await api.get(BASE_URL + '/', { params });
    return response.data;
  },

  // Get a brand by NDC number
  getByNdc: async (ndcNumber: string): Promise<BrandName> => {
    const response = await api.get(`${BASE_URL}/by-ndc/${ndcNumber}`);
    return response.data;
  },

  // Get a brand by barcode
  getByBarcode: async (barcode: string): Promise<BrandName> => {
    const response = await api.get(`${BASE_URL}/by-barcode/${barcode}`);
    return response.data;
  },

  // Get a specific brand by ID
  get: async (id: number): Promise<BrandNameWithDetails> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get prices for a brand
  getPrices: async (id: number, params?: {
    skip?: number;
    limit?: number;
  }): Promise<DrugPrice[]> => {
    const response = await api.get(`${BASE_URL}/${id}/prices`, { params });
    return response.data;
  },

  // Create a new brand
  create: async (data: BrandNameCreate): Promise<BrandName> => {
    const response = await api.post(BASE_URL + '/', data);
    return response.data;
  },

  // Update a brand
  update: async (id: number, data: BrandNameUpdate): Promise<BrandName> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a brand
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
