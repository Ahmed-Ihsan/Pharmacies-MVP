import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Building2, Factory, Search, MapPin, Globe, AlertTriangle, Download, Filter, Save, X, Loader2 } from 'lucide-react';
import { manufacturerService } from '../../services/manufacturerService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import BulkActions from '../../components/common/BulkActions';
import EnhancedPagination from '../../components/common/EnhancedPagination';
import AdvancedFilter from '../../components/common/AdvancedFilter';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useActivityLog } from '../../hooks/useActivityLog';
import { exportToCSV } from '../../utils/exportUtils';
import { TRANSLATIONS, DEFAULT_PAGE_SIZE } from '../../utils/constants';
import type { PaginatedResponse } from '../../types/common';
import type { Manufacturer } from '../../types/manufacturer';

export default function ManufacturerList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [data, setData] = useState<PaginatedResponse<Manufacturer> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manufacturerToDelete, setManufacturerToDelete] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [manufacturerToEdit, setManufacturerToEdit] = useState<Manufacturer | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await manufacturerService.list({
          skip,
          limit,
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
  }, [skip, search, limit]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => navigate('/search'),
    onNew: () => navigate('/manufacturers/new'),
    onRefresh: () => {
      setSkip(0);
      setSearch('');
    },
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    setSkip(0);
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    setManufacturerToEdit(manufacturer);
    setEditDialogOpen(true);
    setEditError(null);
  };

  const handleEditSubmit = async (formData: any) => {
    if (!manufacturerToEdit) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await manufacturerService.update(getManufacturerId(manufacturerToEdit), formData);
      setEditDialogOpen(false);
      setManufacturerToEdit(null);
      logActivity('update', 'manufacturer', getManufacturerId(manufacturerToEdit));
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الشركة المصنعة",
      });
      const response = await manufacturerService.list({
        skip,
        limit,
        search: search || undefined,
      });
      setData(response);
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'فشل التحديث');
    } finally {
      setEditLoading(false);
    }
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
      logActivity('delete', 'manufacturer', manufacturerToDelete);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الشركة المصنعة من النظام",
      });
      const response = await manufacturerService.list({
        skip,
        limit,
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

  const handleBulkDelete = async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => manufacturerService.delete(id)));
      setSelectedIds([]);
      setSelectAll(false);
      ids.forEach(id => logActivity('delete', 'manufacturer', id));
      const response = await manufacturerService.list({
        skip,
        limit,
        search: search || undefined,
      });
      setData(response);
    } catch (err: any) {
      throw err;
    }
  };

  const handleExport = (selectedIds?: number[]) => {
    const itemsToExport = selectedIds 
      ? data?.items.filter(item => selectedIds.includes(getManufacturerId(item)))
      : data?.items;
    
    if (itemsToExport) {
      const exportData = itemsToExport.map(item => ({
        name: item.manufacturer_name,
        country: item.country_code || '',
        status: item.status === 'active' ? 'نشط' : 'غير نشط',
      }));
      
      exportToCSV(exportData, 'manufacturers');
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير البيانات إلى CSV",
      });
    }
  };

  const handleFilterApply = (filters: Record<string, any>) => {
    // Implement filter logic
    console.log('Filters applied:', filters);
  };

  const handleFilterClear = () => {
    setSearch('');
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else if (data) {
      setSelectedIds(data.items.map(item => getManufacturerId(item)));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const getManufacturerId = (manufacturer: Manufacturer) => manufacturer.manufacturer_id || manufacturer.id || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-[hsl(var(--primary))]" />
              تعديل الشركة المصنعة
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            تعديل بيانات الشركة المصنعة بسرعة دون مغادرة الصفحة
          </DialogDescription>
          
          {editLoading ? (
            <div className="space-y-4 py-4">
              {/* Skeleton Loading matching form layout */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-[hsl(var(--muted))] rounded animate-pulse" />
                <div className="h-10 bg-[hsl(var(--bg-elevated))] rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-[hsl(var(--muted))] rounded animate-pulse" />
                <div className="h-10 bg-[hsl(var(--bg-elevated))] rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-12 bg-[hsl(var(--muted))] rounded animate-pulse" />
                <div className="h-10 bg-[hsl(var(--bg-elevated))] rounded-lg animate-pulse" />
              </div>
            </div>
          ) : editError ? (
            <div className="py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <p className="text-red-600 font-medium">{editError}</p>
                <Button onClick={() => handleEditSubmit(manufacturerToEdit)} variant="outline" className="gap-2">
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          ) : manufacturerToEdit ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                manufacturer_name: (e.target as any).manufacturer_name.value,
                license_number: (e.target as any).license_number.value,
                country_code: (e.target as any).country_code.value,
                status: (e.target as any).status.value,
              };
              handleEditSubmit(formData);
            }} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">اسم الشركة</label>
                <input
                  name="manufacturer_name"
                  defaultValue={manufacturerToEdit.manufacturer_name || manufacturerToEdit.name}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">رقم الترخيص</label>
                <input
                  name="license_number"
                  defaultValue={(manufacturerToEdit as any).license_number || ''}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">الدولة</label>
                <select
                  name="country_code"
                  defaultValue={manufacturerToEdit.country_code || ''}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
                >
                  <option value="">-- اختر الدولة --</option>
                  <option value="IQ">العراق</option>
                  <option value="SA">السعودية</option>
                  <option value="AE">الإمارات</option>
                  <option value="EG">مصر</option>
                  <option value="JO">الأردن</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">الحالة</label>
                <select
                  name="status"
                  defaultValue={manufacturerToEdit.status || 'active'}
                  className="w-full h-10 px-3 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
                >
                  <option value="active">نشط</option>
                  <option value="suspended">غير نشط</option>
                </select>
              </div>
            </form>
          ) : null}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="gap-2">
              <X className="h-4 w-4" />
              إلغاء
            </Button>
            {!editLoading && !editError && manufacturerToEdit && (
              <Button onClick={() => {
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }} className="gap-2">
                {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ التعديلات
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_40%)] flex items-center justify-center shadow-[var(--shadow-md)]">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              الشركات المصنعة
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              إدارة الشركات المصنعة للأدوية
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setFilterOpen(true)} className="gap-2">
            <Filter className="h-4 w-4" />
            تصفية
          </Button>
          <Button variant="outline" onClick={() => handleExport()} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
          <Link to="/manufacturers/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة شركة
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
                <Factory className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-medium">إجمالي الشركات المصنعة</p>
                <p className="text-3xl font-bold mt-1">{data.total.toLocaleString('ar-IQ')}</p>
              </div>
            </div>
            <Building2 className="h-10 w-10 text-white/20" />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 shadow-[var(--shadow-sm)]">
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex justify-center py-12">
          <Loading text="جاري تحميل الشركات المصنعة..." />
        </div>
      ) : (
        <div className="table-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      checked={selectAll || (data && selectedIds.length === data.items.length && data.items.length > 0)}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th>الشركة</th>
                   <th>الدولة</th>
                   <th>الترخيص</th>
                   <th>الحالة</th>
                   <th className="text-center">{TRANSLATIONS.actions}</th>
                </tr>
              </thead>
              <tbody>
              {data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
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
                  <tr 
                    key={`mfr-${getManufacturerId(manufacturer)}-${index}`} 
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(getManufacturerId(manufacturer))}
                        onChange={() => toggleSelection(getManufacturerId(manufacturer))}
                        className="rounded"
                      />
                    </td>
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
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {manufacturer.status === 'active' || manufacturer.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 justify-center">
                        <Link to={`/manufacturers/${getManufacturerId(manufacturer)}`}>
                          <button className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="عرض">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleEdit(manufacturer)}
                          className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-amber-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(getManufacturerId(manufacturer))}
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

          {data && data.total > 0 && (
            <EnhancedPagination
              currentPage={Math.floor(skip / limit) + 1}
              totalPages={Math.ceil(data.total / limit)}
              pageSize={limit}
              totalItems={data.total}
              onPageChange={(page) => setSkip((page - 1) * limit)}
              onPageSizeChange={(size) => {
                setLimit(size);
                setSkip(0);
              }}
            />
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActions
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleExport}
        onClearSelection={() => {
          setSelectedIds([]);
          setSelectAll(false);
        }}
        totalCount={data?.total || 0}
      />

      {/* Advanced Filter Dialog */}
      <AdvancedFilter
        filters={[
          { key: 'name', label: 'اسم الشركة', type: 'text' },
          { key: 'country', label: 'الدولة', type: 'text' },
          { key: 'status', label: 'الحالة', type: 'select', options: [
            { value: 'active', label: 'نشط' },
            { value: 'inactive', label: 'غير نشط' },
          ]},
        ]}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
