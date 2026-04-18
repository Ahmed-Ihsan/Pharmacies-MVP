import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, DollarSign, Package } from 'lucide-react';
import { priceService } from '../../services/priceService';
import { brandService } from '../../services/brandService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { TRANSLATIONS, DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { formatDate, formatIQD } from '../../utils/formatters';
import type { PaginatedResponse } from '../../types/common';
import type { DrugPrice } from '../../types/price';

export default function PriceList() {
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [data, setData] = useState<PaginatedResponse<DrugPrice> | null>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setBrandsLoading(true);
      try {
        const response = await brandService.list({ limit: 1000 });
        setBrands(response.items);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'فشل تحميل الأدوية');
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedBrand) {
        setData({ total: 0, items: [], skip: 0, limit: DEFAULT_PAGE_SIZE });
        return;
      }
      setLoading(true);
      try {
        const response = await priceService.listByBrand(selectedBrand, {
          skip,
          limit: DEFAULT_PAGE_SIZE,
        });
        setData(response);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'فشل تحميل الأسعار');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBrand, skip]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setSkip(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
          {TRANSLATIONS.prices}
        </h1>
        <Link to="/prices/new">
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            {TRANSLATIONS.add}
          </Button>
        </Link>
      </div>

      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
          اختر الدواء التجاري
        </label>
        <select
          value={selectedBrand || ''}
          onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
          className="w-full max-w-md px-4 py-2 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          disabled={brandsLoading}
        >
          <option value="">-- اختر دواء تجاري --</option>
          {brands.map((brand) => (
            <option key={brand.brand_id || brand.id} value={brand.brand_id || brand.id}>
              {brand.brand_name || brand.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedBrand && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 text-center">
          <Package className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))]">
            يرجى اختيار دواء تجاري لعرض أسعاره
          </p>
        </div>
      )}

      {selectedBrand && loading && (
        <div className="flex justify-center py-12">
          <Loading text="جاري تحميل الأسعار..." />
        </div>
      )}

      {selectedBrand && !loading && error && (
        <div className="p-4 text-red-600 bg-red-50 rounded-md">{error}</div>
      )}

      {selectedBrand && !loading && data && data.items.length > 0 && (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">السعر</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">التاريخ</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">العملة</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">الحالة</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{TRANSLATIONS.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {data.items.map((price: any, index) => (
                <tr key={price.price_id || price.id || index} className="hover:bg-[hsl(var(--accent))]/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-[hsl(var(--foreground))]">
                      <DollarSign className="h-4 w-4 text-[hsl(var(--primary))]" />
                      <span className="font-semibold">{formatIQD(price.selling_price)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[hsl(var(--foreground))]">
                    {price.effective_date ? formatDate(price.effective_date) : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-[hsl(var(--foreground))]">
                    {price.currency || '-'}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ساري
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <button className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all duration-200" title="عرض">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white flex items-center justify-center transition-all duration-200" title="تعديل">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center transition-all duration-200" title="حذف">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.total > DEFAULT_PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                إجمالي: {data.total.toLocaleString('ar-IQ')}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={skip === 0}
                  onClick={() => setSkip(Math.max(0, skip - DEFAULT_PAGE_SIZE))}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={skip + DEFAULT_PAGE_SIZE >= data.total}
                  onClick={() => setSkip(skip + DEFAULT_PAGE_SIZE)}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedBrand && !loading && data && data.items.length === 0 && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 text-center">
          <DollarSign className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
          <p className="text-[hsl(var(--muted-foreground))]">
            لا توجد أسعار مسجلة لهذا الدواء
          </p>
        </div>
      )}
    </div>
  );
}
