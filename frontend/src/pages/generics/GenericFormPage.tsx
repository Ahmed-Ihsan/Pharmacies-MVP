import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GenericForm from '../../components/forms/GenericForm';
import { genericService } from '../../services/genericService';
import Loading from '../../components/common/Loading';
import { useToast } from '../../components/ui/use-toast';

export default function GenericFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const isEdit = !!numericId;
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genericData, setGenericData] = useState<any>(null);
  const [loading, setLoading] = useState(isEdit);

  // Load data for edit mode
  useEffect(() => {
    const loadData = async () => {
      if (isEdit && numericId) {
        try {
          const data = await genericService.get(numericId);
          setGenericData(data);
        } catch (err) {
          console.error('Failed to load generic data', err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [isEdit, numericId]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEdit && numericId) {
        await genericService.update(numericId, data);
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث بيانات الدواء الجنيس",
        });
      } else {
        await genericService.create(data);
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تم إضافة الدواء الجنيس إلى النظام",
        });
      }
      navigate('/generics');
    } catch (err: any) {
      toast({
        title: "فشل الحفظ",
        description: err.response?.data?.detail || 'فشل الحفظ',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && loading) {
    return (
      <div className="flex justify-center min-h-[400px]">
        <Loading text="جاري تحميل البيانات..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <GenericForm
        initialData={genericData || undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/generics')}
        isLoading={isSubmitting}
        isEdit={isEdit}
      />
    </div>
  );
}
