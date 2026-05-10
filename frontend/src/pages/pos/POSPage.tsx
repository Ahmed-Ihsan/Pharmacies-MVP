import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Minus, Trash2, DollarSign, X, CreditCard, Wallet, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { salesService } from '../../services/salesService';
import { inventoryService } from '../../services/inventoryService';
import { priceService } from '../../services/priceService';
import type { SaleItem, SaleCreate } from '../../types/sales';
import type { InventoryWithDetails } from '../../types/inventory';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

export default function POSPage() {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState<InventoryWithDetails[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [paidAmount, setPaidAmount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const taxRate = 0;

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredInventory(
        inventory.filter(item =>
          item.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.generic_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredInventory([]);
    }
  }, [searchQuery, inventory]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.list({ status: 'available' });
      setInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: InventoryWithDetails) => {
    // Validate stock availability
    const existingInCart = cart.find(cartItem => cartItem.brand_id === item.brand_id);
    const currentCartQty = existingInCart ? existingInCart.quantity : 0;
    const requestedQty = currentCartQty + 1;
    
    if (item.current_quantity < requestedQty) {
      alert(`المخزون غير كافٍ. المتوفر: ${item.current_quantity}`);
      return;
    }

    try {
      // Fetch active price from prices API
      const priceData = await priceService.getActivePrice(item.brand_id);
      const unitPrice = Number(priceData.selling_price) || 15;
      
      if (existingInCart) {
        setCart(cart.map(cartItem =>
          cartItem.brand_id === item.brand_id
            ? { ...cartItem, quantity: cartItem.quantity + 1, subtotal: (cartItem.quantity + 1) * unitPrice, total: (cartItem.quantity + 1) * unitPrice }
            : cartItem
        ));
      } else {
        const newItem: SaleItem = {
          brand_id: item.brand_id,
          brand_name: item.brand_name,
          generic_name: item.generic_name,
          quantity: 1,
          unit_price: unitPrice,
          discount_type: undefined,
          discount_value: undefined,
          discount_amount: 0,
          subtotal: unitPrice,
          total: unitPrice,
        };
        setCart([...cart, newItem]);
      }
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to fetch price:', err);
      // Fallback to default price if API fails
      const unitPrice = 15;
      const newItem: SaleItem = {
        brand_id: item.brand_id,
        brand_name: item.brand_name,
        generic_name: item.generic_name,
        quantity: 1,
        unit_price: unitPrice,
        discount_type: undefined,
        discount_value: undefined,
        discount_amount: 0,
        subtotal: unitPrice,
        total: unitPrice,
      };
      setCart([...cart, newItem]);
      setSearchQuery('');
    }
  };

  const removeFromCart = (brandId: number) => {
    setCart(cart.filter(item => item.brand_id !== brandId));
  };

  const updateQuantity = (brandId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(brandId);
      return;
    }
    setCart(cart.map(item =>
      item.brand_id === brandId
        ? { ...item, quantity, subtotal: quantity * item.unit_price, total: quantity * item.unit_price }
        : item
    ));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = discountType === 'percentage' 
    ? subtotal * (discountValue / 100)
    : discountValue;
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal - discountAmount + taxAmount;
  const changeAmount = paidAmount - totalAmount;

  const handlePayment = async () => {
    if (cart.length === 0) return;
    if (paidAmount < totalAmount) {
      alert('المبلغ المدفوع أقل من الإجمالي');
      return;
    }

    setLoading(true);
    try {
      const saleData: SaleCreate = {
        customer_name: customerName,
        customer_phone: customerPhone,
        subtotal,
        discount_type: discountValue > 0 ? discountType : undefined,
        discount_value: discountValue > 0 ? discountValue : undefined,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        change_amount: changeAmount,
        status: 'completed',
        items: cart,
        payments: [{
          payment_method: paymentMethod,
          amount: paidAmount,
        }],
      };

      const sale = await salesService.createSale(saleData);
      alert(`تم إنشاء الفاتورة بنجاح: ${sale.invoice_number}`);
      
      // Reset cart
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setPaidAmount(0);
      setDiscountValue(0);
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Failed to create sale:', err);
      alert('فشل إنشاء الفاتورة');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="جاري تحميل البيانات..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShoppingCart className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              نقطة البيع
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">إدارة المبيعات والفواتير</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchInventory} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Link to="/sales/history">
            <Button variant="outline" className="gap-2">
              سجل المبيعات
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="ابحث عن دواء..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
              />
            </div>

            {filteredInventory.length > 0 && (
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {filteredInventory.map((item) => (
                  <div
                    key={item.inventory_id}
                    onClick={() => addToCart(item)}
                    className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] cursor-pointer transition-all"
                  >
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">{item.brand_name}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.generic_name}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[hsl(var(--primary))]">15 IQD</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">المخزون: {item.current_quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">معلومات العميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[hsl(var(--muted-foreground))] mb-2 block">اسم العميل</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                />
              </div>
              <div>
                <label className="text-sm text-[hsl(var(--muted-foreground))] mb-2 block">رقم الهاتف</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 h-fit sticky top-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            سلة المشتريات
          </h3>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
              <p className="text-[hsl(var(--muted-foreground))]">السلة فارغة</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map((item) => (
                  <div key={item.brand_id} className="flex items-center justify-between p-3 rounded-xl bg-[hsl(var(--muted))]">
                    <div className="flex-1">
                      <p className="font-medium text-[hsl(var(--foreground))] text-sm">{item.brand_name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.unit_price} IQD</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.brand_id, item.quantity - 1)}
                        className="p-1 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-[hsl(var(--foreground))]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.brand_id, item.quantity + 1)}
                        className="p-1 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.brand_id)}
                        className="p-1 rounded-lg hover:bg-red-100 text-red-600 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount */}
              <div className="space-y-2 mb-4 p-3 rounded-xl bg-[hsl(var(--muted))]">
                <div className="flex gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'amount')}
                    className="flex-1 px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm"
                  >
                    <option value="percentage">نسبة مئوية</option>
                    <option value="amount">مبلغ ثابت</option>
                  </select>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="الخصم"
                    className="flex-1 px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm"
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-[hsl(var(--border))] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">المجموع الفرعي</span>
                  <span className="font-medium text-[hsl(var(--foreground))]">{subtotal.toFixed(2)} IQD</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">الخصم</span>
                    <span className="font-medium text-red-600">-{discountAmount.toFixed(2)} IQD</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">الضريبة ({taxRate}%)</span>
                  <span className="font-medium text-[hsl(var(--foreground))]">{taxAmount.toFixed(2)} IQD</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[hsl(var(--foreground))]">الإجمالي</span>
                  <span className="text-[hsl(var(--primary))]">{totalAmount.toFixed(2)} IQD</span>
                </div>
              </div>

              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full mt-4 gap-2 shadow-lg shadow-emerald-500/20"
                disabled={cart.length === 0}
              >
                <DollarSign className="h-4 w-4" />
                إتمام البيع
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl border border-[hsl(var(--border-lux))] p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">إتمام الدفع</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Payment Method */}
              <div>
                <label className="text-sm text-[hsl(var(--muted-foreground))] mb-2 block">طريقة الدفع</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                    }`}
                  >
                    <Wallet className="h-6 w-6 mx-auto mb-2 text-[hsl(var(--foreground))]" />
                    <span className="text-sm text-[hsl(var(--foreground))]">نقدي</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-[hsl(var(--foreground))]" />
                    <span className="text-sm text-[hsl(var(--foreground))]">بطاقة</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]'
                    }`}
                  >
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 text-[hsl(var(--foreground))]" />
                    <span className="text-sm text-[hsl(var(--foreground))]">تحويل</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm text-[hsl(var(--muted-foreground))] mb-2 block">المبلغ المدفوع</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  placeholder="أدخل المبلغ"
                  className="w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--foreground))] text-lg font-bold"
                />
              </div>

              {/* Change */}
              {paidAmount > totalAmount && (
                <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-200">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">الباقي</span>
                    <span className="font-bold text-emerald-700">{changeAmount.toFixed(2)} IQD</span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--foreground))]">الإجمالي</span>
                  <span className="font-bold text-[hsl(var(--primary))] text-xl">{totalAmount.toFixed(2)} IQD</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full gap-2 shadow-lg shadow-emerald-500/20"
                disabled={paidAmount < totalAmount || loading}
              >
                <DollarSign className="h-4 w-4" />
                تأكيد الدفع
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
