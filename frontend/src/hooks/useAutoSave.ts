import { useEffect, useRef } from 'react';

interface AutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
  storageKey?: string;
}

export function useAutoSave({
  data,
  onSave,
  debounceMs = 1000,
  enabled = true,
  storageKey,
}: AutoSaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Save to localStorage for draft
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }

    // Debounced save to server
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      
      isSavingRef.current = true;
      try {
        await onSave(data);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, debounceMs, enabled, storageKey]);

  const clearDraft = () => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const loadDraft = () => {
    if (storageKey) {
      const draft = localStorage.getItem(storageKey);
      return draft ? JSON.parse(draft) : null;
    }
    return null;
  };

  return { clearDraft, loadDraft };
}
