import { useState, useCallback } from 'react';
import { brandService } from '../services/brandService';
import { genericService } from '../services/genericService';
import type { BrandName } from '../types/brand';
import type { GenericDrug } from '../types/generic';

export interface SearchResult {
  brands: BrandName[];
  generics: GenericDrug[];
}

export const useLookup = () => {
  const [results, setResults] = useState<SearchResult>({ brands: [], generics: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults({ brands: [], generics: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [brandsResponse, genericsResponse] = await Promise.all([
        brandService.list({ search: query, limit: 10 }),
        genericService.list({ search: query, limit: 10 }),
      ]);

      setResults({
        brands: brandsResponse.items,
        generics: genericsResponse.items,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'حدث خطأ في البحث');
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupByNdc = useCallback(async (ndcNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const brand = await brandService.getByNdc(ndcNumber);
      setResults({ brands: [brand], generics: [] });
      return brand;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'لم يتم العثور على الدواء');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupByBarcode = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);

    try {
      const brand = await brandService.getByBarcode(barcode);
      setResults({ brands: [brand], generics: [] });
      return brand;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'لم يتم العثور على الدواء');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = () => {
    setResults({ brands: [], generics: [] });
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    lookupByNdc,
    lookupByBarcode,
    clearResults,
  };
};
