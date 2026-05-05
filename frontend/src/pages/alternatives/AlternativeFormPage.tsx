import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeftRight, Save, Loader2, Zap } from 'lucide-react';
import { alternativeService } from '../../services/alternativeService';
import { genericService } from '../../services/genericService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import AlternativeWizard from '../../components/wizards/AlternativeWizard';
import { useToast } from '../../components/ui/use-toast';
import type { GenericAlternativeCreate, GenericAlternativeUpdate } from '../../types/alternative';
import type { GenericDrug } from '../../types/generic';

const BIOEQUIVALENCE_OPTIONS = [
  { value: 'proven', label: 'مثبتة التكافؤ الحيوي' },
  { value: 'assumed', label: 'مفترضة التكافؤ' },
  { value: 'not_established', label: 'غير محددة' },
];

export default function AlternativeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [showWizard, setShowWizard] = useState(!isEdit);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [generics, setGenerics] = useState<GenericDrug[]>([]);
  const [genericsLoading, setGenericsLoading] = useState(true);
  const [form, setForm] = useState({
    primary_generic_id: '',
    alternative_generic_id: '',
    bioequivalence_status: '',
    notes: '',
  });

  // Load all generics for dropdown
  useEffect(() => {
    genericService.list({ limit: 1000 })
      .then((res) => setGenerics(res.items))
      .catch(() => {})
      .finally(() => setGenericsLoading(false));
  }, []);

  // Load existing data when editing
  useEffect(() => {
    if (!isEdit || !numericId) return;
    alternativeService.get(numericId)
      .then((data) => {
        setForm({
          primary_generic_id: String(data.primary_generic_id),
          alternative_generic_id: String(data.alternative_generic_id),
          bioequivalence_status: data.bioequivalence_status || '',
          notes: data.notes || '',
        });
      })
      .catch(() => toast({ title: 'خطأ', description: 'فشل تحميل البيانات', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [isEdit, numericId]);

  const set = (field: string) => (v: string) => setForm((p) => ({ ...p, [field]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.primary_generic_id || !form.alternative_generic_id) {
      toast({ title: 'خطأ', description: 'يجب اختيار الدواء الأساسي والبديل', variant: 'destructive' });
      return;
    }
    if (form.primary_generic_id === form.alternative_generic_id) {
      toast({ title: 'خطأ', description: 'لا يمكن أن يكون الدواء الأساسي والبديل نفس الدواء', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && numericId) {
        const updatePayload: GenericAlternativeUpdate = {
          bioequivalence_status: form.bioequivalence_status || undefined,
          notes: form.notes || undefined,
        };
        await alternativeService.update(numericId, updatePayload);
        toast({ title: 'تم التحديث', description: 'تم تحديث العلاقة البديلة' });
      } else {
        const createPayload: GenericAlternativeCreate = {
          primary_generic_id: parseInt(form.primary_generic_id),
          alternative_generic_id: parseInt(form.alternative_generic_id),
          bioequivalence_status: form.bioequivalence_status || undefined,
          notes: form.notes || undefined,
        };
        await alternativeService.create(createPayload);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة البديل العلاجي' });
      }
      navigate('/alternatives');
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.response?.data?.detail || 'فشل الحفظ', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWizardSubmit = async (data: Record<string, string>) => {
    if (data.primary_generic_id === data.alternative_generic_id) {
      throw new Error('لا يمكن أن يكون الدواء الأساسي والبديل نفس الدواء');
    }
    if (isEdit && numericId) {
      const updatePayload: GenericAlternativeUpdate = {
        bioequivalence_status: data.bioequivalence_status || undefined,
        notes: data.notes || undefined,
      };
      await alternativeService.update(numericId, updatePayload);
      toast({ title: 'تم التحديث', description: 'تم تحديث العلاقة البديلة' });
      navigate('/alternatives');
    } else {
      const createPayload: GenericAlternativeCreate = {
        primary_generic_id: parseInt(data.primary_generic_id),
        alternative_generic_id: parseInt(data.alternative_generic_id),
        bioequivalence_status: data.bioequivalence_status || undefined,
        notes: data.notes || undefined,
      };
      await alternativeService.create(createPayload);
      toast({ title: 'تمت الإضافة', description: 'تم إضافة البديل العلاجي' });
      navigate('/alternatives');
    }
  };

  if ((isEdit && loading) || genericsLoading) return <div className="flex justify-center py-16"><Loading text="جاري التحميل..." /></div>;

  const genericOptions = generics.map((g) => (
    <option key={g.generic_id} value={g.generic_id}>
      {g.generic_name}
    </option>
  ));

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3 animate-slide-in">
        <Link to="/alternatives">
          <button className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <ArrowRight className="h-4 w-4 text-[hsl(var(--foreground))]" />
          </button>
        </Link>
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
          <ArrowLeftRight className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))] leading-tight">
            {isEdit ? 'تعديل البديل العلاجي' : 'إضافة بديل علاجي'}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{isEdit ? 'تحديث علاقة التبادل' : 'ربط دواء جنيس ببديله'}</p>
        </div>
        <button
          onClick={() => setShowWizard(!showWizard)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(217_88%_44%)] text-white text-sm font-semibold transition-colors"
        >
          <Zap className="h-3.5 w-3.5" />
          {showWizard ? 'النموذج التقليدي' : 'الإدخال السريع'}
        </button>
      </div>

      {/* Wizard or Classic Form */}
      {showWizard ? (
        <AlternativeWizard
          onSubmit={handleWizardSubmit}
          onCancel={() => setShowWizard(false)}
          generics={generics.map(g => ({ generic_id: g.generic_id, generic_name: g.generic_name }))}
          initialValues={isEdit ? {
            primary_generic_id: form.primary_generic_id,
            alternative_generic_id: form.alternative_generic_id,
            bioequivalence_status: form.bioequivalence_status,
            notes: form.notes,
          } : {}}
          title={isEdit ? 'تعديل البديل العلاجي' : 'إضافة بديل علاجي'}
          isEdit={isEdit}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                  الدواء الأساسي <span className="text-[hsl(var(--destructive))]">*</span>
                </label>
                <select
                  value={form.primary_generic_id}
                  onChange={(e) => set('primary_generic_id')(e.target.value)}
                  disabled={isEdit}
                  className="w-full h-10 px-3.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm disabled:opacity-50 disabled:bg-[hsl(var(--muted))]"
                >
                  <option value="">-- اختر الدواء الأساسي --</option>
                  {genericOptions}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                  الدواء البديل <span className="text-[hsl(var(--destructive))]">*</span>
                </label>
                <select
                  value={form.alternative_generic_id}
                  onChange={(e) => set('alternative_generic_id')(e.target.value)}
                  disabled={isEdit}
                  className="w-full h-10 px-3.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm disabled:opacity-50 disabled:bg-[hsl(var(--muted))]"
                >
                  <option value="">-- اختر الدواء البديل --</option>
                  {genericOptions}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">حالة التكافؤ الحيوي</label>
              <select
                value={form.bioequivalence_status}
                onChange={(e) => set('bioequivalence_status')(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm"
              >
                <option value="">-- اختر الحالة --</option>
                {BIOEQUIVALENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">ملاحظات</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes')(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm resize-none"
                placeholder="ملاحظات إضافية حول العلاقة البديلة..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/alternatives">
              <Button type="button" variant="outline">إلغاء</Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? 'حفظ التعديلات' : 'إضافة البديل'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
