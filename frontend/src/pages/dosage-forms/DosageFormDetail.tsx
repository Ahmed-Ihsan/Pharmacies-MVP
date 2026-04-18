import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Container, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { dosageFormService } from '../../services/dosageFormService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import type { DosageForm } from '../../types/dosageForm';

export default function DosageFormDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = id ? parseInt(id, 10) : null;
  const { toast } = useToast();

  const [data, setData] = useState<DosageForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!numericId) return;
    dosageFormService.get(numericId)
      .then(setData)
      .catch(() => toast({ title: 'خطأ', description: 'فشل تحميل بيانات شكل الجرعة', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [numericId]);

  const handleDelete = async () => {
    if (!numericId) return;
    try {
      await dosageFormService.delete(numericId);
      toast({ title: 'تم الحذف', description: 'تم حذف شكل الجرعة من النظام' });
      navigate('/dosage-forms');
    } catch (err: any) {
      toast({ title: 'فشل الحذف', description: err.response?.data?.detail || 'فشل الحذف', variant: 'destructive' });
    }
    setDeleteDialogOpen(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loading text="جاري التحميل..." /></div>;
  if (!data) return <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">لم يتم العثور على شكل الجرعة</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
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
              هل أنت متأكد من حذف شكل الجرعة "{data.name}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="danger" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dosage-forms">
            <button className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Container className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{data.name}</h1>
            {data.arabic_name && <p className="text-[hsl(var(--muted-foreground))] text-sm">{data.arabic_name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/dosage-forms/${numericId}/edit`}>
            <Button variant="outline" className="gap-2 rounded-xl"><Edit2 className="h-4 w-4" />تعديل</Button>
          </Link>
          <Button variant="danger" className="gap-2 rounded-xl" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />حذف
          </Button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-[hsl(var(--foreground))] pb-3 border-b border-[hsl(var(--border))]">تفاصيل شكل الجرعة</h2>

        {[
          { label: 'الاسم', value: data.name },
          { label: 'الاسم العربي', value: data.arabic_name },
          { label: 'الرمز', value: data.code, mono: true },
          { label: 'الاختصار', value: data.abbreviation, mono: true },
          { label: 'الوصف', value: data.description },
        ].map(({ label, value, mono }) =>
          value ? (
            <div key={label}>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
              <p className={`text-sm font-medium text-[hsl(var(--foreground))] mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
