import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/use-toast';

interface OptimisticUpdateOptions<T> {
  onMutate: (data: T) => Promise<any>;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  rollbackData?: (originalData: T) => T;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState<T | null>(null);
  const { toast } = useToast();

  const update = useCallback(
    async (newData: Partial<T>) => {
      const optimisticData = { ...data, ...newData };
      setOriginalData(data);
      setData(optimisticData);
      setIsUpdating(true);

      try {
        const result = await options.onMutate(optimisticData as T);
        options.onSuccess?.(result);
        return result;
      } catch (error: any) {
        const rollback = options.rollbackData
          ? options.rollbackData(originalData || data)
          : originalData || data;
        setData(rollback);
        options.onError?.(error);
        toast({
          title: "فشل التحديث",
          description: error.response?.data?.detail || "حدث خطأ أثناء التحديث",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsUpdating(false);
        setOriginalData(null);
      }
    },
    [data, options, originalData, toast]
  );

  return { data, update, isUpdating };
}
