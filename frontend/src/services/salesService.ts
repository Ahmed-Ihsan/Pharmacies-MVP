import axios from 'axios';
import type { Sale, SaleCreate, SaleReturn, SaleReturnCreate } from '../types/sales';

const API_BASE_URL = 'http://localhost:8000/api/v1/sales';

export const salesService = {
  async createSale(saleData: SaleCreate): Promise<Sale> {
    const response = await axios.post<Sale>(`${API_BASE_URL}/`, saleData);
    return response.data;
  },

  async getSale(saleId: number): Promise<Sale> {
    const response = await axios.get<Sale>(`${API_BASE_URL}/${saleId}`);
    return response.data;
  },

  async listSales(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Sale[]> {
    const response = await axios.get<Sale[]>(`${API_BASE_URL}/`, { params });
    return response.data;
  },

  async searchByInvoice(invoiceNumber: string): Promise<Sale> {
    const response = await axios.get<Sale>(`${API_BASE_URL}/search`, { params: { invoice_number: invoiceNumber } });
    return response.data;
  },

  async updateSale(saleId: number, saleData: Partial<Sale>): Promise<Sale> {
    const response = await axios.put<Sale>(`${API_BASE_URL}/${saleId}`, saleData);
    return response.data;
  },

  async cancelSale(saleId: number): Promise<Sale> {
    const response = await axios.post<Sale>(`${API_BASE_URL}/${saleId}/cancel`);
    return response.data;
  },

  async processReturn(returnData: SaleReturnCreate): Promise<SaleReturn> {
    const response = await axios.post<SaleReturn>(`${API_BASE_URL}/returns`, returnData);
    return response.data;
  },

  async getReturn(returnId: number): Promise<SaleReturn> {
    const response = await axios.get<SaleReturn>(`${API_BASE_URL}/returns/${returnId}`);
    return response.data;
  },

  async listReturns(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<SaleReturn[]> {
    const response = await axios.get<SaleReturn[]>(`${API_BASE_URL}/returns/list`, { params });
    return response.data;
  },
};
