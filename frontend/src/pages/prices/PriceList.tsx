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
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_40%)] flex items-center justify-center shadow-[var(--shadow-md)]">
            <DollarSign className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {TRANSLATIONS.prices}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              إدارة أسعار الأدوية التجارية
            </p>
          </div>
        </div>
        <Link to="/prices/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {TRANSLATIONS.add}
          </Button>
        </Link>
      </div>

      {/* Brand Selector Card */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-[var(--shadow-sm)]">
        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
          اختر الدواء التجاري
        </label>
        <select
          value={selectedBrand || ''}
          onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
          className="w-full max-w-md h-10 px-3.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-[border-color,box-shadow] text-sm disabled:opacity-50"
          disabled={brandsLoading}
        >
          <option value="">— اختر دواء تجاري —</option>
          {brands.map((brand) => (
            <option key={brand.brand_id || brand.id} value={brand.brand_id || brand.id}>
              {brand.brand_name || brand.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedBrand && (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-10 text-center shadow-[var(--shadow-sm)]">
          <Package className="h-10 w-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-50" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
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
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl text-sm">{error}</div>
      )}

      {selectedBrand && !loading && data && data.items.length > 0 && (
        <div className="table-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>السعر</th>
                  <th>التاريخ</th>
                  <th>العملة</th>
                  <th>الحالة</th>
                  <th className="text-center">{TRANSLATIONS.actions}</th>
                </tr>
              </thead>
              <tbody>
              {data.items.map((price: any, index) => (
                <tr key={`${price.price_id || price.id || 'price'}-${index}`}>
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
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      ساري
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="table-actions">
                      <button className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="عرض">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-amber-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="تعديل">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-red-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="حذف">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

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
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-10 text-center shadow-[var(--shadow-sm)]">
          <DollarSign className="h-10 w-10 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-40" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            لا توجد أسعار مسجلة لهذا الدواء
          </p>
        </div>
      )}
    </div>
  );
}
