export interface Manufacturer {
  manufacturer_id: number;
  manufacturer_name: string;
  country_code?: string;
  license_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ManufacturerWithBrands extends Manufacturer {
  brands?: BrandSummary[];
}

export interface BrandSummary {
  brand_id: number;
  brand_name: string;
  generic_name?: string;
}

export interface ManufacturerCreate {
  manufacturer_name: string;
  country_code?: string;
  license_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export interface ManufacturerUpdate {
  manufacturer_name?: string;
  country_code?: string;
  license_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
}
