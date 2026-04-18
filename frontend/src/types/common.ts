// Paginated response from API
export interface PaginatedResponse<T> {
  total: number;
  items: T[];
  skip: number;
  limit: number;
}

// Generic API error
export interface ApiError {
  detail: string;
}

// Select option for dropdowns
export interface SelectOption {
  value: string | number;
  label: string;
}

// Table column definition
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
}
