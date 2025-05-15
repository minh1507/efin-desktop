import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SearchDialog } from "@/components/search-dialog";
import { useSearch } from "@/lib/context/search-context";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureTracking } from "@/hooks/useFeatureTracking";
import { useLanguage } from "@/components/language-provider";

export default function JsonCompare() {
  // Track usage of the JSON compare feature
  useFeatureTracking('json_compare');
  const { t } = useLanguage();

  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [comparisonResult, setComparisonResult] = useState<string>("");
  const [leftError, setLeftError] = useState<null | string>(null);
  const [rightError, setRightError] = useState<null | string>(null);
  const [missingInLeftKeys, setMissingInLeftKeys] = useState<string[]>([]);
  const [missingInRightKeys, setMissingInRightKeys] = useState<string[]>([]);
  
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null);
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  const { isSearchOpen, openSearch, closeSearch } = useSearch();

  // Cập nhật kích thước textarea khi input thay đổi
  useEffect(() => {
    if (leftTextareaRef.current) {
      leftTextareaRef.current.style.height = "auto";
      leftTextareaRef.current.style.height = `${leftTextareaRef.current.scrollHeight}px`;
    }
  }, [leftInput]);

  useEffect(() => {
    if (rightTextareaRef.current) {
      rightTextareaRef.current.style.height = "auto";
      rightTextareaRef.current.style.height = `${rightTextareaRef.current.scrollHeight}px`;
    }
  }, [rightInput]);

  // Đăng ký sự kiện click cho việc đóng/mở các phần tử
  useEffect(() => {
    const toggleSections = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('toggle-btn')) {
        const contentId = target.getAttribute('data-target');
        const contentElem = document.getElementById(contentId || '');
        if (contentElem) {
          contentElem.classList.toggle('hidden');
          // Đổi icon khi toggle
          const isExpanded = !contentElem.classList.contains('hidden');
          target.innerHTML = isExpanded ? '&#9660;' : '&#9658;';
          target.classList.toggle('expanded', isExpanded);
        }
      }
    };

    document.addEventListener('click', toggleSections);
    return () => {
      document.removeEventListener('click', toggleSections);
    };
  }, []);

  // Add event listener for copy key buttons
  useEffect(() => {
    const handleCopyKeyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find the closest .copy-key-btn element (could be the SVG or path inside it)
      const copyBtn = target.closest('.copy-key-btn');
      
      if (copyBtn) {
        const key = copyBtn.getAttribute('data-key') || '';
        const direction = copyBtn.getAttribute('data-direction') || '';
        
        if (key) {
          // Direction determines if we're copying from left to right or right to left
          const isLeftToRight = direction === 'left-to-right';
          
          console.log('Copy button clicked:', { 
            key,
            direction,
            isLeftToRight,
            elementClasses: copyBtn.classList.toString()
          });
          
          copyKeyValue(key, isLeftToRight);
        }
      }
    };
    
    document.addEventListener('click', handleCopyKeyClick);
    return () => {
      document.removeEventListener('click', handleCopyKeyClick);
    };
  }, [leftInput, rightInput]); // Depend on inputs to ensure we're using the latest JSON data

  // Hàm đệ quy để thu thập các key bị thiếu
  const collectMissingKeys = (left: any, right: any, path: string = "", missingInLeft: string[] = [], missingInRight: string[] = []) => {
    // Trường hợp cơ bản: cả hai đều không phải là object hoặc một trong hai là null
    if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) {
      return;
    }

    // Trường hợp cả hai là array
    if (Array.isArray(left) && Array.isArray(right)) {
      // Duyệt qua các phần tử chung
      const minLength = Math.min(left.length, right.length);
      for (let i = 0; i < minLength; i++) {
        collectMissingKeys(left[i], right[i], `${path}[${i}]`, missingInLeft, missingInRight);
      }
      return;
    }

    // Trường hợp cả hai là object (không phải array)
    if (!Array.isArray(left) && !Array.isArray(right)) {
      const leftKeys = Object.keys(left);
      const rightKeys = Object.keys(right);

      // Tìm key chỉ có ở bên phải
      rightKeys.forEach(key => {
        if (!(key in left)) {
          missingInLeft.push(path ? `${path}.${key}` : key);
        } else {
          // Nếu key tồn tại ở cả hai bên, kiểm tra đệ quy
          collectMissingKeys(left[key], right[key], path ? `${path}.${key}` : key, missingInLeft, missingInRight);
        }
      });

      // Tìm key chỉ có ở bên trái
      leftKeys.forEach(key => {
        if (!(key in right)) {
          missingInRight.push(path ? `${path}.${key}` : key);
        }
        // collectMissingKeys ở nhánh này đã được gọi trong vòng lặp trước
      });
    }
  };

  // So sánh hai đối tượng JSON và trả về HTML được highlight
  const compareJson = useCallback(() => {
    try {
      // Kiểm tra input trống
      if (!leftInput.trim() || !rightInput.trim()) {
        setComparisonResult("");
        setMissingInLeftKeys([]);
        setMissingInRightKeys([]);
        return;
      }

      // Parse JSON
      let leftObj;
      let rightObj;
      
      try {
        leftObj = JSON.parse(leftInput);
        setLeftError(null);
      } catch (err: unknown) {
        setLeftError(t('json_compare.invalid_left_json'));
        return;
      }
      
      try {
        rightObj = JSON.parse(rightInput);
        setRightError(null);
      } catch (err: unknown) {
        setRightError(t('json_compare.invalid_right_json'));
        return;
      }

      // Tạo ID duy nhất cho các phần tử có thể đóng/mở
      let sectionIdCounter = 0;
      const getNextSectionId = () => `section-${sectionIdCounter++}`;

      // Thu thập các key bị thiếu
      const missingInLeft: string[] = [];
      const missingInRight: string[] = [];
      collectMissingKeys(leftObj, rightObj, "", missingInLeft, missingInRight);
      
      console.log('Missing keys analysis:', {
        missingInLeft,
        missingInRight,
        leftObj,
        rightObj
      });
      
      setMissingInLeftKeys(missingInLeft);
      setMissingInRightKeys(missingInRight);

      // Tạo HTML so sánh
      const resultHtml = compareObjects(leftObj, rightObj, "", getNextSectionId);
      setComparisonResult(resultHtml);
    } catch (err: unknown) {
      console.error(t('json_compare.comparison_error'), err);
      const errorMessage = err instanceof Error ? err.message : t('json_compare.unknown_error');
      setComparisonResult(`<span class="text-red-500">${t('json_compare.error_during_comparison')}: ${errorMessage}</span>`);
      setMissingInLeftKeys([]);
      setMissingInRightKeys([]);
    }
  }, [leftInput, rightInput, t]);

  // Thực hiện so sánh khi input thay đổi (với debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      compareJson();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [compareJson]);

  // Hàm đệ quy để so sánh và highlight sự khác biệt giữa 2 đối tượng
  const compareObjects = (left: any, right: any, path: string = "", getNextId: () => string): string => {
    // Xử lý các kiểu dữ liệu khác nhau
    if (typeof left !== typeof right) {
      return `<div class="bg-red-500/10 p-1 rounded mb-1">
                <span class="text-red-400 font-medium">Khác kiểu dữ liệu:</span> 
                <span class="text-orange-300">${typeof left}</span> vs 
                <span class="text-blue-300">${typeof right}</span>
              </div>
              <div class="ml-4">
                <div><span class="text-purple-400">Trái:</span> <span class="text-orange-300">${JSON.stringify(left)}</span></div>
                <div><span class="text-purple-400">Phải:</span> <span class="text-blue-300">${JSON.stringify(right)}</span></div>
              </div>`;
    }

    // So sánh giá trị primitive
    if (typeof left !== 'object' || left === null || right === null) {
      if (left === right) {
        return `<div class="bg-green-500/10 p-1 rounded">
                  <span class="text-green-400 font-medium">Giống nhau:</span> 
                  <span class="text-green-300">${JSON.stringify(left)}</span>
                </div>`;
      } else {
        return `<div class="bg-red-500/10 p-1 rounded mb-1">
                  <span class="text-red-400 font-medium">Khác giá trị:</span>
                </div>
                <div class="ml-4">
                  <div><span class="text-purple-400">Trái:</span> <span class="text-orange-300">${JSON.stringify(left)}</span></div>
                  <div><span class="text-purple-400">Phải:</span> <span class="text-blue-300">${JSON.stringify(right)}</span></div>
                </div>`;
      }
    }

    // So sánh mảng
    if (Array.isArray(left) && Array.isArray(right)) {
      const sectionId = getNextId();
      const contentId = `content-${sectionId}`;
      
      if (left.length !== right.length) {
        return `<div class="bg-red-500/10 p-1 rounded mb-1 flex items-center">
                  <button class="toggle-btn mr-2 w-5 h-5 flex items-center justify-center text-xs text-white bg-slate-500/50 rounded" data-target="${contentId}">&#9660;</button>
                  <span class="text-red-400 font-medium">Khác độ dài mảng:</span> 
                  <span class="text-orange-300 mx-1">${left.length}</span> vs 
                  <span class="text-blue-300 mx-1">${right.length}</span>
                </div>
                <div id="${contentId}" class="ml-4">
                  ${left.map((item, i) => {
                    if (i < right.length) {
                      const itemSectionId = getNextId();
                      const itemContentId = `content-${itemSectionId}`;
                      return `<div class="mb-2 border-l-2 border-gray-500 pl-2">
                                <div class="flex items-center">
                                  <button class="toggle-btn mr-2 w-5 h-5 flex items-center justify-center text-xs text-white bg-slate-500/50 rounded" data-target="${itemContentId}">&#9660;</button>
                                  <span class="text-teal-400 font-medium">Phần tử ${i}:</span>
                                </div>
                                <div id="${itemContentId}" class="mt-1">${compareObjects(item, right[i], `${path}[${i}]`, getNextId)}</div>
                              </div>`;
                    }
                    return `<div class="mb-2 border-l-2 border-orange-500 pl-2">
                              <div class="text-orange-400 font-medium">Phần tử ${i} (chỉ có bên trái):</div>
                              <div class="ml-2 text-orange-300">${JSON.stringify(item, null, 2)}</div>
                            </div>`;
                  }).join('') + 
                  right.slice(left.length).map((item, i) => {
                    return `<div class="mb-2 border-l-2 border-blue-500 pl-2">
                              <div class="text-blue-400 font-medium">Phần tử ${left.length + i} (chỉ có bên phải):</div>
                              <div class="ml-2 text-blue-300">${JSON.stringify(item, null, 2)}</div>
                            </div>`;
                  }).join('')}
                </div>`;
      } else {
        return `<div class="bg-gray-500/10 p-1 rounded mb-1 flex items-center">
                  <button class="toggle-btn mr-2 w-5 h-5 flex items-center justify-center text-xs text-white bg-slate-500/50 rounded" data-target="${contentId}">&#9660;</button>
                  <span class="text-teal-400 font-medium">Mảng (${left.length} phần tử)</span>
                </div>
                <div id="${contentId}" class="ml-4">
                  ${left.map((item, i) => {
                    const itemSectionId = getNextId();
                    const itemContentId = `content-${itemSectionId}`;
                    return `<div class="mb-2 border-l-2 border-gray-500 pl-2">
                              <div class="flex items-center">
                                <button class="toggle-btn mr-2 w-5 h-5 flex items-center justify-center text-xs text-white bg-slate-500/50 rounded" data-target="${itemContentId}">&#9660;</button>
                                <span class="text-teal-400 font-medium">Phần tử ${i}:</span>
                              </div>
                              <div id="${itemContentId}" class="mt-1">${compareObjects(item, right[i], `${path}[${i}]`, getNextId)}</div>
                            </div>`;
                  }).join('')}
                </div>`;
      }
    }

    // So sánh object
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    const allKeys = Array.from(new Set([...leftKeys, ...rightKeys])).sort();

    const sectionId = getNextId();
    const contentId = `content-${sectionId}`;

    // So sánh thuộc tính
    return `<div class="bg-gray-500/10 p-1 rounded mb-1 flex items-center">
              <button class="toggle-btn mr-2 w-5 h-5 flex items-center justify-center text-xs text-white bg-slate-500/50 rounded" data-target="${contentId}">&#9660;</button>
              <span class="text-teal-400 font-medium">Object (${allKeys.length} thuộc tính)</span>
            </div>
            <div id="${contentId}" class="ml-4">
              ${allKeys.map(key => {
                const leftHasKey = key in left;
                const rightHasKey = key in right;

                if (!leftHasKey) {
                  return `<div class="mb-2 border-l-2 border-blue-500 pl-2">
                            <div class="text-blue-400 font-medium">Thuộc tính <span class="text-yellow-300">"${key}"</span> (chỉ có bên phải):</div>
                            <div class="ml-2 text-blue-300">${JSON.stringify(right[key], null, 2)}</div>
                          </div>`;
                }

                if (!rightHasKey) {
                  return `<div class="mb-2 border-l-2 border-orange-500 pl-2">
                            <div class="text-orange-400 font-medium">Thuộc tính <span class="text-yellow-300">"${key}"</span> (chỉ có bên trái):</div>
                            <div class="ml-2 text-orange-300">${JSON.stringify(left[key], null, 2)}</div>
                          </div>`;
                }

                if (typeof left[key] === 'object' && left[key] !== null && typeof right[key] === 'object' && right[key] !== null) {
                  const propSectionId = getNextId();
                  const propContentId = `content-${propSectionId}`;
                  return `<div class="mb-2 border-l-2 border-gray-500 pl-2">
                            <div class="flex items-center">
                              <button class="toggle-btn mr-2 w-5 h-5 flex items-center justify-center text-xs text-white bg-slate-500/50 rounded" data-target="${propContentId}">&#9660;</button>
                              <span class="text-teal-400 font-medium">Thuộc tính <span class="text-yellow-300">"${key}"</span>:</span>
                            </div>
                            <div id="${propContentId}" class="mt-1">${compareObjects(left[key], right[key], path ? `${path}.${key}` : key, getNextId)}</div>
                          </div>`;
                } else {
                  return `<div class="mb-2 border-l-2 border-gray-500 pl-2">
                            <div class="text-teal-400 font-medium">Thuộc tính <span class="text-yellow-300">"${key}"</span>:</div>
                            <div class="ml-2">${compareObjects(left[key], right[key], path ? `${path}.${key}` : key, getNextId)}</div>
                          </div>`;
                }
              }).join('')}
            </div>`;
  };

  // Copy kết quả so sánh vào clipboard
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (comparisonResult) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = comparisonResult;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      navigator.clipboard.writeText(plainText);
      toast.success(t('json_compare.copied_to_clipboard'));
    }
  };

  // Đóng tất cả các mục
  const handleCollapseAll = () => {
    if (resultRef.current) {
      const toggleButtons = resultRef.current.querySelectorAll('.toggle-btn');
      toggleButtons.forEach(button => {
        const contentId = button.getAttribute('data-target');
        const contentElem = document.getElementById(contentId || '');
        if (contentElem && !contentElem.classList.contains('hidden')) {
          contentElem.classList.add('hidden');
          button.innerHTML = '&#9658;';
          button.classList.remove('expanded');
        }
      });
    }
  };

  // Mở tất cả các mục
  const handleExpandAll = () => {
    if (resultRef.current) {
      const toggleButtons = resultRef.current.querySelectorAll('.toggle-btn');
      toggleButtons.forEach(button => {
        const contentId = button.getAttribute('data-target');
        const contentElem = document.getElementById(contentId || '');
        if (contentElem && contentElem.classList.contains('hidden')) {
          contentElem.classList.remove('hidden');
          button.innerHTML = '&#9660;';
          button.classList.add('expanded');
        }
      });
    }
  };

  // Tạo chuỗi HTML từ mảng các key
  const renderKeyList = (keys: string[], isLeftMissing: boolean) => {
    if (keys.length === 0) return "<div class='text-gray-400'>Không có key bị thiếu</div>";
    
    return keys.map(key => {
      // For keys missing on the left (isLeftMissing=true), show a copy button to copy from right
      // For keys missing on the right (isLeftMissing=false), show a copy button to copy from left
      const copyDirection = isLeftMissing ? 'right-to-left' : 'left-to-right';
      const copyTitle = isLeftMissing 
        ? 'Copy from right to left (missing on left)' 
        : 'Copy from left to right (missing on right)';
        
      return `<div class="mb-1 px-2 py-1 bg-gray-500/10 rounded flex items-center justify-between group">
        <span class="text-yellow-300">${key}</span>
        <span class="copy-key-btn opacity-0 group-hover:opacity-100 cursor-pointer" 
              data-key="${key}" 
              data-direction="${copyDirection}"
              title="${copyTitle}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy text-blue-400 hover:text-blue-300">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
          </svg>
        </span>
      </div>`;
    }).join('');
  };

  // Helper function to get nested value by path
  const getValueByPath = (obj: any, path: string) => {
    // First, check if the exact key exists in the object (for keys with dots)
    if (path in obj) {
      return obj[path];
    }
    
    // If not a direct key, treat as a nested path
    // Handle array indexing in paths like "items[0].name" or "items.0.name"
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    const parts = normalizedPath.split('.');
    
    let current = obj;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '') continue; // Skip empty parts from leading/double dots
      
      if (current === undefined || current === null) {
        return undefined;
      }
      
      // Convert to number if it's a digit (array index)
      const index = !isNaN(Number(part)) ? Number(part) : part;
      current = current[index];
    }
    
    return current;
  };

  // Improved copy function with better key handling
  const copyKeyValue = (key: string, isLeftToRight: boolean) => {
    try {
      const leftObj = JSON.parse(leftInput);
      const rightObj = JSON.parse(rightInput);
      
      console.log('Copy request:', { key, isLeftToRight });
      
      // The key name for output could be the entire key if it's a direct property with dots
      // or just the last part of a nested path
      let keyName = key;
      
      // If it looks like a nested path (has dots and those parts represent actual nesting),
      // extract just the last part
      if (key.includes('.')) {
        // Check if it's a direct property first
        const sourceObj = isLeftToRight ? leftObj : rightObj;
        const isDirect = key in sourceObj;
        
        if (!isDirect) {
          // It's likely a nested path, so extract the last part
          keyName = key.split('.').pop()?.replace(/\[\d+\]/g, '') || key;
        }
      }
      
      console.log('Using key name for output:', keyName);
      
      // If there are nested paths with array indices, handle them properly
      let value;
      
      // If missing on right, copy from left; if missing on left, copy from right
      if (isLeftToRight) {
        console.log('Looking up value in leftObj');
        value = getValueByPath(leftObj, key);
      } else {
        console.log('Looking up value in rightObj');
        value = getValueByPath(rightObj, key);
      }
      
      console.log('Found value:', value);
      
      if (value === undefined) {
        toast.error('Không tìm thấy giá trị cho key này');
        return;
      }
      
      // Format the value for copying
      let formatted;
      if (typeof value === 'object' && value !== null) {
        formatted = JSON.stringify(value, null, 2);
      } else {
        formatted = JSON.stringify(value);
      }
      
      const result = `"${keyName}": ${formatted}`;
      console.log('Formatted result:', result);
      
      navigator.clipboard.writeText(result);
      toast.success('Đã sao chép vào clipboard');
    } catch (err) {
      console.error('Copy error:', err);
      toast.error('Lỗi khi sao chép: ' + (err as Error).message);
    }
  };

  // Copy all missing keys at once in JSON format
  const copyAllMissingKeys = (isLeftMissing: boolean) => {
    try {
      const leftObj = JSON.parse(leftInput);
      const rightObj = JSON.parse(rightInput);
      
      // Get the list of keys to copy
      const keysToCopy = isLeftMissing ? missingInLeftKeys : missingInRightKeys;
      
      if (keysToCopy.length === 0) {
        toast.info('Không có key nào để sao chép');
        return;
      }
      
      // The source object depends on which keys we're copying
      // If keys missing on left, copy from right; if keys missing on right, copy from left
      const sourceObj = isLeftMissing ? rightObj : leftObj;
      
      // Build a JSON object with all the missing keys and their values
      const result: Record<string, any> = {};
      
      for (const key of keysToCopy) {
        // Get value from source object
        const value = getValueByPath(sourceObj, key);
        
        if (value !== undefined) {
          // Extract key name - for direct properties with dots, use the whole key
          // For nested paths, just use the last part
          let keyName = key;
          if (!(key in sourceObj) && key.includes('.')) {
            keyName = key.split('.').pop() || key;
          }
          
          // Add to result
          result[keyName] = value;
        }
      }
      
      // Format the JSON string nicely
      const jsonString = JSON.stringify(result, null, 2);
      
      console.log('Copying all keys:', jsonString);
      
      navigator.clipboard.writeText(jsonString);
      toast.success(`Đã sao chép ${Object.keys(result).length} key vào clipboard`);
    } catch (err) {
      console.error('Copy all error:', err);
      toast.error('Lỗi khi sao chép: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('json_compare.left_json')}</CardTitle>
          </CardHeader>
          <CardContent>
            {leftError && <div className="text-red-500 mb-2">{leftError}</div>}
            <Textarea
              ref={leftTextareaRef}
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder={t('json_compare.enter_left_json')}
              className="min-h-[300px] font-mono resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('json_compare.right_json')}</CardTitle>
          </CardHeader>
          <CardContent>
            {rightError && <div className="text-red-500 mb-2">{rightError}</div>}
            <Textarea
              ref={rightTextareaRef}
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder={t('json_compare.enter_right_json')}
              className="min-h-[300px] font-mono resize-none"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Kết quả so sánh</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={handleExpandAll}
              className="px-2 py-1 bg-slate-500/20 hover:bg-slate-500/30 rounded-md text-xs"
            >
              Mở tất cả
            </Button>
            <Button 
              onClick={handleCollapseAll}
              className="px-2 py-1 bg-slate-500/20 hover:bg-slate-500/30 rounded-md text-xs"
            >
              Đóng tất cả
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              title="Tìm kiếm (Ctrl+K)"
              onClick={openSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={resultRef}
            className="bg-muted p-4 rounded-md font-mono overflow-auto min-h-[300px] text-sm"
            dangerouslySetInnerHTML={{ __html: comparisonResult }}
            onContextMenu={handleCopy}
          />
          <style dangerouslySetInnerHTML={{__html: `
            .toggle-btn {
              cursor: pointer;
              transition: transform 0.15s ease;
            }
            .toggle-btn:hover {
              background-color: rgba(100, 116, 139, 0.7);
            }
            .toggle-btn.expanded {
              transform: rotate(0deg);
            }
          `}} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Keys thiếu ở bên trái</CardTitle>
            {missingInLeftKeys.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-blue-500 border-blue-500"
                onClick={() => copyAllMissingKeys(true)}
                title="Sao chép tất cả thành JSON"
              >
                Copy tất cả
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-mono overflow-auto max-h-[300px] text-sm">
              {missingInLeftKeys.length > 0 ? (
                <div dangerouslySetInnerHTML={{ __html: renderKeyList(missingInLeftKeys, true) }} />
              ) : (
                <div className="text-gray-400">Không có key nào bị thiếu ở bên trái</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Keys thiếu ở bên phải</CardTitle>
            {missingInRightKeys.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-blue-500 border-blue-500"
                onClick={() => copyAllMissingKeys(false)}
                title="Sao chép tất cả thành JSON"
              >
                Copy tất cả
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-mono overflow-auto max-h-[300px] text-sm">
              {missingInRightKeys.length > 0 ? (
                <div dangerouslySetInnerHTML={{ __html: renderKeyList(missingInRightKeys, false) }} />
              ) : (
                <div className="text-gray-400">Không có key nào bị thiếu ở bên phải</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <SearchDialog 
        open={isSearchOpen} 
        onOpenChange={closeSearch} 
        targetRef={resultRef as React.RefObject<HTMLElement>}
        placeholder="Tìm trong kết quả so sánh..."
      />
    </div>
  );
} 