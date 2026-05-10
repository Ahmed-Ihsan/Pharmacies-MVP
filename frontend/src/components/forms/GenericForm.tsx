import { useEffect, useState } from 'react';
import { Pill, Save, X, RefreshCw, Info } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { TRANSLATIONS } from '../../utils/constants';
import { therapeuticClassService } from '../../services/therapeuticClassService';
import { CodeGenerator } from '../../utils/codeGenerator';

interface GenericFormProps {
  initialData?: {
    generic_name?: string;
    chemical_name?: string;
    molecular_formula?: string;
    cas_number?: string;
    therapeutic_class_id?: number;
    pharmacology?: string;
    indications?: string;
    contraindications?: string;
    side_effects?: string;
    interactions?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function GenericForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  isEdit = false 
}: GenericFormProps) {
  const [genericName, setGenericName] = useState(initialData?.generic_name || '');
  const [chemicalName, setChemicalName] = useState(initialData?.chemical_name || '');
  const [molecularFormula, setMolecularFormula] = useState(initialData?.molecular_formula || '');
  const [casNumber, setCasNumber] = useState(initialData?.cas_number || '');
  const [therapeuticClassId, setTherapeuticClassId] = useState(
    initialData?.therapeutic_class_id?.toString() || ''
  );
  const [pharmacology, setPharmacology] = useState(initialData?.pharmacology || '');
  const [indications, setIndications] = useState(initialData?.indications || '');
  const [contraindications, setContraindications] = useState(initialData?.contraindications || '');
  const [sideEffects, setSideEffects] = useState(initialData?.side_effects || '');
  const [interactions, setInteractions] = useState(initialData?.interactions || '');
  const [therapeuticClasses, setTherapeuticClasses] = useState<Array<{ id: number; name: string }>>([]);
  const [therapeuticClassesLoading, setTherapeuticClassesLoading] = useState(true);

  // Auto-generate CAS number on mount for new records
  useEffect(() => {
    if (!isEdit && !casNumber) {
      setCasNumber(CodeGenerator.generateCasNumber());
    }
  }, [isEdit, casNumber]);

  const handleRegenerateCasNumber = () => {
    setCasNumber(CodeGenerator.generateCasNumber());
  };

  useEffect(() => {
    const loadTherapeuticClasses = async () => {
      try {
        const res = await therapeuticClassService.list({ limit: 1000 });
        setTherapeuticClasses(
          res.items
            .map((item: any) => ({
              id: item.id ?? item.class_id,
              name: item.name ?? item.class_name,
            }))
            .filter((x: any) => typeof x.id === 'number' && !!x.name)
        );
      } finally {
        setTherapeuticClassesLoading(false);
      }
    };
    loadTherapeuticClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      generic_name: genericName,
    };

    if (chemicalName) data.chemical_name = chemicalName;
    if (molecularFormula) data.molecular_formula = molecularFormula;
    if (casNumber) data.cas_number = casNumber;
    if (therapeuticClassId) data.therapeutic_class_id = parseInt(therapeuticClassId, 10);
    if (pharmacology) data.pharmacology = pharmacology;
    if (indications) data.indications = indications;
    if (contraindications) data.contraindications = contraindications;
    if (sideEffects) data.side_effects = sideEffects;
    if (interactions) data.interactions = interactions;

    await onSubmit(data);
  };

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
          <Pill className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
          {isEdit ? 'تعديل دواء جنيس' : 'إضافة دواء جنيس جديد'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            الاسم العام (Generic Name) <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={genericName}
            onChange={(e) => setGenericName(e.target.value)}
            placeholder="أدخل الاسم العام للدواء"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            الاسم الكيميائي
          </label>
          <Input
            type="text"
            value={chemicalName}
            onChange={(e) => setChemicalName(e.target.value)}
            placeholder="أدخل الاسم الكيميائي"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            المعادلة الجزيئية
          </label>
          <Input
            type="text"
            value={molecularFormula}
            onChange={(e) => setMolecularFormula(e.target.value)}
            placeholder="أدخل المعادلة الجزيئية"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            رقم CAS
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={casNumber}
              onChange={(e) => setCasNumber(e.target.value)}
              placeholder="أدخل رقم CAS"
              disabled={isLoading}
              className="flex-1"
            />
            {!isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRegenerateCasNumber}
                disabled={isLoading}
                className="px-3"
                title="توليد رقم جديد"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <Info className="h-3.5 w-3.5" />
            <span>النمط: {CodeGenerator.getPatternDescription('cas_number')}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            التصنيف العلاجي
          </label>
          <select
            value={therapeuticClassId}
            onChange={(e) => setTherapeuticClassId(e.target.value)}
            disabled={isLoading || therapeuticClassesLoading}
            className="w-full h-10 px-3 rounded-md border border-[hsl(var(--border))] bg-transparent text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
          >
            <option value="">اختر التصنيف العلاجي...</option>
            {therapeuticClasses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            الدوائية (Pharmacology)
          </label>
          <textarea
            value={pharmacology}
            onChange={(e) => setPharmacology(e.target.value)}
            placeholder="وصف الدوائية (اختياري)"
            disabled={isLoading}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            المؤشرات (Indications)
          </label>
          <textarea
            value={indications}
            onChange={(e) => setIndications(e.target.value)}
            placeholder="المؤشرات العلاجية (اختياري)"
            disabled={isLoading}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            موانع الاستعمال (Contraindications)
          </label>
          <textarea
            value={contraindications}
            onChange={(e) => setContraindications(e.target.value)}
            placeholder="موانع الاستعمال (اختياري)"
            disabled={isLoading}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            الآثار الجانبية (Side Effects)
          </label>
          <textarea
            value={sideEffects}
            onChange={(e) => setSideEffects(e.target.value)}
            placeholder="الآثار الجانبية (اختياري)"
            disabled={isLoading}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            التداخلات الدوائية (Interactions)
          </label>
          <textarea
            value={interactions}
            onChange={(e) => setInteractions(e.target.value)}
            placeholder="التداخلات الدوائية (اختياري)"
            disabled={isLoading}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading || !genericName}
            className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))] hover:shadow-lg transition-shadow"
          >
            <Save className="h-4 w-4 ml-2" />
            {isLoading ? 'جاري الحفظ...' : TRANSLATIONS.save}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 ml-2" />
            {TRANSLATIONS.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
