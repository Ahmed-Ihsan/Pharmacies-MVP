import { useHotkeys } from 'react-hotkeys-hook';
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

  // Global shortcuts
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    config.onSearch?.();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+n, cmd+n', (e) => {
    e.preventDefault();
    config.onNew?.();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    config.onSave?.();
  }, { enableOnFormTags: true });

  useHotkeys('escape', (e) => {
    e.preventDefault();
    config.onCancel?.();
  });

  useHotkeys('ctrl+r, cmd+r', (e) => {
    e.preventDefault();
    config.onRefresh?.();
  });

  useHotkeys('delete, backspace', (e) => {
    if (document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault();
      config.onDelete?.();
    }
  });

  // Navigation shortcuts
  useHotkeys('g then d', () => navigate('/'));
  useHotkeys('g then g', () => navigate('/generics'));
  useHotkeys('g then b', () => navigate('/brands'));
  useHotkeys('g then m', () => navigate('/manufacturers'));
  useHotkeys('g then t', () => navigate('/therapeutic-classes'));
  useHotkeys('g then f', () => navigate('/dosage-forms'));
  useHotkeys('g then a', () => navigate('/alternatives'));
  useHotkeys('g then p', () => navigate('/prices'));
  useHotkeys('g then s', () => navigate('/search'));
  useHotkeys('g then u', () => navigate('/profile'));
  useHotkeys('g then e', () => navigate('/settings'));
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
