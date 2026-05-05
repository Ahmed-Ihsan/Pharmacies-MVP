import { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Trash2, ArrowLeftRight, AlertTriangle, Search, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import { alternativeService } from '../../services/alternativeService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { TRANSLATIONS, DEFAULT_PAGE_SIZE } from '../../utils/constants';
import type { PaginatedResponse } from '../../types/common';
import type { GenericAlternative } from '../../types/alternative';

export default function AlternativeList() {
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState<PaginatedResponse<GenericAlternative> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await alternativeService.list({ skip, limit: DEFAULT_PAGE_SIZE });
        setData(response);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [skip]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setSkip(0);
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await alternativeService.delete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف البديل من النظام' });
      const response = await alternativeService.list({ skip, limit: DEFAULT_PAGE_SIZE });
      setData(response);
    } catch (err: any) {
      toast({ title: 'فشل الحذف', description: err.response?.data?.detail || 'فشل الحذف', variant: 'destructive' });
    }
  };

  const getSimilarityColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-600';
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا البديل؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="danger" onClick={confirmDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_40%)] flex items-center justify-center shadow-[var(--shadow-md)]">
            <ArrowLeftRight className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {TRANSLATIONS.alternatives}
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              إدارة البدائل العلاجية للأدوية
            </p>
          </div>
        </div>
        <Link to="/alternatives/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {TRANSLATIONS.add}
          </Button>
        </Link>
      </div>

      {/* Stats Card */}
      {data && (
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_45%)] rounded-xl p-6 text-white shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-medium">إجمالي البدائل العلاجية</p>
                <p className="text-3xl font-bold mt-1">{data.total.toLocaleString('ar-IQ')}</p>
              </div>
            </div>
            <ArrowLeftRight className="h-10 w-10 text-white/20" />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 shadow-[var(--shadow-sm)]">
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="flex justify-center py-16">
          <Loading text="جاري تحميل البدائل العلاجية..." />
        </div>
      )}

      {/* Data Table */}
      {!loading && data && (
        <div className="table-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الدواء الأساسي</th>
                  <th className="text-center w-16">←→</th>
                  <th>الدواء البديل</th>
                   <th className="text-center">حالة التكافؤ</th>
                  <th className="text-center">{TRANSLATIONS.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                          <Search className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))] font-medium">{TRANSLATIONS.no_results}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">لا توجد بدائل علاجية مسجلة</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.items.map((item, index) => (
                    <tr key={item.alternative_id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                            <Pill className="h-4 w-4 text-[hsl(var(--primary))]" />
                          </div>
                          <span className="font-semibold text-[hsl(var(--foreground))]">
                            {item.primary_generic_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="h-8 w-8 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mx-auto">
                          <ArrowLeftRight className="h-4 w-4 text-[hsl(var(--primary))]" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                            <Pill className="h-4 w-4 text-[hsl(var(--primary))]" />
                          </div>
                          <span className="font-semibold text-[hsl(var(--foreground))]">
                            {item.alternative_generic_name}
                          </span>
                        </div>
                      </td>
                       <td className="px-4 py-4 text-center">
                         {item.bioequivalence_status ? (
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                             {item.bioequivalence_status}
                           </span>
                         ) : (
                           <span className="text-[hsl(var(--muted-foreground))]">-</span>
                         )}
                       </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link to={`/generics/${item.primary_generic_id}`}>
                            <button className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="عرض الدواء الأساسي">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <Link to={`/alternatives/${item.alternative_id}/edit`}>
                            <button className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-amber-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="تعديل">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(item.alternative_id)}
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

          {/* Pagination */}
          {data.total > DEFAULT_PAGE_SIZE && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                إجمالي: {data.total.toLocaleString('ar-IQ')} بديل
              </p>
              <div className="flex items-center gap-3">
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
