import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, Container, Save, Loader2 } from 'lucide-react';
import { dosageFormService } from '../../services/dosageFormService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/ui/use-toast';
import type { DosageFormCreate, DosageFormUpdate } from '../../types/dosageForm';

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

export default function DosageFormFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ form_code: '', form_name: '', form_category: '', description: '' });

  useEffect(() => {
    if (!isEdit || !numericId) return;
    dosageFormService.get(numericId)
      .then((data) => {
        setForm({
          form_code: data.form_code || '',
          form_name: data.form_name || '',
          form_category: data.form_category || '',
          description: data.description || '',
        });
      })
      .catch(() => toast({ title: 'خطأ', description: 'فشل تحميل البيانات', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [isEdit, numericId]);

  const set = (field: string) => (v: string) => setForm((p) => ({ ...p, [field]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.form_code.trim()) {
      toast({ title: 'خطأ', description: 'رمز شكل الجرعة مطلوب', variant: 'destructive' });
      return;
    }
    if (!form.form_name.trim()) {
      toast({ title: 'خطأ', description: 'اسم شكل الجرعة مطلوب', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        form_code: form.form_code,
        form_name: form.form_name,
        form_category: form.form_category || undefined,
        description: form.description || undefined,
      };
      if (isEdit && numericId) {
        await dosageFormService.update(numericId, payload as DosageFormUpdate);
        toast({ title: 'تم التحديث', description: 'تم تحديث شكل الجرعة' });
        navigate(`/dosage-forms/${numericId}`);
      } else {
        const created = await dosageFormService.create(payload as DosageFormCreate);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة شكل الجرعة' });
        const newId = (created as any).dosage_form_id;
        navigate(newId ? `/dosage-forms/${newId}` : '/dosage-forms');
      }
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.response?.data?.detail || 'فشل الحفظ', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loading) return <div className="flex justify-center py-16"><Loading text="جاري التحميل..." /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/dosage-forms">
          <button className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <ArrowRight className="h-5 w-5" />
          </button>
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/25">
          <Container className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {isEdit ? 'تعديل شكل الجرعة' : 'إضافة شكل جرعة'}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">{isEdit ? 'تحديث بيانات شكل الجرعة' : 'إضافة شكل جرعة جديد'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* form_code */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                رمز الشكل <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="text"
                value={form.form_code}
                onChange={(e) => set('form_code')(e.target.value)}
                dir="ltr"
                placeholder="e.g. TAB, CAP, SYR"
                className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
              />
            </div>
            {/* form_name */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                اسم الشكل <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="text"
                value={form.form_name}
                onChange={(e) => set('form_name')(e.target.value)}
                dir="ltr"
                placeholder="e.g. Tablet, Capsule, Syrup"
                className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
              />
            </div>
          </div>

          {/* form_category */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">فئة الشكل</label>
            <select
              value={form.form_category}
              onChange={(e) => set('form_category')(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
            >
              <option value="">-- اختر الفئة --</option>
              {FORM_CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>

          {/* description */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm resize-none"
              placeholder="وصف شكل الجرعة..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/dosage-forms">
            <Button type="button" variant="outline" className="rounded-xl px-6">إلغاء</Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-l from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white rounded-xl px-6 gap-2 shadow-lg shadow-rose-500/25"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'حفظ التعديلات' : 'إضافة شكل الجرعة'}
          </Button>
        </div>
      </form>
    </div>
  );
}
