export interface Inventory {
  inventory_id: number;
  brand_id: number;
  current_quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  reorder_quantity: number;
  batch_number?: string;
  expiry_date?: string;
  manufacturing_date?: string;
  location?: string;
  status: InventoryStatus;
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryWithDetails extends Inventory {
  brand_name: string;
  arabic_name?: string;
  generic_name: string;
  manufacturer_name?: string;
  dosage_form?: string;
}

export interface InventoryMovement {
  movement_id: number;
  inventory_id: number;
  movement_type: MovementType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_type?: string;
  reference_id?: number;
  reason?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
}

export interface InventoryAlert {
  alert_id: number;
  inventory_id: number;
  alert_type: AlertType;
  threshold_value?: number;
  current_value?: number;
  severity: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  message?: string;
  created_at: string;
}

export interface InventoryStats {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  expiring_soon_items: number;
  expired_items: number;
  total_value?: number;
}

export type InventoryStatus = 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'expiring_soon' | 'damaged';
export type MovementType = 'add' | 'remove' | 'return' | 'damage' | 'sale' | 'adjustment' | 'transfer';
export type AlertType = 'low_stock' | 'expiry_soon' | 'expired' | 'overstock';
