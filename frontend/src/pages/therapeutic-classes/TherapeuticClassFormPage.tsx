import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, FolderTree, Save, Loader2, Zap } from 'lucide-react';
import { therapeuticClassService } from '../../services/therapeuticClassService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import TherapeuticClassWizard from '../../components/wizards/TherapeuticClassWizard';
import { useToast } from '../../components/ui/use-toast';
import type { TherapeuticClass, TherapeuticClassCreate, TherapeuticClassUpdate } from '../../types/therapeuticClass';

export default function TherapeuticClassFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [showWizard, setShowWizard] = useState(!isEdit);
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

  const handleWizardSubmit = async (data: Record<string, string>) => {
    const payload: TherapeuticClassCreate | TherapeuticClassUpdate = {
      class_code: data.class_code,
      class_name: data.class_name,
      parent_class_id: data.parent_class_id ? parseInt(data.parent_class_id) : undefined,
      description: data.description || undefined,
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
  };

  if (isEdit && loading) return <div className="flex justify-center py-16"><Loading text="جاري تحميل البيانات..." /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3 animate-slide-in">
        <Link to="/therapeutic-classes">
          <button className="w-9 h-9 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <ArrowRight className="h-4 w-4 text-[hsl(var(--foreground))]" />
          </button>
        </Link>
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
          <FolderTree className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))] leading-tight">
            {isEdit ? 'تعديل التصنيف العلاجي' : 'إضافة تصنيف علاجي'}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{isEdit ? 'تحديث بيانات التصنيف' : 'إضافة تصنيف علاجي جديد'}</p>
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
        <TherapeuticClassWizard
          onSubmit={handleWizardSubmit}
          onCancel={() => setShowWizard(false)}
          rootClasses={rootClasses}
          initialValues={isEdit ? {
            class_code: form.class_code,
            class_name: form.class_name,
            parent_class_id: form.parent_class_id,
            description: form.description,
          } : {}}
          title={isEdit ? 'تعديل التصنيف العلاجي' : 'إضافة تصنيف علاجي'}
          isEdit={isEdit}
          currentId={numericId ?? 0}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                  رمز التصنيف <span className="text-[hsl(var(--destructive))] mr-1">*</span>
                </label>
                <input
                  type="text"
                  value={form.class_code}
                  onChange={(e) => set('class_code')(e.target.value)}
                  dir="ltr"
                  placeholder="e.g. A01, B02, C10"
                  className="w-full h-10 px-3.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
                  اسم التصنيف <span className="text-[hsl(var(--destructive))] mr-1">*</span>
                </label>
                <input
                  type="text"
                  value={form.class_name}
                  onChange={(e) => set('class_name')(e.target.value)}
                  dir="ltr"
                  placeholder="e.g. Antibiotics, Analgesics"
                  className="w-full h-10 px-3.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">التصنيف الأب (اختياري)</label>
              <select
                value={form.parent_class_id}
                onChange={(e) => set('parent_class_id')(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm"
              >
                <option value="">-- تصنيف رئيسي (بدون أب) --</option>
                {rootClasses
                  .filter((c) => c.class_id !== numericId)
                  .map((c) => (
                    <option key={c.class_id} value={c.class_id}>{c.class_code} — {c.class_name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">الوصف</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm resize-none"
                placeholder="وصف التصنيف العلاجي..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/therapeutic-classes">
              <Button type="button" variant="outline">إلغاء</Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? 'حفظ التعديلات' : 'إضافة التصنيف'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
