import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Zap, ArrowRight, Pill } from 'lucide-react';
import GenericForm from '../../components/forms/GenericForm';
import GenericWizard from '../../components/wizards/GenericWizard';
import { genericService } from '../../services/genericService';
import { therapeuticClassService } from '../../services/therapeuticClassService';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/ui/use-toast';

export default function GenericFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [showWizard, setShowWizard] = useState(!isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genericData, setGenericData] = useState<any>(null);
  const [loading, setLoading] = useState(isEdit);
  const [therapeuticClasses, setTherapeuticClasses] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    therapeuticClassService.list({ limit: 1000 }).then((res) => {
      setTherapeuticClasses(
        res.items
          .map((item: any) => ({ id: item.class_id ?? item.id, name: item.class_name ?? item.name }))
          .filter((x: any) => typeof x.id === 'number' && !!x.name)
      );
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (isEdit && numericId) {
        try {
          const data = await genericService.get(numericId);
          setGenericData(data);
        } catch (err) {
          console.error('Failed to load generic data', err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [isEdit, numericId]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEdit && numericId) {
        await genericService.update(numericId, data);
        toast({ title: "تم التحديث بنجاح", description: "تم تحديث بيانات الدواء الجنيس" });
      } else {
        await genericService.create(data);
        toast({ title: "تمت الإضافة بنجاح", description: "تم إضافة الدواء الجنيس إلى النظام" });
      }
      navigate('/generics');
    } catch (err: any) {
      toast({ title: "فشل الحفظ", description: err.response?.data?.detail || 'فشل الحفظ', variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWizardSubmit = async (data: Record<string, string>) => {
    const payload: any = { generic_name: data.generic_name };
    if (data.chemical_name) payload.chemical_name = data.chemical_name;
    if (data.molecular_formula) payload.molecular_formula = data.molecular_formula;
    if (data.cas_number) payload.cas_number = data.cas_number;
    if (data.therapeutic_class_id) payload.therapeutic_class_id = parseInt(data.therapeutic_class_id);
    if (data.pharmacology) payload.pharmacology = data.pharmacology;
    if (data.indications) payload.indications = data.indications;
    if (data.contraindications) payload.contraindications = data.contraindications;
    if (data.side_effects) payload.side_effects = data.side_effects;
    if (data.interactions) payload.interactions = data.interactions;

    if (isEdit && numericId) {
      await genericService.update(numericId, payload);
      toast({ title: "تم التحديث بنجاح", description: "تم تحديث بيانات الدواء الجنيس" });
      navigate(`/generics/${numericId}`);
    } else {
      const created = await genericService.create(payload);
      toast({ title: "تمت الإضافة بنجاح", description: "تم إضافة الدواء الجنيس إلى النظام" });
      const newId = (created as any).generic_id;
      navigate(newId ? `/generics/${newId}` : '/generics');
    }
  };

  if (isEdit && loading) {
    return (
      <div className="flex justify-center min-h-[400px]">
        <Loading text="جاري تحميل البيانات..." />
      </div>
    );
  }

  const wizardInitialValues: Record<string, string> = genericData ? {
    generic_name: String(genericData.generic_name || ''),
    chemical_name: String(genericData.chemical_name || ''),
    molecular_formula: String(genericData.molecular_formula || ''),
    cas_number: String(genericData.cas_number || ''),
    therapeutic_class_id: genericData.therapeutic_class_id ? String(genericData.therapeutic_class_id) : '',
    pharmacology: String(genericData.pharmacology || ''),
    indications: String(genericData.indications || ''),
    contraindications: String(genericData.contraindications || ''),
    side_effects: String(genericData.side_effects || ''),
    interactions: String(genericData.interactions || ''),
  } : {};

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <Link to="/generics">
          <button className="h-10 w-10 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <ArrowRight className="h-5 w-5 text-[hsl(var(--foreground))]" />
          </button>
        </Link>
        <div className="h-12 w-12 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center shadow-sm">
          <Pill className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {isEdit ? 'تعديل الدواء الجنيس' : 'إضافة دواء جنيس'}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">{isEdit ? 'تحديث بيانات الدواء' : 'إضافة دواء جنيس جديد'}</p>
        </div>
        <button
          onClick={() => setShowWizard(!showWizard)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[hsl(var(--primary))] text-white"
        >
          <Zap className="h-4 w-4" />
          {showWizard ? 'النموذج التقليدي' : 'الإدخال السريع'}
        </button>
      </div>

      {/* Wizard or Classic Form */}
      {showWizard ? (
        <GenericWizard
          onSubmit={handleWizardSubmit}
          onCancel={() => setShowWizard(false)}
          therapeuticClasses={therapeuticClasses}
          initialValues={wizardInitialValues}
          title={isEdit ? 'تعديل الدواء الجنيس' : 'إضافة دواء جنيس'}
          isEdit={isEdit}
        />
      ) : (
        <div className="animate-slide-up">
          <GenericForm
            initialData={genericData || undefined}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/generics')}
            isLoading={isSubmitting}
            isEdit={isEdit}
          />
        </div>
      )}
    </div>
  );
}
