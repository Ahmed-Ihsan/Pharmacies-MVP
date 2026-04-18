// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Arabic translations for common terms
export const TRANSLATIONS = {
  // Navigation
  dashboard: 'لوحة التحكم',
  generics: 'الأدوية الجنيسة',
  brands: 'الأدوية التجارية',
  manufacturers: 'الشركات المصنعة',
  therapeuticClasses: 'التصنيفات العلاجية',
  dosageForms: 'أشكال الجرعات',
  alternatives: 'البدائل',
  prices: 'الأسعار',
  search: 'بحث',
  
  // Actions
  add: 'إضافة',
  edit: 'تعديل',
  delete: 'حذف',
  save: 'حفظ',
  cancel: 'إلغاء',
  search_action: 'بحث',
  filter: 'تصفية',
  reset: 'إعادة تعيين',
  view: 'عرض',
  back: 'رجوع',
  
  // Common fields
  name: 'الاسم',
  description: 'الوصف',
  code: 'الرمز',
  status: 'الحالة',
  created_at: 'تاريخ الإنشاء',
  updated_at: 'تاريخ التحديث',
  actions: 'الإجراءات',
  
  // Status
  active: 'نشط',
  inactive: 'غير نشط',
  
  // Messages
  confirm_delete: 'هل أنت متأكد من الحذف؟',
  no_results: 'لا توجد نتائج',
  loading: 'جاري التحميل...',
  error: 'حدث خطأ',
  success: 'تم بنجاح',
  
  // Currency
  price: 'السعر',
  currency: 'دينار عراقي',
} as const;

// Table headers mapping
export const TABLE_HEADERS = {
  id: 'المعرف',
  name: 'الاسم',
  arabic_name: 'الاسم العربي',
  scientific_name: 'الاسم العلمي',
  manufacturer: 'الشركة المصنعة',
  generic: 'الدواء الجنيس',
  dosage_form: 'شكل الجرعة',
  therapeutic_class: 'التصنيف العلاجي',
  barcode: 'الباركود',
  ndc_number: 'رقم NDC',
  unit_price: 'سعر الوحدة',
  effective_date: 'تاريخ السريان',
} as const;
