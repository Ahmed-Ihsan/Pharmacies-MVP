import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, ArrowRight, Search, RefreshCw, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryWithDetails, InventoryStats } from '../../types/inventory';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

export default function InventoryList() {
  const [inventory, setInventory] = useState<InventoryWithDetails[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'expiring_soon'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryData, statsData] = await Promise.all([
        inventoryService.list({ status: filter === 'all' ? undefined : filter }),
        inventoryService.getDashboardStats(),
      ]);
      setInventory(inventoryData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.generic_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'low_stock':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expiring_soon':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'expired':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'متوفر';
      case 'low_stock':
        return 'منخفض المخزون';
      case 'out_of_stock':
        return 'نفذ من المخزون';
      case 'expiring_soon':
        return 'قريب الانتهاء';
      case 'expired':
        return 'منتهي الصلاحية';
      default:
        return status;
    }
  };

  if (loading) return <Loading text="جاري تحميل المخزون..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              إدارة المخزون
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">تتبع كميات الأدوية وحركات المخزن</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Link to="/brands/new">
            <Button className="gap-2 shadow-lg shadow-blue-500/20">
              <Plus className="h-4 w-4" />
              إضافة صنف
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div key="total" className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">إجمالي الأصناف</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.total_items}</p>
                </div>
              </div>
            </div>
          </div>

          <div key="low" className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">منخفض المخزون</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.low_stock_items}</p>
                </div>
              </div>
            </div>
          </div>

          <div key="out" className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">نفذ من المخزون</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.out_of_stock_items}</p>
                </div>
              </div>
            </div>
          </div>

          <div key="expiring" className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">قريب الانتهاء</p>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stats.expiring_soon_items}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="ابحث عن دواء..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[hsl(var(--border-lux))] bg-[hsl(var(--muted)/0.3)] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'low_stock', 'out_of_stock', 'expiring_soon'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  filter === f
                    ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-accent))] text-white shadow-lg shadow-[hsl(var(--primary))]/20'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] hover:shadow-md'
                }`}
              >
                {f === 'all' ? 'الكل' : f === 'low_stock' ? 'منخفض المخزون' : f === 'out_of_stock' ? 'نفذ من المخزون' : 'قريب الانتهاء'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--muted)/0.5)]">
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">اسم الدواء</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الكمية الحالية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الحد الأدنى</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">تاريخ الانتهاء</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الموقع</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[hsl(var(--foreground))]">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center">
                        <Package className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[hsl(var(--foreground))]">لا يوجد مخزون</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">ابدأ بإضافة أصناف للمخزون</p>
                      </div>
                      <Link to="/brands/new">
                        <Button className="gap-2 mt-2">
                          <Plus className="h-4 w-4" />
                          إضافة صنف
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.inventory_id} className="border-t border-[hsl(var(--border-lux))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[hsl(var(--foreground))]">{item.brand_name}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.generic_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${
                        item.current_quantity <= (item.minimum_quantity || 0)
                          ? 'text-red-600'
                          : item.current_quantity <= (item.minimum_quantity || 0) * 1.5
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}>
                        {item.current_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[hsl(var(--foreground))]">{item.minimum_quantity || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[hsl(var(--foreground))]">
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('ar-IQ') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[hsl(var(--foreground))]">
                        <MapPin className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        {item.location || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/brands/${item.brand_id}`}>
                          <button className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all">
                            <ArrowRight className="h-5 w-5" />
                          </button>
                        </Link>
                      </div>
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
