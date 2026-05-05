import { FolderTree } from 'lucide-react';
import QuickInputWizard, { type WizardStep } from '../common/QuickInputWizard';

interface TherapeuticClassWizardProps {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  rootClasses: { class_id: number; class_code: string; class_name: string }[];
  initialValues?: Record<string, string>;
  title?: string;
  isEdit?: boolean;
  currentId?: number;
}

export default function TherapeuticClassWizard({
  onSubmit,
  onCancel,
  rootClasses,
  initialValues,
  title,
  isEdit,
  currentId,
}: TherapeuticClassWizardProps) {
  const parentOptions = rootClasses
    .filter((c) => c.class_id !== currentId)
    .map((c) => ({ value: String(c.class_id), label: `${c.class_code} — ${c.class_name}` }));

  const STEPS: WizardStep[] = [
    {
      title: 'رمز واسم التصنيف',
      subtitle: 'المعرّفات الأساسية للتصنيف',
      icon: <FolderTree className="h-5 w-5 text-white" />,
      accentColor: 'from-amber-500 to-amber-700',
      fields: [
        {
          key: 'class_code',
          label: 'رمز التصنيف',
          type: 'text',
          placeholder: 'e.g. A01, B02, C10',
          required: true,
          ltr: true,
          hint: 'رمز فريد يعرّف التصنيف (حروف وأرقام فقط)',
        },
        {
          key: 'class_name',
          label: 'اسم التصنيف',
          type: 'text',
          placeholder: 'e.g. Antibiotics, Analgesics',
          required: true,
          ltr: true,
        },
      ],
    },
    {
      title: 'التصنيف الأب والوصف',
      subtitle: 'حدد الموضع في الهرم والوصف',
      icon: <FolderTree className="h-5 w-5 text-white" />,
      accentColor: 'from-amber-500 to-amber-700',
      fields: [
        {
          key: 'parent_class_id',
          label: 'التصنيف الأب',
          type: 'select',
          options: parentOptions,
          placeholder: 'تصنيف رئيسي (بدون أب)',
          hint: 'اتركه فارغاً إذا كان تصنيفاً رئيسياً',
        },
        {
          key: 'description',
          label: 'الوصف',
          type: 'textarea',
          placeholder: 'وصف التصنيف العلاجي...',
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
      title={title || (isEdit ? 'تعديل التصنيف العلاجي' : 'إضافة تصنيف علاجي')}
      submitLabel={isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
      isEdit={isEdit}
    />
  );
}
