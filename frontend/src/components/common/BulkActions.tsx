import { useState, memo } from 'react';
import { Trash2, Download, X } from 'lucide-react';
import Button from './Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { useToast } from '../ui/use-toast';

interface BulkActionsProps {
  selectedIds: number[];
  onBulkDelete: (ids: number[]) => Promise<void>;
  onBulkExport?: (ids: number[]) => void;
  onClearSelection: () => void;
  totalCount: number;
}

function BulkActions({
  selectedIds,
  onBulkDelete,
  onBulkExport,
  onClearSelection,
  totalCount
}: BulkActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await onBulkDelete(selectedIds);
      setDeleteDialogOpen(false);
      onClearSelection();
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف ${selectedIds.length} عنصر من النظام`,
      });
    } catch (error: any) {
      toast({
        title: "فشل الحذف",
        description: error.response?.data?.detail || 'فشل الحذف',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = () => {
    // This will be handled by the parent component
    onClearSelection();
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-in">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-[var(--shadow-sm)] rounded-2xl px-6 py-4 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-[hsl(var(--primary))] text-white px-3 py-1 rounded-full text-sm font-medium">
              {selectedIds.length}
            </div>
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">
              {selectedIds.length === totalCount ? 'تم تحديد الكل' : 'عناصر محددة'}
            </span>
          </div>

          <div className="h-6 w-px bg-[hsl(var(--border))]" />

          <div className="flex items-center gap-2">
            {selectedIds.length === totalCount && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                إلغاء التحديد
              </Button>
            )}

            {onBulkExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkExport(selectedIds)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </div>

          <button
            onClick={onClearSelection}
            className="p-2 hover:bg-[hsl(var(--accent))] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              تأكيد الحذف الجماعي
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف {selectedIds.length} عنصر؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف الكل'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(BulkActions);
