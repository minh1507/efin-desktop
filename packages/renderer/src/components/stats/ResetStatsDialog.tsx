import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

interface ResetStatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetStatsDialog: React.FC<ResetStatsDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className="relative w-[320px] max-w-[90vw] bg-card rounded-lg shadow-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <button 
            className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent"
            onClick={onClose}
          >
            <XIcon className="h-4 w-4" />
          </button>
          
          <div className="mb-4">
            <h3 className="text-base font-medium">Xác nhận xóa dữ liệu</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bạn có chắc chắn muốn xóa toàn bộ dữ liệu thống kê? Hành động này không thể hoàn tác.
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirm}>
              Xóa dữ liệu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetStatsDialog; 