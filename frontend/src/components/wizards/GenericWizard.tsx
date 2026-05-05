import { Pill } from 'lucide-react';
import QuickInputWizard, { type WizardStep } from '../common/QuickInputWizard';

interface GenericWizardProps {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  therapeuticClasses: { id: number; name: string }[];
  initialValues?: Record<string, string>;
  title?: string;
  isEdit?: boolean;
}

export default function GenericWizard({
  onSubmit,
  onCancel,
  therapeuticClasses,
  initialValues,
  title,
  isEdit,
}: GenericWizardProps) {
  const classOptions = therapeuticClasses.map((c) => ({ value: String(c.id), label: c.name }));

  const STEPS: WizardStep[] = [
    {
      title: 'الاسم والمعرّفات',
      subtitle: 'البيانات الأساسية للدواء الجنيس',
      icon: <Pill className="h-5 w-5 text-white" />,
      accentColor: 'from-blue-500 to-blue-700',
      fields: [
        {
          key: 'generic_name',
          label: 'الاسم العام (Generic Name)',
          type: 'text',
          placeholder: 'e.g. Amoxicillin, Ibuprofen',
          required: true,
          ltr: true,
          hint: 'الاسم الدولي غير الحاصل على براءة اختراع',
        },
        {
          key: 'chemical_name',
          label: 'الاسم الكيميائي',
          type: 'text',
          placeholder: 'e.g. (2S,5R,6R)-6-amino-3,3...',
          ltr: true,
        },
      ],
    },
    {
      title: 'الصيغة والتصنيف',
      subtitle: 'البنية الجزيئية والتصنيف العلاجي',
      icon: <Pill className="h-5 w-5 text-white" />,
      accentColor: 'from-blue-500 to-blue-700',
      fields: [
        {
          key: 'molecular_formula',
          label: 'المعادلة الجزيئية',
          type: 'text',
          placeholder: 'e.g. C16H19N3O5S',
          ltr: true,
        },
        {
          key: 'cas_number',
          label: 'رقم CAS',
          type: 'text',
          placeholder: 'e.g. 26787-78-0',
          ltr: true,
          hint: 'رقم تسجيل مادة كيميائية (CAS Registry)',
        },
        {
          key: 'therapeutic_class_id',
          label: 'التصنيف العلاجي',
          type: 'select',
          options: classOptions,
          placeholder: 'اختر التصنيف العلاجي',
        },
      ],
    },
    {
      title: 'الدوائية والمؤشرات',
      subtitle: 'معلومات طبية (اختياري)',
      icon: <Pill className="h-5 w-5 text-white" />,
      accentColor: 'from-blue-500 to-blue-700',
      fields: [
        {
          key: 'pharmacology',
          label: 'الدوائية (Pharmacology)',
          type: 'textarea',
          placeholder: 'وصف الدوائية...',
        },
        {
          key: 'indications',
          label: 'المؤشرات (Indications)',
          type: 'textarea',
          placeholder: 'المؤشرات العلاجية...',
        },
      ],
    },
    {
      title: 'التحذيرات والتفاعلات',
      subtitle: 'معلومات السلامة (اختياري)',
      icon: <Pill className="h-5 w-5 text-white" />,
      accentColor: 'from-blue-500 to-blue-700',
      fields: [
        {
          key: 'contraindications',
          label: 'موانع الاستعمال',
          type: 'textarea',
          placeholder: 'موانع الاستعمال...',
        },
        {
          key: 'side_effects',
          label: 'الآثار الجانبية',
          type: 'textarea',
          placeholder: 'الآثار الجانبية الشائعة...',
        },
        {
          key: 'interactions',
          label: 'التداخلات الدوائية',
          type: 'textarea',
          placeholder: 'التداخلات مع أدوية أخرى...',
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
      title={title || (isEdit ? 'تعديل الدواء الجنيس' : 'إضافة دواء جنيس')}
      submitLabel={isEdit ? 'حفظ التعديلات' : 'إضافة الدواء'}
      isEdit={isEdit}
    />
  );
}
