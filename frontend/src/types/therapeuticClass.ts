export interface TherapeuticClass {
  class_id: number;
  class_code: string;
  class_name: string;
  parent_class_id?: number;
  description?: string;
  created_at?: string;
}

export interface TherapeuticClassWithHierarchy extends TherapeuticClass {
  children?: TherapeuticClass[];
}

export interface TherapeuticClassCreate {
  class_code: string;
  class_name: string;
  parent_class_id?: number;
  description?: string;
}

export interface TherapeuticClassUpdate {
  class_code?: string;
  class_name?: string;
  parent_class_id?: number;
  description?: string;
}
