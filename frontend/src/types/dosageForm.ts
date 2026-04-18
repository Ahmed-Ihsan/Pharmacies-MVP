export interface DosageForm {
  dosage_form_id: number;
  form_code: string;
  form_name: string;
  form_category?: string;
  description?: string;
  created_at?: string;
}

export interface DosageFormCreate {
  form_code: string;
  form_name: string;
  form_category?: string;
  description?: string;
}

export interface DosageFormUpdate {
  form_code?: string;
  form_name?: string;
  form_category?: string;
  description?: string;
}
