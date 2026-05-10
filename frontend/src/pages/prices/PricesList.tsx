import { useState, useEffect } from 'react';
import { DollarSign, Search } from 'lucide-react';
import { priceService } from '../../services/priceService';
import type { DrugPriceWithBrand } from '../../types/price';
import Loading from '../../components/common/Loading';

export default function PricesList() {
  const [prices, setPrices] = useState<DrugPriceWithBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const data = await priceService.list({ limit: 100 });
      setPrices(data.items);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrices = prices.filter(price =>
    price.brand_name?.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    price.currency?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading text="جاري تحميل الأسعار..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <DollarSign className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            أسعار الأدوية
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">سجل أسعار المشتريات والمبيعات</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="بحث باسم الدواء أو العملة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
      </div>

      {/* List */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--muted)/0.5)]">
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الدواء</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">سعر الشراء</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">سعر البيع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">العملة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">تاريخ السريان</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center">
                        <DollarSign className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <p className="text-lg font-semibold text-[hsl(var(--foreground))]">لا توجد أسعار</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">يمكنك إضافة أسعار من صفحة تفاصيل الأدوية التجارية</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPrices.map(price => (
                  <tr key={price.price_id} className="border-t border-[hsl(var(--border-lux))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[hsl(var(--foreground))]">
                      {price.brand_name?.brand_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-[hsl(var(--foreground))]">
                      {price.acquisition_price ? Number(price.acquisition_price).toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[hsl(var(--primary))]">
                      {price.selling_price ? Number(price.selling_price).toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                      {price.currency || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                      {price.effective_date ? new Date(price.effective_date).toLocaleDateString('ar-IQ') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
