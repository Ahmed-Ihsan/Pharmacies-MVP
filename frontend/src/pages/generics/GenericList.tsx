import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, FileText, AlertTriangle, Search, Filter, Pill, Heart, AlertCircle } from 'lucide-react';
import { useGenerics } from '../../hooks/useGenerics';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Input from '../../components/common/Input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { genericService } from '../../services/genericService';
import { therapeuticClassService } from '../../services/therapeuticClassService';
import type { GenericDrug } from '../../types/generic';

export default function GenericList() {
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [therapeuticClassId, setTherapeuticClassId] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [genericToDelete, setGenericToDelete] = useState<number | null>(null);
  const [therapeuticClasses, setTherapeuticClasses] = useState<Array<{ id: number; name: string }>>([]);
  const [therapeuticClassesLoading, setTherapeuticClassesLoading] = useState(true);
  const { toast } = useToast();

  const therapeuticClassIdNumber = useMemo(() => {
    const parsed = parseInt(therapeuticClassId, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [therapeuticClassId]);

  const { data, loading, error, refetch } = useGenerics({
    skip,
    limit: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    therapeutic_class_id: therapeuticClassIdNumber,
  });

  useEffect(() => {
    const loadTherapeuticClasses = async () => {
      try {
        const res = await therapeuticClassService.list({ limit: 1000 });
        setTherapeuticClasses(
          res.items.map((item: any) => ({
            id: item.id ?? item.class_id,
            name: item.name ?? item.class_name,
          })).filter((x: any) => typeof x.id === 'number' && !!x.name)
        );
      } finally {
        setTherapeuticClassesLoading(false);
      }
    };
    loadTherapeuticClasses();
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    setSkip(0);
  };

  const handleDelete = async (id: number) => {
    setGenericToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!genericToDelete) return;
    try {
      await genericService.delete(genericToDelete);
      setDeleteDialogOpen(false);
      setGenericToDelete(null);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الدواء الجنيس من النظام",
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

  const handleTherapeuticClassChange = (value: string) => {
    setTherapeuticClassId(value);
    setSkip(0);
  };

  const getGenericId = (generic: GenericDrug) => generic.generic_id ?? generic.id ?? 0;
  const getGenericName = (generic: GenericDrug) => generic.generic_name ?? generic.scientific_name ?? '';
  const getTherapeuticClassName = (generic: any) =>
    generic.therapeutic_class?.name ?? generic.therapeutic_class_name ?? '-';
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const isActive = status.toLowerCase() === 'active' || status === 'نشط';
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
      }`}>
        {status}
      </span>
    );
  };
  const getPregnancyBadge = (category?: string) => {
    if (!category) return '-';
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
        <Heart className="h-3 w-3" />
        {category}
      </span>
    );
  };
  const getScheduleBadge = (schedule?: string) => {
    if (!schedule) return '-';
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <AlertCircle className="h-3 w-3" />
        {schedule}
      </span>
    );
  };

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
              هل أنت متأكد من حذف هذا الدواء الجنيس؟ لا يمكن التراجع عن هذا الإجراء.
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
            <Pill className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              الأدوية الجنيسة
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              إدارة الأدوية الجنيسة في النظام
            </p>
          </div>
        </div>
        <Link to="/generics/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة دواء جنيس
          </Button>
        </Link>
      </div>

      {/* Stats Card */}
      {data && (
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_45%)] rounded-xl p-6 text-white shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-medium">إجمالي الأدوية الجنيسة</p>
                <p className="text-3xl font-bold mt-1">{data.total.toLocaleString('ar-IQ')}</p>
              </div>
            </div>
            <Pill className="h-10 w-10 text-white/20" />
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="بحث باسم الدواء الجنيس..."
              className="pr-12"
            />
          </div>
          <div className="lg:w-72 relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))] pointer-events-none" />
            <select
              value={therapeuticClassId}
              onChange={(e) => handleTherapeuticClassChange(e.target.value)}
              disabled={therapeuticClassesLoading}
              className="w-full h-11 pr-12 pl-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm text-[hsl(var(--foreground))] appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">جميع التصنيفات العلاجية</option>
              {therapeuticClasses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loading text="جاري تحميل البيانات..." />
        </div>
      )}

      {/* Data Table */}
      {!loading && data && (
        <div className="table-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>الدواء الجنيس</th>
                  <th>الاسم الكيميائي</th>
                  <th>التصنيف العلاجي</th>
                  <th className="text-center">الحمل</th>
                  <th className="text-center">الجدول</th>
                  <th className="text-center">الحالة</th>
                  <th className="text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                          <FileText className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))] font-medium">لا توجد أدوية جنيسة</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">ابدأ بإضافة دواء جنيس جديد</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.items.map((generic: any, index: number) => (
                    <tr key={`${getGenericId(generic) || 'generic'}-${index}`}>
                      <td className="px-4 py-4">
                        <Link
                          to={`/generics/${getGenericId(generic)}`}
                          className="font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-2"
                        >
                          <Pill className="h-4 w-4 text-[hsl(var(--primary))]" />
                          {getGenericName(generic)}
                        </Link>
                        {generic.cas_number && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mr-6 mt-1 font-mono">CAS: {generic.cas_number}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-[hsl(var(--foreground))]">
                          {generic.chemical_name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-medium">
                          {getTherapeuticClassName(generic)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getPregnancyBadge(generic.pregnancy_category)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getScheduleBadge(generic.controlled_substance_schedule)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(generic.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link to={`/generics/${getGenericId(generic)}`}>
                            <button className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--primary))] text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="عرض">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <Link to={`/generics/${getGenericId(generic)}/edit`}>
                            <button className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-amber-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors" title="تعديل">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(getGenericId(generic))}
                            className="h-8 w-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-red-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors"
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
          {(() => {
            const hasQuery = !!search || !!therapeuticClassIdNumber;
            const canPrev = skip > 0;
            const canNext = hasQuery ? data.items.length === DEFAULT_PAGE_SIZE : skip + DEFAULT_PAGE_SIZE < data.total;
            const shouldShow = hasQuery ? (canPrev || canNext) : data.total > DEFAULT_PAGE_SIZE;
            if (!shouldShow) return null;
            const from = data.items.length > 0 ? skip + 1 : 0;
            const to = skip + data.items.length;
            return (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
                <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                  {hasQuery ? (
                    <>عرض {from} إلى {to}</>
                  ) : (
                    <>عرض {from} إلى {Math.min(skip + DEFAULT_PAGE_SIZE, data.total)} من {data.total}</>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSkip(Math.max(0, skip - DEFAULT_PAGE_SIZE))}
                    disabled={!canPrev}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSkip(skip + DEFAULT_PAGE_SIZE)}
                    disabled={!canNext}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}