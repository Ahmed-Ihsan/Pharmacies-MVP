import { useState, useEffect } from 'react';
import { Receipt, Search, Calendar, Eye, X, TrendingUp, DollarSign, ShoppingBag, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { salesService } from '../../services/salesService';
import type { Sale } from '../../types/sales';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const STATUS_LABELS: Record<string, string> = {
  pending: 'معلق',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  refunded: 'مسترجع',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSales();
  }, [statusFilter]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (startDate) params.start_date = new Date(startDate).toISOString();
      if (endDate) params.end_date = new Date(endDate).toISOString();
      const data = await salesService.listSales(params);
      setSales(data);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = sales
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.total_amount, 0);

  const completedCount = sales.filter(s => s.status === 'completed').length;
  const cancelledCount = sales.filter(s => s.status === 'cancelled').length;
  const refundedCount = sales.filter(s => s.status === 'refunded').length;

  if (loading) return <Loading text="جاري تحميل سجل المبيعات..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Receipt className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              سجل المبيعات
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">عرض وتتبع جميع الفواتير</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchSales} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Link to="/pos">
            <Button className="gap-2 shadow-lg shadow-violet-500/20">
              <ShoppingBag className="h-4 w-4" />
              فاتورة جديدة
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'total', label: 'إجمالي الإيرادات', value: `${totalRevenue.toFixed(2)} IQD`, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
          { key: 'completed', label: 'مكتملة', value: completedCount, icon: TrendingUp, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
          { key: 'cancelled', label: 'ملغاة', value: cancelledCount, icon: X, gradient: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' },
          { key: 'refunded', label: 'مستردة', value: refundedCount, icon: RefreshCw, gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
        ].map(card => (
          <div key={card.key} className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-5 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{card.label}</p>
                <p className="text-xl font-bold text-[hsl(var(--foreground))]">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              placeholder="بحث برقم الفاتورة أو اسم العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>

          {/* Date range */}
          <div className="flex gap-3 items-center">
            <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
            <span className="text-[hsl(var(--muted-foreground))]">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { val: 'all', label: 'الكل' },
            { val: 'completed', label: 'مكتمل' },
            { val: 'pending', label: 'معلق' },
            { val: 'cancelled', label: 'ملغي' },
            { val: 'refunded', label: 'مسترجع' },
          ].map(f => (
            <button
              key={f.val}
              onClick={() => setStatusFilter(f.val)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === f.val
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--muted)/0.5)]">
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">رقم الفاتورة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الإجمالي</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">التاريخ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[hsl(var(--foreground))]">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center">
                        <Receipt className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <p className="text-lg font-semibold text-[hsl(var(--foreground))]">لا توجد مبيعات</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">ابدأ بإنشاء فاتورة جديدة من نقطة البيع</p>
                      <Link to="/pos">
                        <Button className="mt-2 gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          نقطة البيع
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.sale_id} className="border-t border-[hsl(var(--border-lux))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-[hsl(var(--primary))]">{sale.invoice_number}</span>
                    </td>
                    <td className="px-6 py-4 text-[hsl(var(--foreground))]">
                      {sale.customer_name || <span className="text-[hsl(var(--muted-foreground))]">عميل عام</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-[hsl(var(--foreground))]">
                      {sale.total_amount?.toFixed(2)} IQD
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[sale.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {STATUS_LABELS[sale.status] ?? sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                      {sale.created_at ? new Date(sale.created_at).toLocaleDateString('ar-IQ') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/sales/${sale.sale_id}`}>
                          <button className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all" title="عرض التفاصيل">
                            <Eye className="h-4 w-4" />
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
