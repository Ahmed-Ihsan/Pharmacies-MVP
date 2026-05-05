import { Container } from 'lucide-react';
import QuickInputWizard, { type WizardStep } from '../common/QuickInputWizard';

const FORM_CATEGORIES = [
  { value: 'solid', label: 'صلب (أقراص، كبسولات)' },
  { value: 'liquid', label: 'سائل (شراب، محلول)' },
  { value: 'semisolid', label: 'شبه صلب (مراهم، كريمات)' },
  { value: 'gas', label: 'غاز (بخاخات)' },
  { value: 'parenteral', label: 'حقن وريدية / عضلية' },
  { value: 'transdermal', label: 'عبر الجلد' },
  { value: 'ophthalmic', label: 'عيني' },
  { value: 'otic', label: 'أذني' },
  { value: 'nasal', label: 'أنفي' },
  { value: 'rectal', label: 'مستقيمي' },
  { value: 'other', label: 'أخرى' },
];

const STEPS: WizardStep[] = [
  {
    title: 'رمز واسم الشكل',
    subtitle: 'المعرّفات الأساسية',
    icon: <Container className="h-5 w-5 text-white" />,
    accentColor: 'from-rose-500 to-rose-700',
    fields: [
      {
        key: 'form_code',
        label: 'رمز الشكل',
        type: 'text',
        placeholder: 'e.g. TAB, CAP, SYR',
        required: true,
        ltr: true,
        hint: 'اختصار قصير يعرّف شكل الجرعة',
      },
      {
        key: 'form_name',
        label: 'اسم الشكل',
        type: 'text',
        placeholder: 'e.g. Tablet, Capsule, Syrup',
        required: true,
        ltr: true,
      },
    ],
  },
  {
    title: 'الفئة والوصف',
    subtitle: 'تفاصيل إضافية (اختياري)',
    icon: <Container className="h-5 w-5 text-white" />,
    accentColor: 'from-rose-500 to-rose-700',
    fields: [
      {
        key: 'form_category',
        label: 'فئة الشكل',
        type: 'select',
        options: FORM_CATEGORIES,
        placeholder: 'اختر الفئة',
      },
      {
        key: 'description',
        label: 'الوصف',
        type: 'textarea',
        placeholder: 'وصف شكل الجرعة...',
      },
    ],
  },
];

interface DosageFormWizardProps {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  initialValues?: Record<string, string>;
  title?: string;
  isEdit?: boolean;
}

export default function DosageFormWizard({ onSubmit, onCancel, initialValues, title, isEdit }: DosageFormWizardProps) {
  return (
    <QuickInputWizard
      onSubmit={onSubmit}
      onCancel={onCancel}
      steps={STEPS}
      initialValues={initialValues ?? {}}
      title={title || (isEdit ? 'تعديل شكل الجرعة' : 'إضافة شكل جرعة')}
      submitLabel={isEdit ? 'حفظ التعديلات' : 'إضافة الشكل'}
      isEdit={isEdit}
    />
  );
}
