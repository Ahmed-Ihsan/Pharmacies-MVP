import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Building2, Factory, Search, MapPin, Globe, AlertTriangle } from 'lucide-react';
import { manufacturerService } from '../../services/manufacturerService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { TRANSLATIONS, DEFAULT_PAGE_SIZE } from '../../utils/constants';
import type { PaginatedResponse } from '../../types/common';
import type { Manufacturer } from '../../types/manufacturer';

export default function ManufacturerList() {
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState<PaginatedResponse<Manufacturer> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manufacturerToDelete, setManufacturerToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await manufacturerService.list({
          skip,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        setData(response);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [skip, search]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setSkip(0);
  };

  const handleDelete = async (id: number) => {
    setManufacturerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!manufacturerToDelete) return;
    try {
      await manufacturerService.delete(manufacturerToDelete);
      setDeleteDialogOpen(false);
      setManufacturerToDelete(null);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الشركة المصنعة من النظام",
      });
      const response = await manufacturerService.list({
        skip,
        limit: DEFAULT_PAGE_SIZE,
        search: search || undefined,
      });
      setData(response);
    } catch (err: any) {
      toast({
        title: "فشل الحذف",
        description: err.response?.data?.detail || 'فشل الحذف',
        variant: "destructive",
      });
    }
  };

  const getManufacturerId = (manufacturer: Manufacturer) => manufacturer.manufacturer_id || manufacturer.id || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذه الشركة المصنعة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))]">
              الشركات المصنعة
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">
              إدارة الشركات المصنعة للأدوية
            </p>
          </div>
        </div>
        <Link to="/manufacturers/new">
          <Button className="bg-gradient-to-l from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800 text-white shadow-lg shadow-violet-500/25 px-6 rounded-xl gap-2">
            <Plus className="h-5 w-5" />
            إضافة شركة
          </Button>
        </Link>
      </div>

      {/* Stats Card */}
      {data && (
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Factory className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">إجمالي الشركات المصنعة</p>
                <p className="text-3xl font-bold">{data.total.toLocaleString('ar-IQ')}</p>
              </div>
            </div>
            <Building2 className="h-12 w-12 text-white/20" />
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[hsl(var(--border))] shadow-sm p-4">
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl">{error}</div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-12">
          <Loading text="جاري تحميل الشركات المصنعة..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">الشركة</th>
                 <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">الدولة</th>
                 <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">الترخيص</th>
                 <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">الحالة</th>
                 <th className="px-4 py-3.5 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{TRANSLATIONS.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {data?.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
                      <p className="text-[hsl(var(--muted-foreground))] font-medium">
                        {TRANSLATIONS.no_results}
                      </p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        حاول البحث بكلمات مختلفة
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.items.map((manufacturer, index) => (
                  <tr key={getManufacturerId(manufacturer) || index} className="hover:bg-[hsl(var(--accent))]/50 transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        to={`/manufacturers/${getManufacturerId(manufacturer)}`}
                        className="font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-2"
                      >
                        <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
                        {manufacturer.manufacturer_name || manufacturer.name}
                      </Link>
                      {(manufacturer.arabic_name || manufacturer.name) && (
                        <div className="text-sm text-[hsl(var(--muted-foreground))] mr-6">
                          {manufacturer.arabic_name || ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-[hsl(var(--foreground))]">
                        <Globe className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        {manufacturer.country || manufacturer.country_code || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-[hsl(var(--foreground))]">
                        <MapPin className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        {(manufacturer as any).license_number || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        manufacturer.status === 'active' || manufacturer.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {manufacturer.status === 'active' || manufacturer.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/manufacturers/${getManufacturerId(manufacturer)}`}>
                          <button className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all duration-200" title="عرض">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <Link to={`/manufacturers/${getManufacturerId(manufacturer)}/edit`}>
                          <button className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white flex items-center justify-center transition-all duration-200" title="تعديل">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(getManufacturerId(manufacturer))}
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center transition-all duration-200"
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {data && data.total > DEFAULT_PAGE_SIZE && (
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
    </div>
  );
}
