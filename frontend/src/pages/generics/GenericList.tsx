import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, FileText, AlertTriangle, Search, Filter, Pill, Calendar, Beaker, Heart, AlertCircle } from 'lucide-react';
import { useGenerics } from '../../hooks/useGenerics';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Input from '../../components/common/Input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { TRANSLATIONS, DEFAULT_PAGE_SIZE } from '../../utils/constants';
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
        isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
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
    <div className="space-y-6 animate-fade-in">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              هل أنت متأكد من حذف هذا الدواء الجنيس؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-white">
              إلغاء
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Pill className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
              الأدوية الجنيسة
            </h1>
            <p className="text-slate-500 text-sm lg:text-base">
              إدارة الأدوية الجنيسة في النظام
            </p>
          </div>
        </div>
        <Link to="/generics/new">
          <Button className="bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25 px-6 py-2.5 rounded-xl gap-2 font-medium">
            <Plus className="h-5 w-5" />
            إضافة دواء جنيس
          </Button>
        </Link>
      </div>

      {/* Filter Bar - Glassmorphism Style */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="بحث باسم الدواء الجنيس..."
              className="pr-12 bg-slate-50/50 border-slate-200 rounded-xl h-12 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <div className="lg:w-72 relative">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <select
              value={therapeuticClassId}
              onChange={(e) => handleTherapeuticClassChange(e.target.value)}
              disabled={therapeuticClassesLoading}
              className="w-full h-12 pr-12 pl-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 appearance-none cursor-pointer focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none focus:ring-2 disabled:opacity-50"
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
        <div className="bg-red-50/80 backdrop-blur border border-red-200 rounded-xl p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loading text="جاري تحميل البيانات..." />
        </div>
      )}

      {/* Data Table - Card Based with More Columns */}
      {!loading && data && (
        <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/50">
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    الدواء الجنيس
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    الاسم الكيميائي
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    التصنيف العلاجي
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    الحمل
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    الجدول
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">لا توجد أدوية جنيسة</p>
                        <p className="text-slate-400 text-sm">ابدأ بإضافة دواء جنيس جديد</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.items.map((generic: any, index: number) => (
                    <tr 
                      key={getGenericId(generic) || index} 
                      className="hover:bg-blue-50/40 transition-colors duration-200 group"
                    >
                      <td className="px-4 py-4">
                        <Link
                          to={`/generics/${getGenericId(generic)}`}
                          className="text-slate-800 hover:text-blue-600 font-semibold transition-colors"
                        >
                          {getGenericName(generic)}
                        </Link>
                        {generic.cas_number && (
                          <p className="text-slate-400 text-xs mt-0.5 font-mono">CAS: {generic.cas_number}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-slate-600 text-sm">
                          {generic.chemical_name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
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
                            <button className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md" title="عرض">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <Link to={`/generics/${getGenericId(generic)}/edit`}>
                            <button className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md" title="تعديل">
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(getGenericId(generic))}
                            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md" title="حذف"
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200/50 bg-slate-50/50">
                <p className="text-sm text-slate-600 font-medium">
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
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg px-4"
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSkip(skip + DEFAULT_PAGE_SIZE)}
                    disabled={!canNext}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg px-4"
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