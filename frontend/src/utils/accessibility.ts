export const ariaLabels = {
  search: 'بحث',
  menu: 'القائمة',
  notifications: 'الإشعارات',
  settings: 'الإعدادات',
  profile: 'الملف الشخصي',
  logout: 'تسجيل الخروج',
  close: 'إغلاق',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  view: 'عرض',
  add: 'إضافة',
  filter: 'تصفية',
  export: 'تصدير',
  refresh: 'تحديث',
  next: 'التالي',
  previous: 'السابق',
  first: 'الأول',
  last: 'الأخير',
  selectAll: 'تحديد الكل',
  clearSelection: 'مسح التحديد',
  loading: 'جاري التحميل',
  error: 'خطأ',
  success: 'نجاح',
  warning: 'تحذير',
  info: 'معلومات',
};

export function getAriaLabel(key: keyof typeof ariaLabels, fallback?: string): string {
  return ariaLabels[key] || fallback || key;
}

export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function setFocus(element: HTMLElement | null) {
  if (element) {
    element.focus();
    announceToScreenReader(`تم التركيز على ${element.getAttribute('aria-label') || element.textContent}`);
  }
}

export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
    if (e.key === 'Escape') {
      element.dispatchEvent(new CustomEvent('escape'));
    }
  });

  firstFocusable.focus();
}
