import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Pill, Tag, FolderTree, Calendar, FileText, ArrowLeftRight, Plus, Trash2, AlertTriangle, Printer } from 'lucide-react';
import { genericService } from '../../services/genericService';
import { alternativeService } from '../../services/alternativeService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { TRANSLATIONS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import type { GenericDrugWithDetails } from '../../types/generic';
import type { GenericAlternativeWithNames } from '../../types/alternative';

export default function GenericDetail() {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;

  const [data, setData] = useState<GenericDrugWithDetails | null>(null);
  const [alternatives, setAlternatives] = useState<GenericAlternativeWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alternativeModalOpen, setAlternativeModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alternativeToDelete, setAlternativeToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (!numericId) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        // GET /generics/{id} and GET /generics/{id}/alternatives in parallel
        const [genericData, altsData] = await Promise.all([
          genericService.get(numericId),
          genericService.getAlternatives(numericId),
        ]);
        setData(genericData);
        setAlternatives(altsData);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [numericId]);

  if (loading) return <div className="flex justify-center min-h-[400px]"><Loading text="جاري تحميل تفاصيل الدواء..." /></div>;

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="p-6 text-center bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600 font-medium mb-2">حدث خطأ</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Pill className="h-16 w-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">{TRANSLATIONS.no_results}</p>
      </div>
    </div>
  );

  const infoItems = [
    { label: 'الاسم العام', value: data.generic_name || data.scientific_name, icon: FileText },
    { label: 'الاسم الكيميائي', value: data.chemical_name, icon: FileText },
    { label: 'الصيغة الجزيئية', value: data.molecular_formula, icon: FileText, ltr: true },
    { label: 'رقم CAS', value: data.cas_number, icon: FileText, ltr: true },
    { label: 'فئة الحمل', value: data.pregnancy_category, icon: FileText },
    { label: 'تصنيف المواد المخدرة', value: data.controlled_substance_schedule, icon: FileText },
  ];

  const clinicalItems = [
    { label: 'الدوائية', value: data.pharmacology },
    { label: 'دواعي الاستعمال', value: data.indications },
    { label: 'موانع الاستعمال', value: data.contraindications },
    { label: 'الآثار الجانبية', value: data.side_effects },
    { label: 'التفاعلات الدوائية', value: data.interactions },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/generics">
            <button className="w-10 h-10 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(270_70%_40%)] flex items-center justify-center shadow-[var(--shadow-md)]">
            <Pill className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {data.generic_name || data.scientific_name}
            </h1>
            {data.chemical_name && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{data.chemical_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          <Link to={`/generics/${numericId}/edit`}>
            <Button variant="outline" className="gap-2">تعديل</Button>
          </Link>
          <Link to={numericId ? `/brands/new?genericId=${numericId}` : '/brands/new'}>
            <Button className="gap-2">
              إضافة دواء تجاري
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6">
          <h2 className="font-semibold text-[hsl(var(--foreground))] mb-4 pb-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <Pill className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            المعلومات الأساسية
          </h2>
          <dl className="space-y-4">
            {infoItems.map(({ label, value, icon: Icon, ltr }) => value ? (
              <div key={label} className="flex items-start gap-3">
                <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))] mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <dt className="text-xs text-[hsl(var(--muted-foreground))]">{label}</dt>
                  <dd className={`font-medium text-[hsl(var(--foreground))] text-sm mt-0.5 ${ltr ? 'ltr-content' : ''}`}>{value}</dd>
                </div>
              </div>
            ) : null)}

            {data.therapeutic_class && (
              <div className="flex items-start gap-3">
                <FolderTree className="h-4 w-4 text-[hsl(var(--muted-foreground))] mt-1 flex-shrink-0" />
                <div>
                  <dt className="text-xs text-[hsl(var(--muted-foreground))]">التصنيف العلاجي</dt>
                  <dd className="mt-0.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                      {data.therapeutic_class.name}
                    </span>
                  </dd>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))] mt-1 flex-shrink-0" />
              <div>
                <dt className="text-xs text-[hsl(var(--muted-foreground))]">تاريخ الإنشاء</dt>
                <dd className="text-sm text-[hsl(var(--foreground))] mt-0.5">
                  {data.created_at ? formatDate(data.created_at) : '-'}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Brands Summary */}
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6">
          <h2 className="font-semibold text-[hsl(var(--foreground))] mb-4 pb-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <Tag className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            الأدوية التجارية
            {data.brand_count !== undefined && (
              <span className="mr-auto bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-bold px-2.5 py-0.5 rounded-full">{data.brand_count}</span>
            )}
          </h2>
          {data.brands && data.brands.length > 0 ? (
            <div className="space-y-2">
              {data.brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--accent))] border border-transparent hover:border-[hsl(var(--border))] transition-all group"
                >
                  <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] group-hover:bg-[hsl(var(--primary))] flex items-center justify-center flex-shrink-0 transition-colors">
                    <Tag className="h-4 w-4 text-[hsl(var(--primary))] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{brand.name}</p>
                    {brand.manufacturer_name && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{brand.manufacturer_name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
                <Tag className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">لا توجد أدوية تجارية مرتبطة</p>
              <Link to={`/brands/new?genericId=${numericId}`} className="mt-3">
                <Button variant="outline" size="sm" className="rounded-lg">إضافة دواء تجاري</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Information */}
      {clinicalItems.some((c) => c.value) && (
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6">
          <h2 className="font-semibold text-[hsl(var(--foreground))] mb-5 pb-3 border-b border-[hsl(var(--border))] flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            المعلومات السريرية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {clinicalItems.map(({ label, value }) => value ? (
              <div key={label} className="p-4 rounded-lg bg-[hsl(var(--muted))/0.4]">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">{label}</p>
                <p className="text-sm text-[hsl(var(--foreground))]">{value}</p>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Alternatives — uses GET /generics/{id}/alternatives */}
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[hsl(var(--border))]">
          <h2 className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            البدائل العلاجية
            <span className="bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-bold px-2.5 py-0.5 rounded-full">{alternatives.length}</span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => setAlternativeModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة بديل
          </Button>
        </div>
        {alternatives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
              <ArrowLeftRight className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">لا توجد بدائل علاجية مسجلة</p>
            <Button variant="outline" size="sm" onClick={() => setAlternativeModalOpen(true)} className="mt-3">
              إضافة بديل
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alternatives.map((alt) => {
              const altGeneric = alt.alternative_generic || { generic_id: alt.alternative_generic_id, generic_name: '' };
              return (
                <div
                  key={alt.alternative_id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[hsl(var(--accent))] border border-transparent hover:border-[hsl(var(--border))] transition-all group"
                >
                  <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary)/0.1)] group-hover:bg-[hsl(var(--primary))] flex items-center justify-center flex-shrink-0 transition-colors">
                    <Pill className="h-4 w-4 text-[hsl(var(--primary))] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/generics/${altGeneric.generic_id}`} className="text-sm font-medium text-[hsl(var(--foreground))] truncate hover:text-[hsl(var(--primary))]">
                      {altGeneric.generic_name}
                    </Link>
                    {alt.bioequivalence_status && (
                      <p className="text-xs mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                          alt.bioequivalence_status === 'equivalent' ? 'bg-emerald-100 text-emerald-700' :
                          alt.bioequivalence_status === 'similar' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {alt.bioequivalence_status}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAlternativeToDelete(alt.alternative_id)}
                      className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] hover:bg-red-500 text-[hsl(var(--muted-foreground))] hover:text-white flex items-center justify-center transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Alternative Dialog */}
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
            <Button variant="danger" onClick={async () => {
              if (!alternativeToDelete) return;
              try {
                await alternativeService.delete(alternativeToDelete);
                setDeleteDialogOpen(false);
                setAlternativeToDelete(null);
                toast({ title: 'تم الحذف بنجاح', description: 'تم حذف البديل من النظام' });
                const altsData = await genericService.getAlternatives(numericId!);
                setAlternatives(altsData);
              } catch (err: any) {
                toast({ title: 'فشل الحذف', description: err.response?.data?.detail || 'فشل الحذف', variant: 'destructive' });
              }
            }}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Alternative Modal */}
      <Dialog open={alternativeModalOpen} onOpenChange={setAlternativeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[hsl(var(--primary))]" />
              إضافة بديل علاجي
            </DialogTitle>
            <DialogDescription>
              اختر الدواء البديل لهذا الدواء الجنيس
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              سيتم إضافة ميزة اختيار الدواء البديل هنا. حالياً يمكنك إضافة البدائل من صفحة البدائل.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlternativeModalOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
