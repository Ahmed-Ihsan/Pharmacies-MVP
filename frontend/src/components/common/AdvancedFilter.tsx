import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

interface AdvancedFilterProps {
  filters: FilterOption[];
  onApply: (filters: Record<string, any>) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvancedFilter({
  filters,
  onApply,
  onClear,
  isOpen,
  onClose,
}: AdvancedFilterProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filterValues);
    onClose();
  };

  const handleClear = () => {
    setFilterValues({});
    onClear();
    onClose();
  };

  const toggleExpanded = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            تصفية متقدمة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {filters.map((filter) => (
            <div key={filter.key} className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleExpanded(filter.key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[hsl(var(--accent))]/50 transition-colors"
              >
                <span className="font-medium text-[hsl(var(--foreground))]">{filter.label}</span>
                {expanded === filter.key ? (
                  <ChevronUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                )}
              </button>

              {expanded === filter.key && (
                <div className="px-4 pb-4">
                  {filter.type === 'text' && (
                    <input
                      type="text"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={`أدخل ${filter.label}`}
                      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  )}

                  {filter.type === 'number' && (
                    <input
                      type="number"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, Number(e.target.value))}
                      placeholder={`أدخل ${filter.label}`}
                      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  )}

                  {filter.type === 'date' && (
                    <input
                      type="date"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  )}

                  {filter.type === 'select' && (
                    <select
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    >
                      <option value="">الكل</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
          <Button variant="outline" onClick={handleClear} className="gap-2">
            <X className="h-4 w-4" />
            مسح الكل
          </Button>
          <Button onClick={handleApply} className="gap-2">
            <Filter className="h-4 w-4" />
            تطبيق التصفية
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
