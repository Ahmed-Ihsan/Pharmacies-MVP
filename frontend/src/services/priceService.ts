import api from './api';
import type { PaginatedResponse } from '../types/common';
import type {
  DrugPrice,
  DrugPriceWithBrand,
  DrugPriceCreate,
  DrugPriceUpdate,
} from '../types/price';

const BASE_URL = '/prices';

export const priceService = {
  // List all prices for a specific brand
  listByBrand: async (brandId: number, params?: {
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<DrugPrice>> => {
    const response = await api.get(`${BASE_URL}/by-brand/${brandId}`, { params });
    return response.data;
  },

  // Get the active price for a brand as of a specific date
  getActivePrice: async (brandId: number, asOf?: string): Promise<DrugPrice> => {
    const params = asOf ? { as_of: asOf } : undefined;
    const response = await api.get(`${BASE_URL}/active/${brandId}`, { params });
    return response.data;
  },

  // Get a specific price entry by ID
  get: async (id: number): Promise<DrugPriceWithBrand> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new price entry
  create: async (data: DrugPriceCreate): Promise<DrugPrice> => {
    const response = await api.post(BASE_URL + '/', data);
    return response.data;
  },

  // Update a price entry
  update: async (id: number, data: DrugPriceUpdate): Promise<DrugPrice> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a price entry
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
