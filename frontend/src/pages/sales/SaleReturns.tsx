import { useState, useEffect } from 'react';
import { RotateCcw, Search, Eye, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { salesService } from '../../services/salesService';
import type { Sale, SaleReturn, SaleReturnCreate } from '../../types/sales';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

export default function SaleReturns() {
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [foundSale, setFoundSale] = useState<Sale | null>(null);
  const [searchingInvoice, setSearchingInvoice] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data = await salesService.listReturns();
      setReturns(data);
    } catch (err) {
      console.error('Failed to fetch returns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInvoice = async () => {
    if (!invoiceNumber.trim()) return;
    setSearchingInvoice(true);
    setFoundSale(null);
    setSelectedItems({});
    try {
      const match = await salesService.searchByInvoice(invoiceNumber.trim());
      setFoundSale(match);
    } catch (err) {
      console.error('Error finding invoice:', err);
      alert('لم يتم العثور على الفاتورة');
    } finally {
      setSearchingInvoice(false);
    }
  };

  const toggleItemSelection = (itemId: number, _maxQty: number) => {
    setSelectedItems(prev => {
      if (prev[itemId] !== undefined) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: 1 };
    });
  };

  const setItemQty = (itemId: number, qty: number, maxQty: number) => {
    if (qty <= 0) {
      setSelectedItems(prev => { const n = { ...prev }; delete n[itemId]; return n; });
    } else {
      setSelectedItems(prev => ({ ...prev, [itemId]: Math.min(qty, maxQty) }));
    }
  };

  const refundTotal = foundSale?.items
    ?.filter(item => item.item_id !== undefined && selectedItems[item.item_id!] !== undefined)
    .reduce((sum, item) => sum + selectedItems[item.item_id!] * Number(item.unit_price), 0) ?? 0;

  const handleSubmitReturn = async () => {
    if (!foundSale?.sale_id || Object.keys(selectedItems).length === 0 || !reason) return;
    setSubmitting(true);
    try {
      const returnItems = foundSale.items
        ?.filter(item => item.item_id !== undefined && selectedItems[item.item_id!] !== undefined)
        .map(item => ({
          sale_item_id: item.item_id!,
          brand_id: item.brand_id,
          brand_name: item.brand_name,
          quantity: selectedItems[item.item_id!],
          unit_price: Number(item.unit_price),
          total_amount: selectedItems[item.item_id!] * Number(item.unit_price),
        })) ?? [];

      const returnData: SaleReturnCreate = {
        sale_id: foundSale.sale_id,
        reason,
        total_amount: refundTotal,
        refund_amount: refundTotal,
        status: 'completed',
        items: returnItems,
      };

      await salesService.processReturn(returnData);
      alert('تم معالجة الإرجاع بنجاح واستعادة المخزون');
      setShowReturnModal(false);
      setFoundSale(null);
      setInvoiceNumber('');
      setSelectedItems({});
      setReason('');
      fetchReturns();
    } catch (err) {
      console.error('Failed to process return:', err);
      alert('فشل معالجة الإرجاع');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReturns = returns.filter(ret =>
    ret.return_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading text="جاري تحميل الإرجاعات..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <RotateCcw className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              إرجاع المبيعات
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">معالجة مرتجعات الأدوية واستعادة المخزون</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchReturns} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button onClick={() => setShowReturnModal(true)} className="gap-2 shadow-lg shadow-orange-500/20">
            <RotateCcw className="h-4 w-4" />
            إرجاع جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'total', label: 'إجمالي الإرجاعات', value: returns.length, color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20' },
          { key: 'completed', label: 'إرجاعات مكتملة', value: returns.filter(r => r.status === 'completed').length, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
          {
            key: 'amount',
            label: 'إجمالي المبالغ المستردة',
            value: `${returns.filter(r => r.status === 'completed').reduce((s, r) => s + Number(r.refund_amount), 0).toFixed(2)} IQD`,
            color: 'from-blue-500 to-blue-600',
            shadow: 'shadow-blue-500/20',
          },
        ].map(card => (
          <div key={card.label} className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-5">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow} mb-3`}>
              <RotateCcw className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{card.label}</p>
            <p className="text-xl font-bold text-[hsl(var(--foreground))] mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="بحث برقم الإرجاع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--muted)/0.5)]">
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">رقم الإرجاع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">رقم الفاتورة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">مبلغ الاسترداد</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[hsl(var(--foreground))]">التاريخ</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[hsl(var(--foreground))]">الفاتورة</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center">
                        <RotateCcw className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <p className="text-lg font-semibold text-[hsl(var(--foreground))]">لا توجد إرجاعات</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">يمكنك إنشاء إرجاع من أي فاتورة مكتملة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReturns.map(ret => (
                  <tr key={ret.return_id} className="border-t border-[hsl(var(--border-lux))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-[hsl(var(--primary))]">{ret.return_number}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-[hsl(var(--foreground))]">#{ret.sale_id}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{Number(ret.refund_amount).toFixed(2)} IQD</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${ret.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                        {ret.status === 'completed' ? 'مكتمل' : 'معلق'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                      {ret.created_at ? new Date(ret.created_at).toLocaleDateString('ar-IQ') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <Link to={`/sales/${ret.sale_id}`}>
                          <button className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-all">
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

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">إنشاء إرجاع جديد</h3>
              <button onClick={() => { setShowReturnModal(false); setFoundSale(null); setInvoiceNumber(''); setSelectedItems({}); setReason(''); }}
                className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                ✕
              </button>
            </div>

            {/* Invoice search */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[hsl(var(--muted-foreground))] mb-2 block">رقم الفاتورة</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="مثال: INV-20260510-0001"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchInvoice()}
                  />
                  <Button onClick={handleSearchInvoice} disabled={searchingInvoice} className="shrink-0">
                    {searchingInvoice ? 'بحث...' : 'بحث'}
                  </Button>
                </div>
              </div>

              {foundSale && (
                <>
                  {/* Invoice info */}
                  <div className="p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{foundSale.invoice_number}</span>
                    </div>
                    {foundSale.customer_name && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">العميل: {foundSale.customer_name}</p>
                    )}
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">الإجمالي: {Number(foundSale.total_amount).toFixed(2)} IQD</p>
                  </div>

                  {/* Items to return */}
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">اختر المنتجات المرتجعة</p>
                    <div className="space-y-2">
                      {foundSale.items?.map(item => {
                        const isSelected = item.item_id !== undefined && selectedItems[item.item_id] !== undefined;
                        return (
                          <div key={item.item_id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5' : 'border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:border-[hsl(var(--primary))]/50'}`}
                            onClick={() => item.item_id !== undefined && toggleItemSelection(item.item_id, item.quantity)}>
                            <div>
                              <p className="font-medium text-[hsl(var(--foreground))] text-sm">{item.brand_name}</p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">الكمية المشتراة: {item.quantity} | {Number(item.unit_price).toFixed(2)} IQD/وحدة</p>
                            </div>
                            {isSelected && item.item_id !== undefined && (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <span className="text-xs text-[hsl(var(--muted-foreground))]">الكمية:</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={item.quantity}
                                  value={selectedItems[item.item_id]}
                                  onChange={(e) => item.item_id !== undefined && setItemQty(item.item_id, Number(e.target.value), item.quantity)}
                                  className="w-16 px-2 py-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm text-center"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="text-sm text-[hsl(var(--muted-foreground))] mb-2 block">سبب الإرجاع <span className="text-red-500">*</span></label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      placeholder="أدخل سبب الإرجاع..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] resize-none"
                    />
                  </div>

                  {/* Refund amount */}
                  {refundTotal > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex justify-between">
                        <span className="text-emerald-700 font-medium">مبلغ الاسترداد</span>
                        <span className="font-bold text-emerald-700 text-lg">{refundTotal.toFixed(2)} IQD</span>
                      </div>
                    </div>
                  )}

                  {Object.keys(selectedItems).length === 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-sm text-amber-700">اختر منتجاً واحداً على الأقل للإرجاع</p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitReturn}
                    className="w-full gap-2"
                    disabled={Object.keys(selectedItems).length === 0 || !reason || submitting}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {submitting ? 'جاري المعالجة...' : 'تأكيد الإرجاع'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
