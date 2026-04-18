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
    <div className="space-y-6 animate-fade-in">
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ArrowLeftRight className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))]">
              {TRANSLATIONS.alternatives}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">
              إدارة البدائل العلاجية للأدوية
            </p>
          </div>
        </div>
        <Link to="/alternatives/new">
          <Button className="bg-gradient-to-l from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/25 px-6 rounded-xl gap-2">
            <Plus className="h-5 w-5" />
            {TRANSLATIONS.add}
          </Button>
        </Link>
      </div>

      {/* Stats Banner */}
      {data && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <ArrowLeftRight className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">إجمالي البدائل العلاجية</p>
                <p className="text-3xl font-bold">{data.total.toLocaleString('ar-IQ')}</p>
              </div>
            </div>
            <ArrowLeftRight className="h-16 w-16 text-white/10" />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[hsl(var(--border))] shadow-sm p-4">
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
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
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    الدواء الأساسي
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider w-16">
                    ←→
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    الدواء البديل
                  </th>
                   <th className="px-4 py-3.5 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                     حالة التكافؤ
                   </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    {TRANSLATIONS.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))/0.6]">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                          <Search className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))] font-medium">{TRANSLATIONS.no_results}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">لا توجد بدائل علاجية مسجلة</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.items.map((item) => (
                    <tr key={item.alternative_id} className="hover:bg-[hsl(var(--accent))]/50 transition-colors duration-150">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Pill className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-semibold text-[hsl(var(--foreground))]">
                            {item.primary_generic_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                          <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Pill className="h-4 w-4 text-emerald-600" />
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
                            <button className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all duration-200" title="عرض الدواء الأساسي">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <Link to={`/alternatives/${item.alternative_id}/edit`}>
                            <button className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white flex items-center justify-center transition-all duration-200" title="تعديل">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(item.alternative_id)}
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
                  className="rounded-lg px-4"
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={skip + DEFAULT_PAGE_SIZE >= data.total}
                  onClick={() => setSkip(skip + DEFAULT_PAGE_SIZE)}
                  className="rounded-lg px-4"
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
