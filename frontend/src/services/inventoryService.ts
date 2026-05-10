import axios from 'axios';
import type { Inventory, InventoryWithDetails, InventoryMovement, InventoryAlert, InventoryStats } from '../types/inventory';

const API_BASE = '/api/v1/inventory';

export const inventoryService = {
  async list(params?: { skip?: number; limit?: number; status?: string }) {
    const response = await axios.get<InventoryWithDetails[]>(API_BASE, { params });
    return response.data;
  },

  async get(inventoryId: number) {
    const response = await axios.get<Inventory>(`${API_BASE}/${inventoryId}`);
    return response.data;
  },

  async getByBrand(brandId: number) {
    const response = await axios.get<Inventory | null>(`${API_BASE}/brand/${brandId}`);
    return response.data;
  },

  async create(data: Omit<Inventory, 'inventory_id' | 'created_at' | 'updated_at' | 'last_restocked_at'>) {
    const response = await axios.post<Inventory>(API_BASE, data);
    return response.data;
  },

  async update(inventoryId: number, data: Partial<Inventory>) {
    const response = await axios.put<InventoryWithDetails>(`${API_BASE}/${inventoryId}`, data);
    return response.data;
  },

  async delete(inventoryId: number) {
    await axios.delete(`${API_BASE}/${inventoryId}`);
  },

  async addStock(inventoryId: number, quantity: number, options?: {
    reference_type?: string;
    reference_id?: number;
    reason?: string;
    performed_by?: string;
  }) {
    const response = await axios.post<InventoryWithDetails>(`${API_BASE}/${inventoryId}/add-stock`, null, {
      params: { quantity, ...options }
    });
    return response.data;
  },

  async removeStock(inventoryId: number, quantity: number, options?: {
    reference_type?: string;
    reference_id?: number;
    reason?: string;
    performed_by?: string;
  }) {
    const response = await axios.post<InventoryWithDetails>(`${API_BASE}/${inventoryId}/remove-stock`, null, {
      params: { quantity, ...options }
    });
    return response.data;
  },

  async recordSale(brandId: number, quantity: number, saleId: number, performedBy?: string) {
    const response = await axios.post<InventoryWithDetails>(`${API_BASE}/brand/${brandId}/sale`, null, {
      params: { quantity, sale_id: saleId, performed_by: performedBy }
    });
    return response.data;
  },

  async recordDamage(inventoryId: number, quantity: number, reason?: string, performedBy?: string) {
    const response = await axios.post<InventoryWithDetails>(`${API_BASE}/${inventoryId}/damage`, null, {
      params: { quantity, reason, performed_by: performedBy }
    });
    return response.data;
  },

  async getDashboardStats() {
    const response = await axios.get<InventoryStats>(`${API_BASE}/stats/dashboard`);
    return response.data;
  },

  async getMovementHistory(inventoryId: number, limit = 50) {
    const response = await axios.get<InventoryMovement[]>(`${API_BASE}/${inventoryId}/movements`, {
      params: { limit }
    });
    return response.data;
  },

  async getActiveAlerts(unresolvedOnly = true) {
    const response = await axios.get<InventoryAlert[]>(`${API_BASE}/alerts/active`, {
      params: { unresolved_only: unresolvedOnly }
    });
    return response.data;
  },

  async resolveAlert(alertId: number, resolvedBy: string) {
    await axios.post(`${API_BASE}/alerts/${alertId}/resolve`, null, {
      params: { resolved_by: resolvedBy }
    });
  },
};
