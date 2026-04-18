export interface GenericAlternative {
  alternative_id: number;
  primary_generic_id: number;
  alternative_generic_id: number;
  bioequivalence_status?: string;
  notes?: string;
  created_at?: string;
}

export interface GenericAlternativeWithNames extends GenericAlternative {
  primary_generic?: {
    generic_id: number;
    generic_name: string;
  };
  alternative_generic?: {
    generic_id: number;
    generic_name: string;
  };
}

export interface GenericAlternativeCreate {
  primary_generic_id: number;
  alternative_generic_id: number;
  bioequivalence_status?: string;
  notes?: string;
}

export interface GenericAlternativeUpdate {
  bioequivalence_status?: string;
  notes?: string;
}
