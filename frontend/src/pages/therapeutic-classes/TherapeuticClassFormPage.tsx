import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, FolderTree, Save, Loader2 } from 'lucide-react';
import { therapeuticClassService } from '../../services/therapeuticClassService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/ui/use-toast';
import type { TherapeuticClass, TherapeuticClassCreate, TherapeuticClassUpdate } from '../../types/therapeuticClass';

export default function TherapeuticClassFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [rootClasses, setRootClasses] = useState<TherapeuticClass[]>([]);
  const [form, setForm] = useState({
    class_code: '',
    class_name: '',
    parent_class_id: '',
    description: '',
  });

  useEffect(() => {
    therapeuticClassService.getRoots().then(setRootClasses).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit || !numericId) return;
    const load = async () => {
      try {
        const data = await therapeuticClassService.get(numericId);
        setForm({
          class_code: data.class_code || '',
          class_name: data.class_name || '',
          parent_class_id: data.parent_class_id ? String(data.parent_class_id) : '',
          description: data.description || '',
        });
      } catch {
        toast({ title: 'خطأ', description: 'فشل تحميل البيانات', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, numericId]);

  const set = (field: string) => (v: string) => setForm((prev) => ({ ...prev, [field]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.class_code.trim()) {
      toast({ title: 'خطأ', description: 'رمز التصنيف مطلوب', variant: 'destructive' });
      return;
    }
    if (!form.class_name.trim()) {
      toast({ title: 'خطأ', description: 'اسم التصنيف مطلوب', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload: TherapeuticClassCreate | TherapeuticClassUpdate = {
        class_code: form.class_code,
        class_name: form.class_name,
        parent_class_id: form.parent_class_id ? parseInt(form.parent_class_id) : undefined,
        description: form.description || undefined,
      };
      if (isEdit && numericId) {
        await therapeuticClassService.update(numericId, payload as TherapeuticClassUpdate);
        toast({ title: 'تم التحديث', description: 'تم تحديث التصنيف العلاجي' });
        navigate(`/therapeutic-classes/${numericId}`);
      } else {
        const created = await therapeuticClassService.create(payload as TherapeuticClassCreate);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة التصنيف العلاجي' });
        const newId = (created as any).class_id;
        navigate(newId ? `/therapeutic-classes/${newId}` : '/therapeutic-classes');
      }
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.response?.data?.detail || 'فشل الحفظ', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loading) return <div className="flex justify-center py-16"><Loading text="جاري تحميل البيانات..." /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/therapeutic-classes">
          <button className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <ArrowRight className="h-5 w-5" />
          </button>
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <FolderTree className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {isEdit ? 'تعديل التصنيف العلاجي' : 'إضافة تصنيف علاجي'}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">{isEdit ? 'تحديث بيانات التصنيف' : 'إضافة تصنيف علاجي جديد'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* class_code */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                رمز التصنيف <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="text"
                value={form.class_code}
                onChange={(e) => set('class_code')(e.target.value)}
                dir="ltr"
                placeholder="e.g. A01, B02, C10"
                className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
              />
            </div>
            {/* class_name */}
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                اسم التصنيف <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="text"
                value={form.class_name}
                onChange={(e) => set('class_name')(e.target.value)}
                dir="ltr"
                placeholder="e.g. Antibiotics, Analgesics"
                className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
              />
            </div>
          </div>

          {/* parent_class_id */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">التصنيف الأب (اختياري)</label>
            <select
              value={form.parent_class_id}
              onChange={(e) => set('parent_class_id')(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
            >
              <option value="">-- تصنيف رئيسي (بدون أب) --</option>
              {rootClasses
                .filter((c) => c.class_id !== numericId)
                .map((c) => (
                  <option key={c.class_id} value={c.class_id}>{c.class_code} — {c.class_name}</option>
                ))}
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
              placeholder="وصف التصنيف العلاجي..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/therapeutic-classes">
            <Button type="button" variant="outline" className="rounded-xl px-6">إلغاء</Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-l from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white rounded-xl px-6 gap-2 shadow-lg shadow-amber-500/25"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
          </Button>
        </div>
      </form>
    </div>
  );
}
