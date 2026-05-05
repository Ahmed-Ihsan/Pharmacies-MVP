import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Save, Loader2, TrendingUp, Calendar } from 'lucide-react';
import { priceService } from '../../services/priceService';
import { brandService } from '../../services/brandService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/ui/use-toast';
import type { DrugPriceCreate, DrugPriceUpdate, DrugPrice } from '../../types/price';
import type { BrandName } from '../../types/brand';

const CURRENCIES = [
  { value: 'IQD', label: 'دينار عراقي (IQD)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
  { value: 'EUR', label: 'يورو (EUR)' },
];

export default function PriceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const preFillBrandId = searchParams.get('brandId');
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [brands, setBrands] = useState<BrandName[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [activePrice, setActivePrice] = useState<DrugPrice | null>(null);
  const [form, setForm] = useState({
    brand_id: preFillBrandId || '',
    acquisition_price: '',
    selling_price: '',
    effective_date: new Date().toISOString().split('T')[0],
    currency: 'IQD',
  });

  // Load brands
  useEffect(() => {
    brandService.list({ limit: 1000 })
      .then((res) => setBrands(res.items))
      .catch(() => {})
      .finally(() => setBrandsLoading(false));
  }, []);

  // Load active price when brand is selected (for reference)
  useEffect(() => {
    if (!form.brand_id) { setActivePrice(null); return; }
    priceService.getActivePrice(parseInt(form.brand_id))
      .then(setActivePrice)
      .catch(() => setActivePrice(null));
  }, [form.brand_id]);

  // Load existing price when editing
  useEffect(() => {
    if (!isEdit || !numericId) return;
    priceService.get(numericId)
      .then((data) => {
        setForm({
          brand_id: String(data.brand_id),
          acquisition_price: data.acquisition_price !== undefined ? String(data.acquisition_price) : '',
          selling_price: data.selling_price !== undefined ? String(data.selling_price) : '',
          effective_date: data.effective_date ? data.effective_date.split('T')[0] : '',
          currency: data.currency || 'IQD',
        });
      })
      .catch(() => toast({ title: 'خطأ', description: 'فشل تحميل البيانات', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [isEdit, numericId]);

  const set = (field: string) => (v: string) => setForm((p) => ({ ...p, [field]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand_id || !form.effective_date) {
      toast({ title: 'خطأ', description: 'يجب تحديد الدواء وتاريخ السريان', variant: 'destructive' });
      return;
    }
    if (!form.acquisition_price && !form.selling_price) {
      toast({ title: 'خطأ', description: 'يجب إدخال سعر التكلفة أو سعر البيع على الأقل', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && numericId) {
        const updatePayload: DrugPriceUpdate = {
          acquisition_price: form.acquisition_price ? parseFloat(form.acquisition_price) : undefined,
          selling_price: form.selling_price ? parseFloat(form.selling_price) : undefined,
          effective_date: form.effective_date,
          currency: form.currency,
        };
        await priceService.update(numericId, updatePayload);
        toast({ title: 'تم التحديث', description: 'تم تحديث سجل السعر' });
      } else {
        const createPayload: DrugPriceCreate = {
          brand_id: parseInt(form.brand_id),
          acquisition_price: form.acquisition_price ? parseFloat(form.acquisition_price) : undefined,
          selling_price: form.selling_price ? parseFloat(form.selling_price) : undefined,
          effective_date: form.effective_date,
          currency: form.currency,
        };
        await priceService.create(createPayload);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة سجل السعر الجديد' });
      }
      navigate('/prices');
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.response?.data?.detail || 'فشل الحفظ', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if ((isEdit && loading) || brandsLoading) return <div className="flex justify-center py-16"><Loading text="جاري التحميل..." /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/prices">
            <button className="w-12 h-12 rounded-2xl bg-white/80 hover:bg-white/90 shadow-lg shadow-emerald-500/10 flex items-center justify-center transition-all duration-300">
              <ArrowRight className="h-5 w-5 text-emerald-600" />
            </button>
          </Link>
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl shadow-emerald-500/25">
            <DollarSign className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {isEdit ? 'تعديل سجل السعر' : 'إضافة سعر جديد'}
            </h1>
            <p className="text-emerald-600 text-sm font-medium">{isEdit ? 'تحديث بيانات السعر' : 'تسجيل سعر لدواء تجاري'}</p>
          </div>
        </div>

        {/* Active price reference banner */}
        {activePrice && !isEdit && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-5 shadow-lg shadow-blue-500/5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">السعر الساري الحالي</p>
              <p className="text-xs text-blue-600 mt-1 font-medium">
                {activePrice.selling_price
                  ? `سعر البيع: ${activePrice.selling_price.toLocaleString('ar-IQ')} ${activePrice.currency}`
                  : activePrice.acquisition_price
                    ? `سعر التكلفة: ${activePrice.acquisition_price.toLocaleString('ar-IQ')} ${activePrice.currency}`
                    : ''}
                {' — منذ '}
                {new Date(activePrice.effective_date).toLocaleDateString('ar-IQ')}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white/80 rounded-3xl border border-emerald-200/50 shadow-xl shadow-emerald-500/10 p-8 space-y-6">

            {/* Brand selector */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                الدواء التجاري <span className="text-red-500">*</span>
              </label>
              <select
                value={form.brand_id}
                onChange={(e) => set('brand_id')(e.target.value)}
                disabled={isEdit}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-[hsl(var(--muted))]/30 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-sm disabled:opacity-60"
              >
                <option value="">-- اختر الدواء التجاري --</option>
                {brands.map((b) => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.brand_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* acquisition_price */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  سعر التكلفة
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.acquisition_price}
                    onChange={(e) => set('acquisition_price')(e.target.value)}
                    dir="ltr"
                    placeholder="0.00"
                    className="w-full h-12 pl-12 pr-16 rounded-2xl border border-gray-200 bg-[hsl(var(--muted))]/30 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-sm"
                  />
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">{form.currency}</span>
                </div>
              </div>

              {/* selling_price */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  سعر البيع
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.selling_price}
                    onChange={(e) => set('selling_price')(e.target.value)}
                    dir="ltr"
                    placeholder="0.00"
                    className="w-full h-12 pl-12 pr-16 rounded-2xl border border-gray-200 bg-[hsl(var(--muted))]/30 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-sm"
                  />
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">{form.currency}</span>
                </div>
              </div>

              {/* effective_date */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  تاريخ السريان <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.effective_date}
                    onChange={(e) => set('effective_date')(e.target.value)}
                    dir="ltr"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-[hsl(var(--muted))]/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-sm"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                </div>
              </div>

              {/* currency */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">العملة</label>
                <select
                  value={form.currency}
                  onChange={(e) => set('currency')(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-[hsl(var(--muted))]/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-sm"
                >
                  {CURRENCIES.map((cur) => <option key={cur.value} value={cur.value}>{cur.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <Link to="/prices">
              <Button type="button" variant="outline" className="rounded-2xl px-8 py-3 border-gray-300 hover:border-gray-400 transition-all duration-300">إلغاء</Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-l from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl px-8 py-3 gap-2 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? 'حفظ التعديلات' : 'إضافة السعر'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
