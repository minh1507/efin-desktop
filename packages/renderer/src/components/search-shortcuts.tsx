import { Keyboard, Search, ArrowUp, ArrowDown } from 'lucide-react';

export function SearchShortcuts() {
  return (
    <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Keyboard className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">Phím tắt</span>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex">
            <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 mr-1">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600">K</kbd>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Search className="h-3 w-3" />
            <span>Mở tìm kiếm</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex">
            <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600">Enter</kbd>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Search className="h-3 w-3" />
            <span>Tìm kết quả</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex">
            <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600">F3</kbd>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowDown className="h-3 w-3" />
            <span>Kết quả tiếp theo</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex">
            <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 mr-1">Shift</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600">F3</kbd>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUp className="h-3 w-3" />
            <span>Kết quả trước đó</span>
          </div>
        </div>
      </div>
    </div>
  );
} 