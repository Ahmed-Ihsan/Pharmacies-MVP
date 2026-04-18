import { useState, useEffect, useCallback } from 'react';
import { brandService } from '../services/brandService';
import type { BrandName, BrandNameWithDetails, BrandNameCreate, BrandNameUpdate } from '../types/brand';
import type { PaginatedResponse } from '../types/common';

interface UseBrandsOptions {
  skip?: number;
  limit?: number;
  search?: string;
  generic_id?: number;
  manufacturer_id?: number;
}

export const useBrands = (options: UseBrandsOptions = {}) => {
  const [data, setData] = useState<PaginatedResponse<BrandName> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.list(options);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تحميل الأدوية التجارية');
    } finally {
      setLoading(false);
    }
  }, [options.skip, options.limit, options.search, options.generic_id, options.manufacturer_id]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return { data, loading, error, refetch: fetchBrands };
};

export const useBrand = (id: number | null) => {
  const [data, setData] = useState<BrandNameWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrand = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.get(id);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تحميل تفاصيل الدواء');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  return { data, loading, error, refetch: fetchBrand };
};

export const useBrandByNdc = (ndcNumber: string | null) => {
  const [data, setData] = useState<BrandName | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByNdc = useCallback(async () => {
    if (!ndcNumber) return;
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.getByNdc(ndcNumber);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'لم يتم العثور على الدواء');
    } finally {
      setLoading(false);
    }
  }, [ndcNumber]);

  return { data, loading, error, searchByNdc };
};

export const useBrandByBarcode = (barcode: string | null) => {
  const [data, setData] = useState<BrandName | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByBarcode = useCallback(async () => {
    if (!barcode) return;
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.getByBarcode(barcode);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'لم يتم العثور على الدواء');
    } finally {
      setLoading(false);
    }
  }, [barcode]);

  return { data, loading, error, searchByBarcode };
};

export const useBrandMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBrand = async (data: BrandNameCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.create(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في إنشاء الدواء');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBrand = async (id: number, data: BrandNameUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await brandService.update(id, data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في تحديث الدواء');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBrand = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await brandService.delete(id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في حذف الدواء');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBrand, updateBrand, deleteBrand, loading, error };
};
