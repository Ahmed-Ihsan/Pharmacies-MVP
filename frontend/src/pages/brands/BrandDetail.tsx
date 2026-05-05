import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Tag, DollarSign, Pill, Building2, Container, ScanBarcode, Edit2, TrendingUp } from 'lucide-react';
import { brandService } from '../../services/brandService';
import { priceService } from '../../services/priceService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { TRANSLATIONS } from '../../utils/constants';
import { formatDate, formatIQD } from '../../utils/formatters';
import type { BrandNameWithDetails } from '../../types/brand';
import type { DrugPrice } from '../../types/price';

export default function BrandDetail() {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;

  const [data, setData] = useState<BrandNameWithDetails | null>(null);
  const [prices, setPrices] = useState<DrugPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!numericId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        // GET /brands/{id} (includes embedded prices) and GET /brands/{id}/prices in parallel
        const [brandData, priceData] = await Promise.all([
          brandService.get(numericId),
          brandService.getPrices(numericId),
        ]);
        setData(brandData);
        setPrices(priceData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [numericId]);

  if (loading) return <div className="flex justify-center py-16"><Loading text="جاري تحميل بيانات الدواء..." /></div>;

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">{error}</div>
  );

  if (!data) return (
    <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">{TRANSLATIONS.no_results}</div>
  );

  const brandName = data.brand_name || data.name || '';
  const brandId = data.brand_id || data.id || 0;
  const isActive = data.status === 'active' || data.status === undefined;

  // Current price = most recent active price
  const currentPrice = prices.find((p: any) => p.is_active) || prices[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/brands">
            <button className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_40%)] flex items-center justify-center shadow-[var(--shadow-md)]">
            <Tag className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{brandName}</h1>
            {data.arabic_name && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{data.arabic_name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/brands/${brandId}/edit`}>
            <Button variant="outline" className="gap-2"><Edit2 className="h-4 w-4" />تعديل</Button>
          </Link>
          <Link to={`/prices/new?brandId=${brandId}`}>
            <Button className="gap-2">
              <DollarSign className="h-4 w-4" />
              إضافة سعر
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Card */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6 space-y-4">
          <h2 className="font-semibold text-[hsl(var(--foreground))] pb-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
            <Tag className="h-4 w-4 text-[hsl(var(--primary))]" />
            معلومات الدواء
          </h2>

          {data.generic && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)]">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                <Pill className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">الدواء الجنيس</p>
                <Link to={`/generics/${data.generic.id}`} className="text-sm font-medium text-[hsl(var(--primary))] hover:underline">
                  {data.generic.scientific_name}
                </Link>
              </div>
            </div>
          )}

          {data.manufacturer && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">الشركة المصنعة</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-0.5">{data.manufacturer.name}</p>
              </div>
            </div>
          )}

          {data.dosage_form && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Container className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">شكل الجرعة</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-0.5">{data.dosage_form.name}</p>
              </div>
            </div>
          )}

          {(data.strength_value || data.strength_unit) && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">القوة</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))] ltr-content mt-0.5">
                  {data.strength_value} {data.strength_unit}
                </p>
              </div>
            </div>
          )}

          {data.ndc_number && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ScanBarcode className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">رقم NDC</p>
                <p className="text-sm font-mono font-medium text-[hsl(var(--foreground))] ltr-content mt-0.5">{data.ndc_number}</p>
              </div>
            </div>
          )}

          {data.barcode && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ScanBarcode className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">الباركود</p>
                <p className="text-sm font-mono font-medium text-[hsl(var(--foreground))] ltr-content mt-0.5">{data.barcode}</p>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[hsl(var(--border))]">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">الحالة</p>
            <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
        </div>

        {/* Prices Card — uses GET /brands/{id}/prices */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6">
          <h2 className="font-semibold text-[hsl(var(--foreground))] pb-3 border-b border-[hsl(var(--border))] mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[hsl(var(--primary))]" />
            سجل الأسعار
            {prices.length > 0 && (
              <span className="mr-auto bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-bold px-2.5 py-0.5 rounded-full">{prices.length}</span>
            )}
          </h2>

          {/* Current price highlight */}
          {currentPrice && (
            <div className="flex items-center justify-between p-4 mb-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(270_70%_45%)] rounded-lg text-white">
              <div>
                <p className="text-white/90 text-xs">السعر الحالي</p>
                <p className="text-2xl font-bold">{formatIQD(currentPrice.unit_price)}</p>
                <p className="text-white/80 text-xs mt-0.5">منذ {formatDate(currentPrice.effective_date)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-white/20" />
            </div>
          )}

          {prices.length > 1 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {prices.map((price: any) => (
                <div key={price.price_id || price.id} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted))/0.4]">
                  <div>
                    <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{formatIQD(price.unit_price)}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{formatDate(price.effective_date)}</p>
                    {price.notes && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{price.notes}</p>}
                  </div>
                  {price.is_active && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">ساري</span>
                  )}
                </div>
              ))}
            </div>
          ) : prices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-10 w-10 text-[hsl(var(--muted-foreground))] mb-3" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">لا توجد أسعار مسجلة</p>
              <Link to={`/prices/new?brandId=${brandId}`} className="mt-3">
                <Button variant="outline" size="sm" className="rounded-lg gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  إضافة سعر
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
