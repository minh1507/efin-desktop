import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SearchContextType {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const toggleSearch = () => setIsSearchOpen(prev => !prev);
  const clearSearch = () => {
    // Xóa tất cả highlight khi cần
    const highlightedElements = document.querySelectorAll('.search-highlight, .search-highlight-active');
    highlightedElements.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        // Replace the highlighted span with its text content
        parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        // Normalize to merge adjacent text nodes
        parent.normalize();
      }
    });
  };

  // Đăng ký phím tắt toàn cục Ctrl+K để mở dialog tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Phím tắt Ctrl+K hoặc Cmd+K (trên macOS)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <SearchContext.Provider value={{ isSearchOpen, openSearch, closeSearch, toggleSearch, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 