import { Building2 } from 'lucide-react';
import QuickInputWizard, { type WizardStep } from '../common/QuickInputWizard';

const COUNTRIES = [
  { value: 'IQ', label: 'العراق' }, { value: 'SA', label: 'السعودية' },
  { value: 'AE', label: 'الإمارات' }, { value: 'EG', label: 'مصر' },
  { value: 'JO', label: 'الأردن' }, { value: 'KW', label: 'الكويت' },
  { value: 'LB', label: 'لبنان' }, { value: 'DE', label: 'ألمانيا' },
  { value: 'FR', label: 'فرنسا' }, { value: 'US', label: 'الولايات المتحدة' },
  { value: 'GB', label: 'المملكة المتحدة' }, { value: 'IN', label: 'الهند' },
  { value: 'CN', label: 'الصين' }, { value: 'TR', label: 'تركيا' },
  { value: 'IR', label: 'إيران' }, { value: 'PK', label: 'باكستان' },
  { value: 'OTHER', label: 'أخرى' },
];

const STEPS: WizardStep[] = [
  {
    title: 'معلومات الشركة',
    subtitle: 'أدخل الاسم ورقم الترخيص',
    icon: <Building2 className="h-5 w-5 text-white" />,
    accentColor: 'from-violet-500 to-violet-700',
    fields: [
      {
        key: 'manufacturer_name',
        label: 'اسم الشركة',
        type: 'text',
        placeholder: 'e.g. Pfizer, AstraZeneca',
        required: true,
        ltr: true,
        hint: 'أدخل الاسم الرسمي للشركة المصنعة',
      },
      {
        key: 'license_number',
        label: 'رقم الترخيص',
        type: 'text',
        placeholder: 'e.g. LIC-2024-001',
        ltr: true,
      },
    ],
  },
  {
    title: 'الدولة والحالة',
    subtitle: 'حدد موقع وحالة الشركة',
    icon: <Building2 className="h-5 w-5 text-white" />,
    accentColor: 'from-violet-500 to-violet-700',
    fields: [
      {
        key: 'country_code',
        label: 'الدولة',
        type: 'select',
        options: COUNTRIES,
        placeholder: 'اختر الدولة',
      },
      {
        key: 'status',
        label: 'الحالة',
        type: 'select',
        options: [
          { value: 'active', label: 'نشط' },
          { value: 'suspended', label: 'غير نشط' },
        ],
        placeholder: 'اختر الحالة',
      },
    ],
  },
  {
    title: 'معلومات التواصل',
    subtitle: 'بيانات الاتصال (اختياري)',
    icon: <Building2 className="h-5 w-5 text-white" />,
    accentColor: 'from-violet-500 to-violet-700',
    fields: [
      {
        key: 'email',
        label: 'البريد الإلكتروني',
        type: 'email',
        placeholder: 'info@company.com',
        ltr: true,
        validate: (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'بريد إلكتروني غير صالح' : null,
      },
      {
        key: 'phone',
        label: 'رقم الهاتف',
        type: 'tel',
        placeholder: '+964 xxx xxx xxxx',
        ltr: true,
      },
      {
        key: 'address',
        label: 'العنوان',
        type: 'textarea',
        placeholder: 'عنوان الشركة...',
      },
    ],
  },
];

interface ManufacturerWizardProps {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  initialValues?: Record<string, string>;
  title?: string;
  isEdit?: boolean;
}

export default function ManufacturerWizard({ onSubmit, onCancel, initialValues, title, isEdit }: ManufacturerWizardProps) {
  return (
    <QuickInputWizard
      onSubmit={onSubmit}
      onCancel={onCancel}
      steps={STEPS}
      initialValues={initialValues ?? { status: 'active' }}
      title={title || (isEdit ? 'تعديل شركة مصنعة' : 'إضافة شركة مصنعة')}
      submitLabel={isEdit ? 'حفظ التعديلات' : 'إضافة الشركة'}
      isEdit={isEdit}
    />
  );
}
