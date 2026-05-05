import { Tag } from 'lucide-react';
import QuickInputWizard, { type WizardStep } from '../common/QuickInputWizard';

interface BrandWizardProps {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  generics: { id: number; name: string }[];
  manufacturers: { id: number; name: string }[];
  dosageForms: { id: number; name: string }[];
  initialValues?: Record<string, string>;
  title?: string;
  isEdit?: boolean;
}

export default function BrandWizard({
  onSubmit,
  onCancel,
  generics,
  manufacturers,
  dosageForms,
  initialValues,
  title,
  isEdit,
}: BrandWizardProps) {
  const genericOptions = generics.map((g) => ({ value: String(g.id), label: g.name }));
  const manufacturerOptions = manufacturers.map((m) => ({ value: String(m.id), label: m.name }));
  const dosageFormOptions = dosageForms.map((d) => ({ value: String(d.id), label: d.name }));

  const STEPS: WizardStep[] = [
    {
      title: 'الاسم التجاري والدواء الجنيس',
      subtitle: 'البيانات الأساسية المطلوبة',
      icon: <Tag className="h-5 w-5 text-white" />,
      accentColor: 'from-purple-500 to-purple-700',
      fields: [
        {
          key: 'brand_name',
          label: 'الاسم التجاري',
          type: 'text',
          placeholder: 'e.g. Augmentin, Brufen',
          required: true,
          ltr: true,
          hint: 'الاسم التجاري المسجّل للدواء',
        },
        {
          key: 'generic_id',
          label: 'الدواء الجنيس',
          type: 'select',
          options: genericOptions,
          required: true,
          placeholder: 'اختر الدواء الجنيس',
          hint: 'المادة الفعّالة الأساسية',
        },
      ],
    },
    {
      title: 'الشركة المصنعة وشكل الجرعة',
      subtitle: 'مصدر الدواء وطريقة تقديمه',
      icon: <Tag className="h-5 w-5 text-white" />,
      accentColor: 'from-purple-500 to-purple-700',
      fields: [
        {
          key: 'manufacturer_id',
          label: 'الشركة المصنعة',
          type: 'select',
          options: manufacturerOptions,
          placeholder: 'اختر الشركة المصنعة',
        },
        {
          key: 'dosage_form_id',
          label: 'شكل الجرعة',
          type: 'select',
          options: dosageFormOptions,
          placeholder: 'اختر شكل الجرعة',
        },
      ],
    },
    {
      title: 'القوة والتعبئة',
      subtitle: 'مواصفات الجرعة والعبوة',
      icon: <Tag className="h-5 w-5 text-white" />,
      accentColor: 'from-purple-500 to-purple-700',
      fields: [
        {
          key: 'strength_value',
          label: 'قوة الجرعة',
          type: 'number',
          placeholder: 'e.g. 500',
          ltr: true,
        },
        {
          key: 'strength_unit',
          label: 'وحدة القوة',
          type: 'select',
          options: [
            { value: 'mg', label: 'mg' },
            { value: 'mcg', label: 'mcg' },
            { value: 'g', label: 'g' },
            { value: 'mL', label: 'mL' },
            { value: 'IU', label: 'IU' },
            { value: 'units', label: 'units' },
          ],
          placeholder: 'اختر الوحدة',
        },
        {
          key: 'package_size',
          label: 'حجم العبوة',
          type: 'text',
          placeholder: 'e.g. 30 tablets, 100 mL',
          ltr: true,
        },
      ],
    },
    {
      title: 'الأكواد والتخزين',
      subtitle: 'معلومات التعريف والتخزين',
      icon: <Tag className="h-5 w-5 text-white" />,
      accentColor: 'from-purple-500 to-purple-700',
      fields: [
        {
          key: 'atc_code',
          label: 'رمز ATC',
          type: 'text',
          placeholder: 'e.g. A01AA01',
          ltr: true,
        },
        {
          key: 'route_of_administration',
          label: 'طريقة الإعطاء',
          type: 'select',
          options: [
            { value: 'oral', label: 'فموي' },
            { value: 'intravenous', label: 'وريدي' },
            { value: 'intramuscular', label: 'عضلي' },
            { value: 'subcutaneous', label: 'تحت الجلد' },
            { value: 'topical', label: 'موضعي' },
            { value: 'inhalation', label: 'استنشاق' },
            { value: 'rectal', label: 'مستقيمي' },
            { value: 'ophthalmic', label: 'عيني' },
            { value: 'otic', label: 'أذني' },
            { value: 'nasal', label: 'أنفي' },
          ],
          placeholder: 'اختر طريقة الإعطاء',
        },
        {
          key: 'storage_conditions',
          label: 'ظروف التخزين',
          type: 'select',
          options: [
            { value: 'room_temperature', label: 'درجة حرارة الغرفة' },
            { value: 'refrigerated', label: 'مبرد (2-8°C)' },
            { value: 'frozen', label: 'مجمد (-20°C)' },
            { value: 'protected_from_light', label: 'محمي من الضوء' },
          ],
          placeholder: 'اختر ظروف التخزين',
        },
        {
          key: 'status',
          label: 'الحالة',
          type: 'select',
          options: [
            { value: 'active', label: 'نشط' },
            { value: 'discontinued', label: 'متوقف' },
            { value: 'recalled', label: 'مسحوب' },
          ],
          placeholder: 'اختر الحالة',
        },
      ],
    },
  ];

  return (
    <QuickInputWizard
      onSubmit={onSubmit}
      onCancel={onCancel}
      steps={STEPS}
      initialValues={initialValues ?? { status: 'active', storage_conditions: 'room_temperature' }}
      title={title || (isEdit ? 'تعديل الدواء التجاري' : 'إضافة دواء تجاري')}
      submitLabel={isEdit ? 'حفظ التعديلات' : 'إضافة الدواء'}
      isEdit={isEdit}
    />
  );
}
