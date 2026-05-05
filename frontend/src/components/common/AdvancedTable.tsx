import { useState, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface Column {
  id: string;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
}

interface AdvancedTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  selectable?: boolean;
}

export default function AdvancedTable({ columns, data, onRowClick, selectable }: AdvancedTableProps) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => 
    columns.reduce((acc, col) => ({ ...acc, [col.id]: col.width || 150 }), {})
  );
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (columnId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(columnId);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColumn || !tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();
      const newWidth = e.clientX - tableRect.left;

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: Math.max(100, newWidth),
      }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn]);

  return (
    <div ref={tableRef} className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[hsl(var(--muted))]">
            {selectable && (
              <th className="px-4 py-3 w-10">
                <input type="checkbox" className="rounded" />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.id}
                className="px-4 py-3 text-right font-semibold text-sm text-[hsl(var(--muted-foreground))] relative group"
                style={{ width: columnWidths[column.id], minWidth: column.minWidth, maxWidth: column.maxWidth }}
              >
                <div className="flex items-center justify-between">
                  <span>{column.header}</span>
                  {column.resizable && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[hsl(var(--primary))] transition-colors"
                      onMouseDown={(e) => handleResizeStart(column.id, e)}
                    >
                      <GripVertical className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100" />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]/50 cursor-pointer transition-colors"
            >
              {selectable && (
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.id} className="px-4 py-3 text-sm">
                  {row[column.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
