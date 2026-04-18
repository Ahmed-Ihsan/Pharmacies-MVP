export interface GenericDrug {
  generic_id: number;
  generic_name: string;
  chemical_name?: string;
  molecular_formula?: string;
  cas_number?: string;
  therapeutic_class_id?: number;
  therapeutic_class_name?: string;
  pharmacology?: string;
  indications?: string;
  contraindications?: string;
  side_effects?: string;
  interactions?: string;
  pregnancy_category?: string;
  controlled_substance_schedule?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for compatibility
  id?: number;
  scientific_name?: string;
  arabic_name?: string;
  description?: string;
}

export interface GenericDrugWithDetails extends GenericDrug {
  therapeutic_class?: {
    id: number;
    name: string;
  };
  brands?: BrandSummary[];
  brand_count?: number;
}

export interface BrandSummary {
  id: number;
  name: string;
  manufacturer_name?: string;
}

export interface GenericDrugCreate {
  generic_name: string;
  chemical_name?: string;
  molecular_formula?: string;
  cas_number?: string;
  therapeutic_class_id?: number;
  pharmacology?: string;
  indications?: string;
  contraindications?: string;
  side_effects?: string;
  interactions?: string;
  pregnancy_category?: string;
  controlled_substance_schedule?: string;
  status?: string;
}

export interface GenericDrugUpdate {
  generic_name?: string;
  chemical_name?: string;
  molecular_formula?: string;
  cas_number?: string;
  therapeutic_class_id?: number;
  pharmacology?: string;
  indications?: string;
  contraindications?: string;
  side_effects?: string;
  interactions?: string;
  pregnancy_category?: string;
  controlled_substance_schedule?: string;
  status?: string;
}
