import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Building2, Globe, Mail, Phone, MapPin,
  Tag, Edit2, Trash2, AlertTriangle, Package, Calendar
} from 'lucide-react';
import { manufacturerService } from '../../services/manufacturerService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import type { ManufacturerWithBrands } from '../../types/manufacturer';

export default function ManufacturerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = id ? parseInt(id, 10) : null;
  const { toast } = useToast();

  const [data, setData] = useState<ManufacturerWithBrands | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!numericId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await manufacturerService.get(numericId);
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'فشل تحميل بيانات الشركة');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [numericId]);

  const handleDelete = async () => {
    if (!numericId) return;
    try {
      await manufacturerService.delete(numericId);
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف الشركة المصنعة من النظام' });
      navigate('/manufacturers');
    } catch (err: any) {
      toast({ title: 'فشل الحذف', description: err.response?.data?.detail || 'فشل الحذف', variant: 'destructive' });
    }
    setDeleteDialogOpen(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loading text="جاري تحميل بيانات الشركة..." /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">{error}</div>;
  if (!data) return <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">لم يتم العثور على الشركة</div>;

  const name = data.manufacturer_name || data.name || '';
  const mId = data.manufacturer_id || data.id || 0;
  const isActive = data.is_active !== false && data.status !== 'inactive';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف شركة "{name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="danger" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/manufacturers">
            <button className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5 text-[hsl(var(--foreground))]" />
            </button>
          </Link>
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_40%)] flex items-center justify-center shadow-[var(--shadow-md)]">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{name}</h1>
            {data.arabic_name && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{data.arabic_name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/manufacturers/${mId}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" />
              تعديل
            </Button>
          </Link>
          <Button
            variant="danger"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Card */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6 space-y-5">
          <h2 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))]">
            <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
            معلومات الشركة
          </h2>

          {[
            { icon: Globe, label: 'الدولة', value: data.country || '-' },
            { icon: Mail, label: 'البريد الإلكتروني', value: data.email || '-', ltr: true },
            { icon: Phone, label: 'الهاتف', value: data.phone || '-', ltr: true },
            { icon: Globe, label: 'الموقع الإلكتروني', value: data.website || '-', ltr: true },
            { icon: MapPin, label: 'العنوان', value: data.address || '-' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.label}</p>
                  <p className={`text-sm font-medium text-[hsl(var(--foreground))] mt-0.5 ${item.ltr ? 'ltr-content' : ''}`}>
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">الحالة</p>
              <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {isActive ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>

          {data.description && (
            <div className="pt-2 border-t border-[hsl(var(--border))]">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">الوصف</p>
              <p className="text-sm text-[hsl(var(--foreground))]">{data.description}</p>
            </div>
          )}
        </div>

        {/* Brands Card */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6">
          <h2 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-2 pb-3 border-b border-[hsl(var(--border))] mb-4">
            <Tag className="h-4 w-4 text-[hsl(var(--primary))]" />
            الأدوية التجارية
            {data.brands && (
              <span className="mr-auto bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-bold px-2.5 py-0.5 rounded-full">
                {data.brands.length}
              </span>
            )}
          </h2>

          {data.brands && data.brands.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--accent))] border border-transparent hover:border-[hsl(var(--border))] transition-all group"
                >
                  <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] group-hover:bg-[hsl(var(--primary))] flex items-center justify-center flex-shrink-0 transition-colors">
                    <Package className="h-4 w-4 text-[hsl(var(--primary))] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{brand.name}</p>
                    {brand.generic_name && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{brand.generic_name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-14 w-14 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
                <Package className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">لا توجد أدوية تجارية مرتبطة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
