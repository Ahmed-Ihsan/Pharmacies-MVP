import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, Building2, Save, Loader2 } from 'lucide-react';
import { manufacturerService } from '../../services/manufacturerService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/ui/use-toast';
import type { ManufacturerCreate, ManufacturerUpdate } from '../../types/manufacturer';

const COUNTRIES = [
  'IQ', 'SA', 'AE', 'EG', 'JO', 'KW', 'LB',
  'DE', 'FR', 'US', 'GB', 'IN',
  'CN', 'TR', 'IR', 'PK', 'OTHER',
];

const COUNTRY_LABELS: Record<string, string> = {
  IQ: 'العراق', SA: 'السعودية', AE: 'الإمارات', EG: 'مصر', JO: 'الأردن',
  KW: 'الكويت', LB: 'لبنان', DE: 'ألمانيا', FR: 'فرنسا', US: 'الولايات المتحدة',
  GB: 'المملكة المتحدة', IN: 'الهند', CN: 'الصين', TR: 'تركيا',
  IR: 'إيران', PK: 'باكستان', OTHER: 'أخرى',
};

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  ltr?: boolean;
  type?: string;
  placeholder?: string;
}

function Field({ label, name, value, onChange, required, ltr, type = 'text', placeholder }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        dir={ltr ? 'ltr' : 'rtl'}
        className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
      />
    </div>
  );
}

export default function ManufacturerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    manufacturer_name: '',
    country_code: '',
    license_number: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
  });

  useEffect(() => {
    if (!isEdit || !numericId) return;
    const load = async () => {
      try {
        const data = await manufacturerService.get(numericId);
        setForm({
          manufacturer_name: data.manufacturer_name || '',
          country_code: data.country_code || '',
          license_number: data.license_number || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          status: data.status || 'active',
        });
      } catch {
        toast({ title: 'خطأ', description: 'فشل تحميل بيانات الشركة', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, numericId]);

  const set = (field: string) => (v: string) => setForm((prev) => ({ ...prev, [field]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.manufacturer_name.trim()) {
      toast({ title: 'خطأ', description: 'اسم الشركة مطلوب', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload: ManufacturerCreate | ManufacturerUpdate = {
        manufacturer_name: form.manufacturer_name,
        country_code: form.country_code === 'OTHER' ? 'OT' : form.country_code || undefined,
        license_number: form.license_number || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        status: form.status || undefined,
      };

      if (isEdit && numericId) {
        await manufacturerService.update(numericId, payload as ManufacturerUpdate);
        toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الشركة المصنعة' });
        navigate(`/manufacturers/${numericId}`);
      } else {
        const created = await manufacturerService.create(payload as ManufacturerCreate);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة الشركة المصنعة بنجاح' });
        const newId = (created as any).manufacturer_id;
        navigate(newId ? `/manufacturers/${newId}` : '/manufacturers');
      }
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.response?.data?.detail || 'فشل الحفظ', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loading) return <div className="flex justify-center py-16"><Loading text="جاري تحميل البيانات..." /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/manufacturers">
          <button className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
            <ArrowRight className="h-5 w-5 text-[hsl(var(--foreground))]" />
          </button>
        </Link>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {isEdit ? 'تعديل الشركة المصنعة' : 'إضافة شركة مصنعة'}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">{isEdit ? 'تحديث بيانات الشركة' : 'إضافة شركة مصنعة جديدة إلى النظام'}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6 space-y-6">
          <h2 className="font-semibold text-[hsl(var(--foreground))] pb-3 border-b border-[hsl(var(--border))]">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="اسم الشركة" name="manufacturer_name" value={form.manufacturer_name} onChange={set('manufacturer_name')} required ltr />
            <Field label="رقم الترخيص" name="license_number" value={form.license_number} onChange={set('license_number')} ltr />
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">الدولة (رمز)</label>
            <select
              value={form.country_code}
              onChange={(e) => set('country_code')(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
            >
              <option value="">-- اختر الدولة --</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{COUNTRY_LABELS[c] || c}</option>)}
            </select>
          </div>

          <h2 className="font-semibold text-[hsl(var(--foreground))] pb-3 border-b border-[hsl(var(--border))] pt-2">معلومات التواصل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="البريد الإلكتروني" name="email" value={form.email} onChange={set('email')} ltr type="email" />
            <Field label="الهاتف" name="phone" value={form.phone} onChange={set('phone')} ltr type="tel" />
            <Field label="العنوان" name="address" value={form.address} onChange={set('address')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1.5">الحالة</label>
            <select
              value={form.status}
              onChange={(e) => set('status')(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))] transition-all text-sm"
            >
              <option value="active">نشط</option>
              <option value="suspended">غير نشط</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/manufacturers">
            <Button type="button" variant="outline" className="rounded-xl px-6">إلغاء</Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-l from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800 text-white rounded-xl px-6 gap-2 shadow-lg shadow-violet-500/25"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'حفظ التعديلات' : 'إضافة الشركة'}
          </Button>
        </div>
      </form>
    </div>
  );
}
