import { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Trash2, Container, AlertTriangle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dosageFormService } from '../../services/dosageFormService';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { TRANSLATIONS, DEFAULT_PAGE_SIZE } from '../../utils/constants';
import type { PaginatedResponse } from '../../types/common';
import type { DosageForm } from '../../types/dosageForm';

export default function DosageFormList() {
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [data, setData] = useState<PaginatedResponse<DosageForm> | null>(null);
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
        const response = await dosageFormService.list({
          skip,
          limit: DEFAULT_PAGE_SIZE,
          search: search || undefined,
        });
        setData(response);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'حدث خطأ في تحميل البيانات');
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

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await dosageFormService.delete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({ title: 'تم الحذف بنجاح', description: 'تم حذف شكل الجرعة من النظام' });
      const response = await dosageFormService.list({ skip, limit: DEFAULT_PAGE_SIZE, search: search || undefined });
      setData(response);
    } catch (err: any) {
      toast({ title: 'فشل الحذف', description: err.response?.data?.detail || 'فشل الحذف', variant: 'destructive' });
    }
  };

  const getItemId = (item: DosageForm) => (item as any).form_id ?? item.id ?? 0;

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
              هل أنت متأكد من حذف شكل الجرعة هذا؟ لا يمكن التراجع عن هذا الإجراء.
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Container className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))]">
              {TRANSLATIONS.dosageForms}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">
              إدارة أشكال الجرعات الدوائية في النظام
            </p>
          </div>
        </div>
        <Link to="/dosage-forms/new">
          <Button className="bg-gradient-to-l from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white shadow-lg shadow-rose-500/25 px-6 rounded-xl gap-2">
            <Plus className="h-5 w-5" />
            {TRANSLATIONS.add}
          </Button>
        </Link>
      </div>

      {/* Stats Banner */}
      {data && (
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Container className="h-8 w-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm">إجمالي أشكال الجرعات</p>
                <p className="text-3xl font-bold">{data.total.toLocaleString('ar-IQ')}</p>
              </div>
            </div>
            <Container className="h-16 w-16 text-white/10" />
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
          <Loading text="جاري تحميل أشكال الجرعات..." />
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
                    {TRANSLATIONS.name}
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    الرمز
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    الاختصار
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    {TRANSLATIONS.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))/0.6]">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                          <Search className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))] font-medium">{TRANSLATIONS.no_results}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">حاول البحث بكلمات مختلفة</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.items.map((item) => (
                    <tr key={getItemId(item)} className="hover:bg-[hsl(var(--accent))]/50 transition-colors duration-150">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                            <Container className="h-4 w-4 text-rose-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))]">{item.form_name}</p>
                            {item.arabic_name && (
                              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{item.arabic_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 ltr-content">
                        {item.form_code ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-xs font-mono">
                            {item.form_code}
                          </span>
                        ) : (
                          <span className="text-[hsl(var(--muted-foreground))]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 ltr-content">
                        {item.form_category ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
                            {item.form_category}
                          </span>
                        ) : (
                          <span className="text-[hsl(var(--muted-foreground))]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link to={`/dosage-forms/${getItemId(item)}`}>
                            <button className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all duration-200" title="عرض">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <Link to={`/dosage-forms/${getItemId(item)}/edit`}>
                            <button className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white flex items-center justify-center transition-all duration-200" title="تعديل">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(getItemId(item))}
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
                إجمالي: {data.total.toLocaleString('ar-IQ')} عنصر
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
