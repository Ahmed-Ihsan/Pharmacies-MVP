import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeftRight, Save, Loader2 } from 'lucide-react';
import { alternativeService } from '../../services/alternativeService';
import { genericService } from '../../services/genericService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
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

  if ((isEdit && loading) || genericsLoading) return <div className="flex justify-center py-16"><Loading text="جاري التحميل..." /></div>;

  const genericOptions = generics.map((g) => (
    <option key={g.generic_id} value={g.generic_id}>
      {g.generic_name}
    </option>
  ));

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/alternatives">
          <button className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <ArrowRight className="h-5 w-5" />
          </button>
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <ArrowLeftRight className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {isEdit ? 'تعديل البديل العلاجي' : 'إضافة بديل علاجي'}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">{isEdit ? 'تحديث علاقة التبادل' : 'ربط دواء جنيس ببديله'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6 space-y-5">

          {/* Visual drug-pair selector */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                الدواء الأساسي <span className="text-red-500">*</span>
              </label>
              <select
                value={form.primary_generic_id}
                onChange={(e) => set('primary_generic_id')(e.target.value)}
                disabled={isEdit}
                className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-blue-50 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all text-sm disabled:opacity-60"
              >
                <option value="">-- اختر الدواء الأساسي --</option>
                {genericOptions}
              </select>
            </div>

            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mt-5">
              <ArrowLeftRight className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                الدواء البديل <span className="text-red-500">*</span>
              </label>
              <select
                value={form.alternative_generic_id}
                onChange={(e) => set('alternative_generic_id')(e.target.value)}
                disabled={isEdit}
                className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-emerald-50 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all text-sm disabled:opacity-60"
              >
                <option value="">-- اختر الدواء البديل --</option>
                {genericOptions}
              </select>
            </div>
          </div>

          {/* bioequivalence_status */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
              حالة التكافؤ الحيوي — اختياري
            </label>
            <select
              value={form.bioequivalence_status}
              onChange={(e) => set('bioequivalence_status')(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
            >
              <option value="">-- اختر الحالة --</option>
              {BIOEQUIVALENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes')(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm resize-none"
              placeholder="ملاحظات إضافية حول العلاقة البديلة..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/alternatives">
            <Button type="button" variant="outline" className="rounded-xl px-6">إلغاء</Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-l from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white rounded-xl px-6 gap-2 shadow-lg shadow-emerald-500/25"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'حفظ التعديلات' : 'إضافة البديل'}
          </Button>
        </div>
      </form>
    </div>
  );
}
