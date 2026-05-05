import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Button from './Button';

interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

export default function EnhancedPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
}: EnhancedPaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
      {/* Items Info & Page Size */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-[hsl(var(--muted-foreground))]">
          عرض <span className="font-semibold text-[hsl(var(--foreground))]">{startItem}</span> إلى{' '}
          <span className="font-semibold text-[hsl(var(--foreground))]">{endItem}</span> من أصل{' '}
          <span className="font-semibold text-[hsl(var(--foreground))]">{totalItems.toLocaleString('ar-IQ')}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[hsl(var(--muted-foreground))]">الصفحة:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2"
          title="الصفحة الأولى"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2"
          title="السابق"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <Button
                key={index}
                variant={page === currentPage ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-10 h-10 p-0"
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-2 text-[hsl(var(--muted-foreground))]">
                {page}
              </span>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2"
          title="التالي"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2"
          title="الصفحة الأخيرة"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Jump to Page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">اذهب إلى:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = Number(e.target.value);
            if (page >= 1 && page <= totalPages) {
              onPageChange(page);
            }
          }}
          className="w-20 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
        />
        <span className="text-sm text-[hsl(var(--muted-foreground))]">من {totalPages}</span>
      </div>
    </div>
  );
}
