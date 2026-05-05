import { ArrowLeftRight } from 'lucide-react';
import QuickInputWizard, { type WizardStep } from '../common/QuickInputWizard';

const BIOEQUIVALENCE_OPTIONS = [
  { value: 'proven', label: 'مثبتة التكافؤ الحيوي' },
  { value: 'assumed', label: 'مفترضة التكافؤ' },
  { value: 'not_established', label: 'غير محددة' },
];

interface AlternativeWizardProps {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  generics: { generic_id: number; generic_name: string }[];
  initialValues?: Record<string, string>;
  title?: string;
  isEdit?: boolean;
}

export default function AlternativeWizard({
  onSubmit,
  onCancel,
  generics,
  initialValues,
  title,
  isEdit,
}: AlternativeWizardProps) {
  const genericOptions = generics.map((g) => ({ value: String(g.generic_id), label: g.generic_name }));

  const STEPS: WizardStep[] = [
    {
      title: 'اختر الدواء الأساسي',
      subtitle: 'الدواء المرجعي في علاقة التبادل',
      icon: <ArrowLeftRight className="h-5 w-5 text-white" />,
      accentColor: 'from-emerald-500 to-emerald-700',
      fields: [
        {
          key: 'primary_generic_id',
          label: 'الدواء الأساسي',
          type: 'select',
          options: genericOptions,
          required: true,
          placeholder: 'اختر الدواء الأساسي',
          hint: 'الدواء الذي ستُضاف له البدائل',
          disabled: isEdit,
        },
      ],
    },
    {
      title: 'اختر الدواء البديل',
      subtitle: 'الدواء البديل في علاقة التبادل',
      icon: <ArrowLeftRight className="h-5 w-5 text-white" />,
      accentColor: 'from-emerald-500 to-emerald-700',
      fields: [
        {
          key: 'alternative_generic_id',
          label: 'الدواء البديل',
          type: 'select',
          options: genericOptions,
          required: true,
          placeholder: 'اختر الدواء البديل',
          hint: 'يجب أن يكون مختلفاً عن الدواء الأساسي',
          disabled: isEdit,
          validate: () => null,
        },
      ],
    },
    {
      title: 'التكافؤ والملاحظات',
      subtitle: 'معلومات إضافية (اختياري)',
      icon: <ArrowLeftRight className="h-5 w-5 text-white" />,
      accentColor: 'from-emerald-500 to-emerald-700',
      fields: [
        {
          key: 'bioequivalence_status',
          label: 'حالة التكافؤ الحيوي',
          type: 'select',
          options: BIOEQUIVALENCE_OPTIONS,
          placeholder: 'اختر الحالة',
        },
        {
          key: 'notes',
          label: 'ملاحظات',
          type: 'textarea',
          placeholder: 'ملاحظات إضافية حول علاقة التبادل...',
        },
      ],
    },
  ];

  return (
    <QuickInputWizard
      onSubmit={onSubmit}
      onCancel={onCancel}
      steps={STEPS}
      initialValues={initialValues ?? {}}
      title={title || (isEdit ? 'تعديل البديل العلاجي' : 'إضافة بديل علاجي')}
      submitLabel={isEdit ? 'حفظ التعديلات' : 'إضافة البديل'}
      isEdit={isEdit}
    />
  );
}
