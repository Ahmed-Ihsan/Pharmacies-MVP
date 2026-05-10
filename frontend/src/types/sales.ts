export interface SaleItem {
  item_id?: number;
  sale_id?: number;
  brand_id: number;
  brand_name?: string;
  generic_name?: string;
  quantity: number;
  unit_price: number;
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  discount_amount: number;
  subtotal: number;
  total: number;
  created_at?: string;
}

export interface Payment {
  payment_id?: number;
  sale_id?: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  amount: number;
  reference_number?: string;
  notes?: string;
  created_at?: string;
}

export interface Sale {
  sale_id?: number;
  invoice_number: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  items: SaleItem[];
  payments: Payment[];
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface SaleCreate {
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_type?: 'percentage' | 'amount';
  discount_value?: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  items: SaleItem[];
  payments: Payment[];
}

export interface ReturnItem {
  return_item_id?: number;
  return_id?: number;
  sale_item_id: number;
  brand_id: number;
  brand_name?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at?: string;
}

export interface SaleReturn {
  return_id?: number;
  return_number: string;
  sale_id: number;
  reason: string;
  total_amount: number;
  refund_amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  items?: ReturnItem[];
  created_at?: string;
  processed_at?: string;
}

export interface SaleReturnCreate {
  sale_id: number;
  reason: string;
  total_amount: number;
  refund_amount: number;
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  items: ReturnItem[];
}
