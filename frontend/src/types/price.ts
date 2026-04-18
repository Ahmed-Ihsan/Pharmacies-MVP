export interface DrugPrice {
  price_id: number;
  brand_id: number;
  acquisition_price?: number;
  selling_price?: number;
  effective_date: string;
  currency: string;
  created_at?: string;
}

export interface DrugPriceWithBrand extends DrugPrice {
  brand_name?: {
    brand_id: number;
    brand_name: string;
  };
}

export interface DrugPriceCreate {
  brand_id: number;
  acquisition_price?: number;
  selling_price?: number;
  effective_date: string;
  currency?: string;
}

export interface DrugPriceUpdate {
  acquisition_price?: number;
  selling_price?: number;
  effective_date?: string;
  currency?: string;
}
