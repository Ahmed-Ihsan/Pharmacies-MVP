import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, Building2, Save, Loader2, Zap, Building, FileText, Globe, Phone, Mail, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';
import { manufacturerService } from '../../services/manufacturerService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ManufacturerWizard from '../../components/wizards/ManufacturerWizard';
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
  icon?: React.ReactNode;
}

function Field({ label, name, value, onChange, required, ltr, type = 'text', placeholder, icon }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[hsl(var(--text-secondary))]">
        <span className="text-[hsl(var(--primary))]">{icon}</span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative group">
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || label}
          dir={ltr ? 'ltr' : 'rtl'}
          className="w-full h-12 px-4 pr-12 rounded-xl bg-[hsl(var(--bg-elevated))] border-2 border-[hsl(var(--border))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))]/40 focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary)/0.1)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm font-medium group-hover:border-[hsl(var(--border-glow))] group-hover:shadow-lg"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--primary))]">
          {icon}
        </div>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[hsl(var(--primary)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
}

export default function ManufacturerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [showWizard, setShowWizard] = useState(!isEdit);
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

  /* ── wizard submit ── */
  const handleWizardSubmit = async (data: Record<string, string>) => {
    const payload: ManufacturerCreate | ManufacturerUpdate = {
      manufacturer_name: data.manufacturer_name,
      country_code: data.country_code === 'OTHER' ? 'OT' : data.country_code || undefined,
      license_number: data.license_number || undefined,
      address: data.address || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      status: data.status || undefined,
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
  };

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

  if (isEdit && loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[hsl(var(--bg-deep))]">
      <div className="text-center space-y-4">
        <Loading text="جاري تحميل البيانات..." />
      </div>
    </div>
  );

  const wizardInitialValues: Record<string, string> = isEdit ? {
    manufacturer_name: form.manufacturer_name,
    country_code: form.country_code,
    license_number: form.license_number,
    address: form.address,
    phone: form.phone,
    email: form.email,
    status: form.status,
  } : { status: 'active' };

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--bg-deep))] relative overflow-hidden">
      {/* Radial Gradient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] bg-[hsl(var(--primary)/0.15)] rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] md:w-[500px] md:h-[500px] bg-[hsl(180_60%_50%/0.1)] rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-24 space-y-8 md:space-y-12">
        {/* Page Header - Double-Bezel Architecture */}
        <div className="bg-[hsl(var(--bg-surface)/0.5)] backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] p-2 ring-1 ring-[hsl(var(--border))] shadow-[var(--shadow-md)]">
          <div className="bg-[hsl(var(--bg-surface))] rounded-[calc(1.5rem-0.5rem)_sm:calc(2rem-0.5rem)] p-4 sm:p-6 md:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex flex-col sm:flex-row md:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <Link to="/manufacturers">
                  <button className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[hsl(var(--bg-elevated))] hover:bg-[hsl(var(--primary))] flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group">
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--text-secondary))] group-hover:text-white transition-colors" />
                  </button>
                </Link>
                <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_40%)] flex items-center justify-center shadow-[0_8px_32px_hsl(var(--primary)/0.3)]">
                  <Building2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] mb-2 sm:mb-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--primary))]">
                    {isEdit ? 'تعديل' : 'إضافة'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[hsl(var(--text-primary))] leading-tight">
                  {isEdit ? 'تعديل الشركة المصنعة' : 'إضافة شركة مصنعة'}
                </h1>
                <p className="text-sm sm:text-base text-[hsl(var(--text-secondary))] mt-1 sm:mt-2">
                  {isEdit ? 'تحديث بيانات الشركة' : 'إضافة شركة مصنعة جديدة إلى النظام'}
                </p>
              </div>
              <button
                onClick={() => setShowWizard(!showWizard)}
                className="group relative inline-flex items-center gap-2 sm:gap-3 h-10 sm:h-12 px-4 sm:px-6 rounded-full bg-[hsl(var(--primary))] hover:bg-[hsl(270_70%_50%)] text-white text-xs sm:text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] shadow-[0_4px_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_6px_30px_hsl(var(--primary)/0.4)]"
              >
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{showWizard ? 'النموذج التقليدي' : 'الإدخال السريع'}</span>
                <span className="sm:hidden">{showWizard ? 'تقليدي' : 'سريع'}</span>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

      {/* Wizard or Classic Form */}
      {showWizard ? (
        <ManufacturerWizard
          onSubmit={handleWizardSubmit}
          onCancel={() => setShowWizard(false)}
          initialValues={wizardInitialValues}
          title={isEdit ? 'تعديل الشركة المصنعة' : 'إضافة شركة مصنعة'}
          isEdit={isEdit}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Form Card - Double-Bezel Architecture */}
          <div className="bg-[hsl(var(--bg-surface)/0.5)] backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] p-2 ring-1 ring-[hsl(var(--border))] shadow-[var(--shadow-md)]">
            <div className="bg-[hsl(var(--bg-surface))] rounded-[calc(1.5rem-0.5rem)_sm:calc(2rem-0.5rem)] p-4 sm:p-6 md:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] space-y-6 sm:space-y-8">
              {/* Section Header */}
              <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-[hsl(var(--border))]">
                <div className="h-6 sm:h-8 w-1 rounded-full bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(270_70%_40%)]" />
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--text-secondary))]">
                  المعلومات الأساسية
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Field label="اسم الشركة" name="manufacturer_name" value={form.manufacturer_name} onChange={set('manufacturer_name')} required ltr icon={<Building className="h-4 w-4" />} />
                <Field label="رقم الترخيص" name="license_number" value={form.license_number} onChange={set('license_number')} ltr icon={<FileText className="h-4 w-4" />} />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[hsl(var(--text-secondary))]">
                  <span className="text-[hsl(var(--primary))]"><Globe className="h-4 w-4" /></span>
                  الدولة
                </label>
                <div className="relative group">
                  <select
                    value={form.country_code}
                    onChange={(e) => set('country_code')(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-[hsl(var(--bg-elevated))] border-2 border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary)/0.1)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm font-medium appearance-none cursor-pointer group-hover:border-[hsl(var(--border-glow))] group-hover:shadow-lg"
                  >
                    <option value="">-- اختر الدولة --</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{COUNTRY_LABELS[c] || c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--primary))]">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]/40 pointer-events-none">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[hsl(var(--primary)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Section Header */}
              <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-[hsl(var(--border))] pt-3 sm:pt-4">
                <div className="h-6 sm:h-8 w-1 rounded-full bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(270_70%_40%)]" />
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-[hsl(var(--text-secondary))]">
                  معلومات التواصل
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Field label="البريد الإلكتروني" name="email" value={form.email} onChange={set('email')} ltr type="email" icon={<Mail className="h-4 w-4" />} />
                <Field label="الهاتف" name="phone" value={form.phone} onChange={set('phone')} ltr type="tel" icon={<Phone className="h-4 w-4" />} />
                <Field label="العنوان" name="address" value={form.address} onChange={set('address')} icon={<MapPin className="h-4 w-4" />} />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[hsl(var(--text-secondary))]">
                  <span className="text-[hsl(var(--primary))]"><CheckCircle2 className="h-4 w-4" /></span>
                  الحالة
                </label>
                <div className="relative group">
                  <select
                    value={form.status}
                    onChange={(e) => set('status')(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-[hsl(var(--bg-elevated))] border-2 border-[hsl(var(--border))] text-[hsl(var(--text-primary))] focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary)/0.1)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm font-medium appearance-none cursor-pointer group-hover:border-[hsl(var(--border-glow))] group-hover:shadow-lg"
                  >
                    <option value="active">نشط</option>
                    <option value="suspended">غير نشط</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--primary))]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))]/40 pointer-events-none">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[hsl(var(--primary)/0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
            <Link to="/manufacturers" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="h-11 sm:h-12 px-6 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98] w-full">
                إلغاء
              </Button>
            </Link>
            <Button type="submit" disabled={submitting} className="group relative h-11 sm:h-12 px-6 sm:px-8 rounded-full bg-[hsl(var(--primary))] hover:bg-[hsl(270_70%_50%)] text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] shadow-[0_4px_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_6px_30px_hsl(var(--primary)/0.4)] w-full sm:w-auto">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? 'حفظ التعديلات' : 'إضافة الشركة'}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-transform duration-300" />
            </Button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}
