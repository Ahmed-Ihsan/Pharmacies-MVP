import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Printer, RotateCcw, CheckCircle, XCircle, Package } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
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

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'نقدي',
  card: 'بطاقة',
  transfer: 'تحويل',
  credit: 'دين',
};

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const printRef = useRef<HTMLDivElement>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) fetchSale(Number(id));
  }, [id]);

  const fetchSale = async (saleId: number) => {
    setLoading(true);
    try {
      const data = await salesService.getSale(saleId);
      setSale(data);
    } catch (err) {
      console.error('Failed to fetch sale:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = async () => {
    if (!sale?.sale_id || !confirm('هل أنت متأكد من إلغاء هذه الفاتورة؟')) return;
    setCancelling(true);
    try {
      await salesService.cancelSale(sale.sale_id);
      fetchSale(sale.sale_id);
    } catch (err) {
      console.error('Failed to cancel sale:', err);
      alert('فشل إلغاء الفاتورة');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loading text="جاري تحميل الفاتورة..." />;
  if (!sale) return (
    <div className="text-center py-20">
      <p className="text-lg text-[hsl(var(--muted-foreground))]">لم يتم العثور على الفاتورة</p>
      <Link to="/sales/history"><Button className="mt-4">العودة للسجل</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link to="/sales/history" className="p-2 rounded-xl hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">تفاصيل الفاتورة</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-mono">{sale.invoice_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sale.status === 'completed' && (
            <Link to={`/sales/${sale.sale_id}/return`}>
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                إرجاع
              </Button>
            </Link>
          )}
          {sale.status !== 'cancelled' && sale.status !== 'refunded' && (
            <Button variant="outline" onClick={handleCancel} disabled={cancelling} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="h-4 w-4" />
              إلغاء الفاتورة
            </Button>
          )}
          <Button onClick={handlePrint} className="gap-2 shadow-lg shadow-violet-500/20">
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <div ref={printRef} className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-8 print:p-4 print:border-0 print:shadow-none print:bg-white">
        {/* Invoice Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-[hsl(var(--border))] print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center print:hidden">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg text-[hsl(var(--foreground))] print:text-black">صيدلية</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] print:text-gray-600">نظام إدارة الصيدليات</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-[hsl(var(--foreground))] font-mono print:text-black">{sale.invoice_number}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] print:text-gray-600 mt-1">
              {sale.created_at ? new Date(sale.created_at).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
            </p>
            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[sale.status] ?? 'bg-gray-100 text-gray-700'} print:border-2 print:border-black`}>
              {STATUS_LABELS[sale.status] ?? sale.status}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        {(sale.customer_name || sale.customer_phone) && (
          <div className="mb-6 p-4 rounded-xl bg-[hsl(var(--muted))] print:bg-transparent print:p-0 print:mb-4">
            <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] print:text-black mb-2">معلومات العميل</p>
            <div className="grid grid-cols-2 gap-4">
              {sale.customer_name && (
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] print:text-gray-600">الاسم</p>
                  <p className="font-semibold text-[hsl(var(--foreground))] print:text-black">{sale.customer_name}</p>
                </div>
              )}
              {sale.customer_phone && (
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] print:text-gray-600">الهاتف</p>
                  <p className="font-semibold text-[hsl(var(--foreground))] print:text-black">{sale.customer_phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full print:w-full">
            <thead>
              <tr className="bg-[hsl(var(--muted))] rounded-xl print:bg-gray-100">
                <th className="px-4 py-3 text-right text-sm font-semibold text-[hsl(var(--foreground))] print:text-black rounded-r-xl">#</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[hsl(var(--foreground))] print:text-black">المنتج</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[hsl(var(--foreground))] print:text-black">الكمية</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[hsl(var(--foreground))] print:text-black">السعر</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[hsl(var(--foreground))] print:text-black rounded-l-xl">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {sale.items?.map((item, index) => (
                <tr key={item.item_id ?? index} className="border-b border-[hsl(var(--border))] print:border-b print:border-gray-300">
                  <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] print:text-black">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[hsl(var(--foreground))] print:text-black">{item.brand_name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] print:text-gray-600">{item.generic_name}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-[hsl(var(--foreground))] print:text-black">{item.quantity}</td>
                  <td className="px-4 py-3 text-[hsl(var(--foreground))] print:text-black">{Number(item.unit_price).toFixed(2)} IQD</td>
                  <td className="px-4 py-3 font-bold text-[hsl(var(--foreground))] print:text-black">{Number(item.total).toFixed(2)} IQD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6 print:mb-4">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))] print:text-gray-600">المجموع الفرعي</span>
              <span className="font-medium text-[hsl(var(--foreground))] print:text-black">{Number(sale.subtotal).toFixed(2)} IQD</span>
            </div>
            {Number(sale.discount_amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))] print:text-gray-600">الخصم</span>
                <span className="font-medium text-red-600 print:text-black">-{Number(sale.discount_amount).toFixed(2)} IQD</span>
              </div>
            )}
            {Number(sale.tax_amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))] print:text-gray-600">الضريبة</span>
                <span className="font-medium text-[hsl(var(--foreground))] print:text-black">{Number(sale.tax_amount).toFixed(2)} IQD</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-[hsl(var(--border))] pt-2 print:border-b-2 print:border-black">
              <span className="text-[hsl(var(--foreground))] print:text-black">الإجمالي</span>
              <span className="text-[hsl(var(--primary))] print:text-black">{Number(sale.total_amount).toFixed(2)} IQD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))] print:text-gray-600">المدفوع</span>
              <span className="font-medium text-emerald-600 print:text-black">{Number(sale.paid_amount).toFixed(2)} IQD</span>
            </div>
            {Number(sale.change_amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))] print:text-gray-600">الباقي</span>
                <span className="font-medium text-[hsl(var(--foreground))] print:text-black">{Number(sale.change_amount).toFixed(2)} IQD</span>
              </div>
            )}
          </div>
        </div>

        {/* Payments */}
        {sale.payments && sale.payments.length > 0 && (
          <div className="border-t border-[hsl(var(--border))] pt-4 print:border-t-2 print:border-black print:pt-2">
            <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] print:text-black mb-3">طرق الدفع</p>
            <div className="flex flex-wrap gap-3 print:flex-col print:gap-1">
              {sale.payments.map((payment, i) => (
                <div key={payment.payment_id ?? i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] print:bg-transparent print:border-0 print:px-0 print:py-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600 print:hidden" />
                  <span className="text-sm font-medium text-[hsl(var(--foreground))] print:text-black">
                    {PAYMENT_LABELS[payment.payment_method] ?? payment.payment_method}
                  </span>
                  <span className="text-sm font-bold text-[hsl(var(--primary))] print:text-black">{Number(payment.amount).toFixed(2)} IQD</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 pt-4 border-t border-[hsl(var(--border))] text-center print:border-t-2 print:border-black print:mt-4 print:pt-2">
          <p className="text-xs text-[hsl(var(--muted-foreground))] print:text-gray-600">شكراً لتعاملكم معنا — نظام إدارة الصيدليات</p>
        </div>
      </div>
    </div>
  );
}
