import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, Loader2, Zap, ArrowRight, Tag } from 'lucide-react';
import BrandForm from '../../components/forms/BrandForm';
import BrandWizard from '../../components/wizards/BrandWizard';
import { brandService } from '../../services/brandService';
import { genericService } from '../../services/genericService';
import { manufacturerService } from '../../services/manufacturerService';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/ui/use-toast';

export default function BrandFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [showWizard, setShowWizard] = useState(!isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandData, setBrandData] = useState<any>(null);
  const [loading, setLoading] = useState(isEdit);
  const [generics, setGenerics] = useState<{ id: number; name: string }[]>([]);
  const [manufacturers, setManufacturers] = useState<{ id: number; name: string }[]>([]);
  const DOSAGE_FORMS = [
    { id: 1, name: 'Tablet' }, { id: 2, name: 'Capsule' }, { id: 3, name: 'Syrup' },
    { id: 4, name: 'Injection' }, { id: 5, name: 'Cream' }, { id: 6, name: 'Ointment' },
    { id: 7, name: 'Drops' }, { id: 8, name: 'Inhaler' },
  ];

  useEffect(() => {
    Promise.all([
      genericService.list({ limit: 500 }),
      manufacturerService.list({ limit: 500 }),
    ]).then(([gRes, mRes]) => {
      setGenerics(gRes.items.map((g: any) => ({ id: g.generic_id ?? g.id ?? 0, name: g.generic_name ?? 'Unknown' })));
      setManufacturers(mRes.items.map((m: any) => ({ id: m.manufacturer_id ?? m.id ?? 0, name: m.manufacturer_name ?? 'Unknown' })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (isEdit && numericId) {
        try {
          const data = await brandService.get(numericId);
          setBrandData(data);
        } catch (err) {
          console.error('Failed to load brand data', err);
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
        await brandService.update(numericId, data);
        toast({ title: "تم التحديث بنجاح", description: "تم تحديث بيانات الدواء التجاري" });
      } else {
        await brandService.create(data);
        toast({ title: "تمت الإضافة بنجاح", description: "تم إضافة الدواء التجاري إلى النظام" });
      }
      navigate('/brands');
    } catch (err: any) {
      toast({ title: "فشل الحفظ", description: err.response?.data?.detail || 'فشل الحفظ', variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWizardSubmit = async (data: Record<string, string>) => {
    const payload: any = {
      brand_name: data.brand_name,
      generic_id: parseInt(data.generic_id),
    };
    if (data.manufacturer_id) payload.manufacturer_id = parseInt(data.manufacturer_id);
    if (data.dosage_form_id) payload.dosage_form_id = parseInt(data.dosage_form_id);
    if (data.strength_value) payload.strength_value = parseFloat(data.strength_value);
    if (data.strength_unit) payload.strength_unit = data.strength_unit;
    if (data.package_size) payload.package_size = data.package_size;
    if (data.atc_code) payload.atc_code = data.atc_code;
    if (data.route_of_administration) payload.route_of_administration = data.route_of_administration;
    if (data.storage_conditions) payload.storage_conditions = data.storage_conditions;
    if (data.status) payload.status = data.status;

    if (isEdit && numericId) {
      await brandService.update(numericId, payload);
      toast({ title: "تم التحديث بنجاح", description: "تم تحديث بيانات الدواء التجاري" });
      navigate(`/brands/${numericId}`);
    } else {
      const created = await brandService.create(payload);
      toast({ title: "تمت الإضافة بنجاح", description: "تم إضافة الدواء التجاري إلى النظام" });
      const newId = (created as any).brand_id;
      navigate(newId ? `/brands/${newId}` : '/brands');
    }
  };

  if (isEdit && loading) {
    return (
      <div className="flex justify-center min-h-[400px]">
        <Loading text="جاري تحميل البيانات..." />
      </div>
    );
  }

  const wizardInitialValues: Record<string, string> = brandData ? {
    brand_name: String(brandData.brand_name || ''),
    generic_id: brandData.generic_id ? String(brandData.generic_id) : '',
    manufacturer_id: brandData.manufacturer_id ? String(brandData.manufacturer_id) : '',
    dosage_form_id: brandData.dosage_form_id ? String(brandData.dosage_form_id) : '',
    strength_value: brandData.strength_value ? String(brandData.strength_value) : '',
    strength_unit: String(brandData.strength_unit || ''),
    package_size: String(brandData.package_size || ''),
    atc_code: String(brandData.atc_code || ''),
    route_of_administration: String(brandData.route_of_administration || ''),
    storage_conditions: String(brandData.storage_conditions || 'room_temperature'),
    status: String(brandData.status || 'active'),
  } : { status: 'active', storage_conditions: 'room_temperature' };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 animate-slide-in">
        <Link to="/brands">
          <button className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <ArrowRight className="h-5 w-5" />
          </button>
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center shadow-sm">
          <Tag className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {isEdit ? 'تعديل الدواء التجاري' : 'إضافة دواء تجاري'}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">{isEdit ? 'تحديث بيانات الدواء' : 'إضافة دواء تجاري جديد'}</p>
        </div>
        <button
          onClick={() => setShowWizard(!showWizard)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] text-white transition-colors shadow-sm"
        >
          <Zap className="h-4 w-4" />
          {showWizard ? 'النموذج التقليدي' : 'الإدخال السريع'}
        </button>
      </div>

      {/* Wizard or Classic Form */}
      {showWizard ? (
        <BrandWizard
          onSubmit={handleWizardSubmit}
          onCancel={() => setShowWizard(false)}
          generics={generics}
          manufacturers={manufacturers}
          dosageForms={DOSAGE_FORMS}
          initialValues={wizardInitialValues}
          title={isEdit ? 'تعديل الدواء التجاري' : 'إضافة دواء تجاري'}
          isEdit={isEdit}
        />
      ) : (
        <div className="animate-slide-up">
          <BrandForm
            initialData={brandData || undefined}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/brands')}
            isLoading={isSubmitting}
            isEdit={isEdit}
          />
        </div>
      )}
    </div>
  );
}
