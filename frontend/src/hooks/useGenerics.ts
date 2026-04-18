import { useState, useEffect, useCallback } from 'react';
import { genericService } from '../services/genericService';
import type { GenericDrug, GenericDrugWithDetails, GenericDrugCreate, GenericDrugUpdate } from '../types/generic';
import type { PaginatedResponse } from '../types/common';

interface UseGenericsOptions {
  skip?: number;
  limit?: number;
  search?: string;
  therapeutic_class_id?: number;
}

export const useGenerics = (options: UseGenericsOptions = {}) => {
  const [data, setData] = useState<PaginatedResponse<GenericDrug> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGenerics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await genericService.list(options);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تحميل الأدوية الجنيسة');
    } finally {
      setLoading(false);
    }
  }, [options.skip, options.limit, options.search, options.therapeutic_class_id]);

  useEffect(() => {
    fetchGenerics();
  }, [fetchGenerics]);

  return { data, loading, error, refetch: fetchGenerics };
};

export const useGeneric = (id: number | null) => {
  const [data, setData] = useState<GenericDrugWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeneric = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await genericService.get(id);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تحميل تفاصيل الدواء');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGeneric();
  }, [fetchGeneric]);

  return { data, loading, error, refetch: fetchGeneric };
};

export const useGenericMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGeneric = async (data: GenericDrugCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await genericService.create(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في إنشاء الدواء');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGeneric = async (id: number, data: GenericDrugUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await genericService.update(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تحديث الدواء');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGeneric = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await genericService.delete(id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في حذف الدواء');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createGeneric, updateGeneric, deleteGeneric, loading, error };
};
