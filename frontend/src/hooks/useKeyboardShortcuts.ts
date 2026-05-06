import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcutsConfig {
  onSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      const isInputFocused = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

      // Ctrl/Cmd + K - Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        config.onSearch?.();
      }

      // Ctrl/Cmd + N - New
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        config.onNew?.();
      }

      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        config.onSave?.();
      }

      // Escape - Cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        config.onCancel?.();
      }

      // Ctrl/Cmd + R - Refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        config.onRefresh?.();
      }

      // Delete - Delete (only when not in input)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused) {
        e.preventDefault();
        config.onDelete?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, navigate]);

  // Navigation shortcuts (G + key pattern)
  useEffect(() => {
    let gPressed = false;
    let gTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G') {
        gPressed = true;
        gTimeout = setTimeout(() => { gPressed = false; }, 500);
      } else if (gPressed) {
        clearTimeout(gTimeout);
        gPressed = false;

        const key = e.key.toLowerCase();
        const routes: Record<string, string> = {
          d: '/',
          g: '/generics',
          b: '/brands',
          m: '/manufacturers',
          t: '/therapeutic-classes',
          f: '/dosage-forms',
          a: '/alternatives',
          p: '/prices',
          s: '/search',
          u: '/profile',
          e: '/settings',
        };

        if (routes[key]) {
          e.preventDefault();
          navigate(routes[key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gTimeout);
    };
  }, [navigate]);
}

export function useKeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: 'Ctrl + K', description: 'بحث سريع' },
    { keys: 'Ctrl + N', description: 'عنصر جديد' },
    { keys: 'Ctrl + S', description: 'حفظ' },
    { keys: 'Escape', description: 'إلغاء/إغلاق' },
    { keys: 'Ctrl + R', description: 'تحديث' },
    { keys: 'Delete', description: 'حذف' },
    { keys: 'G + D', description: 'الرئيسية' },
    { keys: 'G + G', description: 'الأدوية الجنيسة' },
    { keys: 'G + B', description: 'الأدوية التجارية' },
    { keys: 'G + M', description: 'الشركات المصنعة' },
  ];

  return shortcuts;
}
