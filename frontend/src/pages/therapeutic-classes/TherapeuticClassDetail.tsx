import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, FolderTree, Edit2, Trash2, AlertTriangle,
  ChevronLeft, Pill, ChevronRight
} from 'lucide-react';
import { therapeuticClassService } from '../../services/therapeuticClassService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import type { TherapeuticClassWithHierarchy, TherapeuticClass } from '../../types/therapeuticClass';

export default function TherapeuticClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = id ? parseInt(id, 10) : null;
  const { toast } = useToast();

  const [data, setData] = useState<TherapeuticClassWithHierarchy | null>(null);
  const [children, setChildren] = useState<TherapeuticClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!numericId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const [classData, childData] = await Promise.all([
          therapeuticClassService.get(numericId),
          therapeuticClassService.getChildren(numericId),
        ]);
        setData(classData);
        setChildren(childData);
      } catch (err: any) {
        toast({ title: 'خطأ', description: 'فشل تحميل بيانات التصنيف', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [numericId]);

  const handleDelete = async () => {
    if (!numericId) return;
    try {
      await therapeuticClassService.delete(numericId);
      toast({ title: 'تم الحذف', description: 'تم حذف التصنيف العلاجي من النظام' });
      navigate('/therapeutic-classes');
    } catch (err: any) {
      toast({ title: 'فشل الحذف', description: err.response?.data?.detail || 'فشل الحذف', variant: 'destructive' });
    }
    setDeleteDialogOpen(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loading text="جاري تحميل التصنيف العلاجي..." /></div>;
  if (!data) return <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">لم يتم العثور على التصنيف</div>;

  return (
    <div className="space-y-6 animate-fade-in">
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
              هل أنت متأكد من حذف تصنيف "{data.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="danger" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/therapeutic-classes">
            <button className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <FolderTree className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))]">{data.name}</h1>
            {data.arabic_name && <p className="text-[hsl(var(--muted-foreground))] text-sm mt-0.5">{data.arabic_name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/therapeutic-classes/${numericId}/edit`}>
            <Button variant="outline" className="gap-2 rounded-xl"><Edit2 className="h-4 w-4" />تعديل</Button>
          </Link>
          <Button variant="danger" className="gap-2 rounded-xl" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-[hsl(var(--foreground))] pb-3 border-b border-[hsl(var(--border))]">تفاصيل التصنيف</h2>

          {data.code && (
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">الرمز</p>
              <span className="inline-flex mt-1 items-center px-3 py-1 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-sm font-mono">{data.code}</span>
            </div>
          )}

          {data.parent ? (
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">التصنيف الأب</p>
              <Link to={`/therapeutic-classes/${data.parent.id}`} className="inline-flex items-center gap-2 mt-1 text-sm font-medium text-amber-600 hover:text-amber-700">
                <FolderTree className="h-4 w-4" />
                {data.parent.name}
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">النوع</p>
              <span className="inline-flex mt-1 items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">تصنيف رئيسي</span>
            </div>
          )}

          {data.level !== undefined && (
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">المستوى</p>
              <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-0.5">المستوى {data.level}</p>
            </div>
          )}

          {data.generics_count !== undefined && (
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">عدد الأدوية الجنيسة</p>
              <div className="flex items-center gap-2 mt-1">
                <Pill className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{data.generics_count}</p>
              </div>
            </div>
          )}

          {data.description && (
            <div className="pt-2 border-t border-[hsl(var(--border))]">
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">الوصف</p>
              <p className="text-sm text-[hsl(var(--foreground))]">{data.description}</p>
            </div>
          )}
        </div>

        {/* Children */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6">
          <h2 className="font-semibold text-[hsl(var(--foreground))] pb-3 border-b border-[hsl(var(--border))] mb-4 flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-amber-500" />
            التصنيفات الفرعية
            {children.length > 0 && (
              <span className="mr-auto bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{children.length}</span>
            )}
          </h2>
          {children.length > 0 ? (
            <div className="space-y-2">
              {children.map((child) => (
                <Link
                  key={child.id}
                  to={`/therapeutic-classes/${child.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 group-hover:bg-amber-500 flex items-center justify-center flex-shrink-0 transition-colors">
                      <FolderTree className="h-4 w-4 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">{child.name}</p>
                      {child.code && <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{child.code}</p>}
                    </div>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-amber-600 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-3">
                <FolderTree className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">لا توجد تصنيفات فرعية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
