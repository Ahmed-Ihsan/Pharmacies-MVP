export interface BrandName {
  brand_id?: number;
  id?: number;
  brand_name?: string;
  name?: string;
  arabic_name?: string;
  generic_id: number;
  generic_name?: string;
  manufacturer_id?: number;
  manufacturer_name?: string;
  dosage_form_id?: number;
  dosage_form_name?: string;
  strength_value?: number;
  strength_unit?: string;
  ndc_number?: string;
  barcode?: string;
  package_size?: string;
  atc_code?: string;
  status?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandNameWithDetails extends BrandName {
  generic?: {
    id: number;
    scientific_name: string;
  };
  manufacturer?: {
    id: number;
    name: string;
  };
  dosage_form?: {
    id: number;
    name: string;
  };
  prices?: PriceSummary[];
}

export interface PriceSummary {
  id: number;
  unit_price: number;
  effective_date: string;
  is_active?: boolean;
}

export interface BrandNameCreate {
  brand_name: string;
  generic_id: number;
  manufacturer_id?: number;
  dosage_form_id?: number;
  strength_value?: number;
  strength_unit?: string;
  package_size?: string;
  ndc_number?: string;
  barcode?: string;
  atc_code?: string;
  prescription_required?: boolean;
  storage_conditions?: string;
  route_of_administration?: string;
  status?: string;
}

export interface BrandNameUpdate {
  brand_name?: string;
  generic_id?: number;
  manufacturer_id?: number;
  dosage_form_id?: number;
  strength_value?: number;
  strength_unit?: string;
  package_size?: string;
  ndc_number?: string;
  barcode?: string;
  atc_code?: string;
  prescription_required?: boolean;
  storage_conditions?: string;
  route_of_administration?: string;
  status?: string;
}
