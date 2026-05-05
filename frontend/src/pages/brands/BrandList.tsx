import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, ScanBarcode, Package, Filter, Search as SearchIcon, Tag, Building2, Barcode, Scale, Beaker, AlertTriangle } from 'lucide-react';
import { useBrands } from '../../hooks/useBrands';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Input from '../../components/common/Input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { TRANSLATIONS, DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { brandService } from '../../services/brandService';

export default function BrandList() {
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [filterManufacturer, setFilterManufacturer] = useState('');
  const [filterGeneric, setFilterGeneric] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const { data, loading, error, refetch } = useBrands({
    skip,
    limit: DEFAULT_PAGE_SIZE,
    search: search || undefined,
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    setSkip(0);
  };

  const handleDelete = async (id: number) => {
    setBrandToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      await brandService.delete(brandToDelete);
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الدواء التجاري من النظام",
      });
      refetch();
    } catch (err: any) {
      toast({
        title: "فشل الحذف",
        description: err.response?.data?.detail || 'فشل الحذف',
        variant: "destructive",
      });
    }
  };

  const handleFilterManufacturer = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterManufacturer(e.target.value);
    setSkip(0);
  };

  const handleFilterGeneric = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterGeneric(e.target.value);
    setSkip(0);
  };

  const getBrandId = (brand: any) => brand.brand_id || brand.id;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا الدواء التجاري؟ لا يمكن التراجع عن هذا الإجراء.
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_40%)] flex items-center justify-center shadow-[var(--shadow-md)]">
            <Package className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {TRANSLATIONS.brands}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              إدارة الأدوية التجارية في النظام
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <ScanBarcode className="h-4 w-4" />
            بحث بالباركود
          </Button>
          <Link to="/brands/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {TRANSLATIONS.add}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      {data && (
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_45%)] rounded-xl p-6 text-white shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-medium">إجمالي الأدوية التجارية</p>
                <p className="text-3xl font-bold mt-1">{data.total.toLocaleString('ar-IQ')}</p>
              </div>
            </div>
            <Tag className="h-10 w-10 text-white/20" />
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              type="text"
              placeholder="تصفية بالشركة المصنعة"
              value={filterManufacturer}
              onChange={handleFilterManufacturer}
              className="pr-10"
              disabled={loading}
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              type="text"
              placeholder="تصفية بالدواء الجنيس"
              value={filterGeneric}
              onChange={handleFilterGeneric}
              className="pr-10"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-12">
          <Loading text="جاري تحميل الأدوية التجارية..." />
        </div>
      ) : (
        <div className="table-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الاسم التجاري</th>
                  <th>الدواء الجنيس</th>
                  <th>الشركة المصنعة</th>
                  <th>شكل الجرعة</th>
                  <th>القوة</th>
                  <th>رقم NDC</th>
                  <th>الباركود</th>
                  <th>الحالة</th>
                  <th className="text-center">{TRANSLATIONS.actions}</th>
                </tr>
              </thead>
              <tbody>
              {data?.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <SearchIcon className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
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
                data?.items.map((brand, index) => (
                  <tr key={`${getBrandId(brand) || 'brand'}-${index}`}>
                    <td className="px-4 py-4">
                      <Link
                        to={`/brands/${getBrandId(brand)}`}
                        className="font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-2"
                      >
                        <Package className="h-4 w-4 text-[hsl(var(--primary))]" />
                        {brand.brand_name || brand.name}
                      </Link>
                      {brand.package_size && (
                        <div className="text-xs text-[hsl(var(--muted-foreground))] mr-6 mt-1">
                          {brand.package_size}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                        {brand.generic_name || (
                          <span className="text-[hsl(var(--muted-foreground))]">غير محدد</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[hsl(var(--foreground))]">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        {brand.manufacturer_name || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Beaker className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <span className="text-sm text-[hsl(var(--foreground))]">
                          {brand.dosage_form_name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[hsl(var(--foreground))]">
                      {brand.strength_value ? (
                        <div className="flex items-center gap-1">
                          <Scale className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          <span className="font-medium">{brand.strength_value}</span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))]">{brand.strength_unit}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-[hsl(var(--foreground))] ltr-content">
                      {brand.ndc_number || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-[hsl(var(--foreground))] ltr-content">
                      {brand.barcode ? (
                        <div className="flex items-center gap-2">
                          <Barcode className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          {brand.barcode}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        brand.status === 'active' || brand.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : brand.status === 'discontinued' || brand.status === 'DISCONTINUED'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {brand.status === 'active' || brand.status === 'ACTIVE' ? 'نشط' : 
                         brand.status === 'discontinued' || brand.status === 'DISCONTINUED' ? 'متوقف' : 'مسحوب'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 justify-center">
                        <Link to={`/brands/${getBrandId(brand)}`}>
                          <button className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="عرض">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <Link to={`/brands/${getBrandId(brand)}/edit`}>
                          <button className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-amber-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="تعديل">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(getBrandId(brand))}
                          className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-red-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors"
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
          </div>

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
