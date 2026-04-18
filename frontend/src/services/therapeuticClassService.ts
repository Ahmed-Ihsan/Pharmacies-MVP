import api from './api';
import type { PaginatedResponse } from '../types/common';
import type {
  TherapeuticClass,
  TherapeuticClassWithHierarchy,
  TherapeuticClassCreate,
  TherapeuticClassUpdate,
} from '../types/therapeuticClass';

const BASE_URL = '/therapeutic-classes';

export const therapeuticClassService = {
  // List all therapeutic classes with optional search
  list: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<TherapeuticClass>> => {
    const response = await api.get(BASE_URL + '/', { params });
    return response.data;
  },

  // Get all root classes (no parent)
  getRoots: async (): Promise<TherapeuticClass[]> => {
    const response = await api.get(`${BASE_URL}/roots`);
    return response.data;
  },

  // Get child classes of a specific class
  getChildren: async (classId: number): Promise<TherapeuticClass[]> => {
    const response = await api.get(`${BASE_URL}/${classId}/children`);
    return response.data;
  },

  // Get a specific class by ID
  get: async (id: number): Promise<TherapeuticClassWithHierarchy> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new therapeutic class
  create: async (data: TherapeuticClassCreate): Promise<TherapeuticClass> => {
    const response = await api.post(BASE_URL + '/', data);
    return response.data;
  },

  // Update a therapeutic class
  update: async (id: number, data: TherapeuticClassUpdate): Promise<TherapeuticClass> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a therapeutic class
  delete: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
