import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowUp, ArrowDown, X } from 'lucide-react';

export interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRef: React.RefObject<HTMLElement>;
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
}

export function SearchDialog({
  open,
  onOpenChange,
  targetRef,
  onSearch,
  placeholder = 'Tìm kiếm...'
}: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState<Element[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      // Focus vào input khi dialog mở
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Handle outside click to close search box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current && 
        !searchBoxRef.current.contains(event.target as Node) &&
        open
      ) {
        // Đóng hộp tìm kiếm khi nhấp bên ngoài, nhưng giữ lại kết quả tìm kiếm
        onOpenChange(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  // Thực hiện tìm kiếm
  const handleSearch = () => {
    if (!targetRef.current || !searchTerm.trim()) {
      clearHighlights();
      setMatches([]);
      setCurrentMatch(0);
      return;
    }

    try {
      // Xóa các highlight hiện tại
      clearHighlights();

      // Lấy nội dung HTML để giữ nguyên cấu trúc
      const container = targetRef.current;
      
      // Sử dụng Range và TreeWalker để tìm kiếm text
      const allTextNodes: Text[] = [];
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while (node = walker.nextNode()) {
        const textNode = node as Text;
        if (textNode.textContent && textNode.textContent.trim()) {
          allTextNodes.push(textNode);
        }
      }
      
      // Tìm kiếm và highlight text
      const highlightedElements: Element[] = [];
      
      for (let i = 0; i < allTextNodes.length; i++) {
        const textNode = allTextNodes[i];
        const originalText = textNode.nodeValue || '';
        
        // Tìm tất cả vị trí xuất hiện của chuỗi cần tìm (không phân biệt hoa thường)
        const searchTermLower = searchTerm.toLowerCase();
        const textLower = originalText.toLowerCase();
        let lastIndex = 0;
        let index = textLower.indexOf(searchTermLower, lastIndex);
        
        // Mảng chứa các vị trí tìm thấy
        const positions = [];
        while (index !== -1) {
          positions.push(index);
          lastIndex = index + searchTermLower.length;
          index = textLower.indexOf(searchTermLower, lastIndex);
        }
        
        // Nếu có kết quả trong node này
        if (positions.length > 0) {
          let currentNode = textNode;
          let accumulatedOffset = 0;
          
          // Xử lý từng vị trí tìm thấy
          for (let j = 0; j < positions.length; j++) {
            const startPos = positions[j] - accumulatedOffset;
            const searchLength = searchTerm.length;
            
            // Tạo range cho phần text cần highlight
            const range = document.createRange();
            range.setStart(currentNode, startPos);
            range.setEnd(currentNode, startPos + searchLength);
            
            // Tạo span để highlight
            const elementSpan = document.createElement('span');
            elementSpan.className = 'search-highlight';
            elementSpan.textContent = originalText.substr(positions[j], searchLength);
            
            // Thay thế đoạn text bằng element span
            range.deleteContents();
            range.insertNode(elementSpan);
            
            // Thêm vào danh sách kết quả
            highlightedElements.push(elementSpan);
            
            // Cập nhật node và offset cho lần tìm kiếm tiếp theo
            if (elementSpan.nextSibling && elementSpan.nextSibling.nodeType === Node.TEXT_NODE) {
              currentNode = elementSpan.nextSibling as Text;
              // Tính lại offset tích lũy
              accumulatedOffset = positions[j] + searchLength;
            } else {
              // Không còn text node kế tiếp, dừng vòng lặp
              break;
            }
          }
        }
      }
      
      setMatches(highlightedElements);
      
      // Reset current match index and highlight first match if found
      if (highlightedElements.length > 0) {
        setCurrentMatch(0);
        highlightedElements[0].classList.add('search-highlight-active');
        highlightedElements[0].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      } else {
        setCurrentMatch(-1);
      }
      
      if (onSearch) {
        onSearch(searchTerm);
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm:', err);
    }
  };

  // Clear all highlights (xóa tất cả highlight)
  const clearHighlights = () => {
    if (!targetRef.current) return;
    
    // Xóa các highlight hiện tại
    const container = targetRef.current;
    const highlights = container.querySelectorAll('.search-highlight');
    
    highlights.forEach(el => {
      const textContent = el.textContent || '';
      const textNode = document.createTextNode(textContent);
      if (el.parentNode) {
        el.parentNode.replaceChild(textNode, el);
        el.parentNode.normalize(); // Gộp các text node liền kề
      }
    });
  };

  // Navigate to next match
  const goToNextMatch = () => {
    if (matches.length === 0) return;
    
    // Remove active class from current match
    if (currentMatch >= 0 && currentMatch < matches.length) {
      matches[currentMatch].classList.remove('search-highlight-active');
    }
    
    // Calculate next match index
    const nextMatch = (currentMatch + 1) % matches.length;
    setCurrentMatch(nextMatch);
    
    // Add active class to new match and scroll to it
    if (matches[nextMatch]) {
      matches[nextMatch].classList.add('search-highlight-active');
      matches[nextMatch].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Navigate to previous match
  const goToPrevMatch = () => {
    if (matches.length === 0) return;
    
    // Remove active class from current match
    if (currentMatch >= 0 && currentMatch < matches.length) {
      matches[currentMatch].classList.remove('search-highlight-active');
    }
    
    // Calculate previous match index
    const prevMatch = (currentMatch - 1 + matches.length) % matches.length;
    setCurrentMatch(prevMatch);
    
    // Add active class to new match and scroll to it
    if (matches[prevMatch]) {
      matches[prevMatch].classList.add('search-highlight-active');
      matches[prevMatch].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Xử lý thoát tìm kiếm
  const handleClose = () => {
    onOpenChange(false);
  };

  // Xóa kết quả tìm kiếm
  const clearSearch = () => {
    setSearchTerm('');
    clearHighlights();
    setMatches([]);
    setCurrentMatch(0);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        goToPrevMatch();
      } else if (e.key === 'F3' && !e.shiftKey) {
        e.preventDefault();
        goToNextMatch();
      } else if (e.key === 'F3' && e.shiftKey) {
        e.preventDefault();
        goToPrevMatch();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowDown' && matches.length > 0) {
        e.preventDefault();
        goToNextMatch();
      } else if (e.key === 'ArrowUp' && matches.length > 0) {
        e.preventDefault();
        goToPrevMatch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, matches, currentMatch]);

  if (!open) return null;

  return (
    <div 
      className="fixed top-[60px] right-6 bg-background/95 backdrop-blur border rounded-lg shadow-lg z-40 w-96"
      ref={searchBoxRef}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tìm kiếm</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-6 w-6"
            onClick={handleClose}
            title="Đóng hộp tìm kiếm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="pr-8"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          {searchTerm && (
            <div 
              className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer"
              onClick={clearSearch}
              title="Xóa tìm kiếm"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">
            {matches.length > 0 ? `${currentMatch + 1} / ${matches.length}` : 'Không có kết quả'}
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevMatch}
              disabled={matches.length === 0}
              title="Kết quả trước (Shift+F3/↑)"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={goToNextMatch}
              disabled={matches.length === 0}
              title="Kết quả tiếp theo (F3/↓)"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button 
              size="sm"
              onClick={handleSearch}
              className="ml-1"
            >
              Tìm
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .search-highlight {
          background-color: rgba(255, 255, 0, 0.3);
          border-radius: 2px;
        }
        
        .search-highlight-active {
          background-color: rgba(255, 165, 0, 0.5);
          border: 1px solid orange;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
} 