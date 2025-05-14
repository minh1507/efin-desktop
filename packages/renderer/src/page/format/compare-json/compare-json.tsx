import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SearchDialog } from "@/components/search-dialog";
import { useSearch } from "@/lib/context/search-context";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JsonCompare() {
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
        setLeftError("Sai định dạng JSON bên trái");
        return;
      }
      
      try {
        rightObj = JSON.parse(rightInput);
        setRightError(null);
      } catch (err: unknown) {
        setRightError("Sai định dạng JSON bên phải");
        return;
      }

      // Tạo ID duy nhất cho các phần tử có thể đóng/mở
      let sectionIdCounter = 0;
      const getNextSectionId = () => `section-${sectionIdCounter++}`;

      // Thu thập các key bị thiếu
      const missingInLeft: string[] = [];
      const missingInRight: string[] = [];
      collectMissingKeys(leftObj, rightObj, "", missingInLeft, missingInRight);
      setMissingInLeftKeys(missingInLeft);
      setMissingInRightKeys(missingInRight);

      // Tạo HTML so sánh
      const resultHtml = compareObjects(leftObj, rightObj, "", getNextSectionId);
      setComparisonResult(resultHtml);
    } catch (err: unknown) {
      console.error("Lỗi khi so sánh:", err);
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setComparisonResult(`<span class="text-red-500">Lỗi khi so sánh: ${errorMessage}</span>`);
      setMissingInLeftKeys([]);
      setMissingInRightKeys([]);
    }
  }, [leftInput, rightInput]);

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
      // Tạo phiên bản plain text không có thẻ HTML
      const plainText = `Bên trái: ${leftInput}\nBên phải: ${rightInput}`;
      navigator.clipboard.writeText(plainText);
      toast.success('Đã sao chép vào clipboard');
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
  const renderKeyList = (keys: string[]) => {
    if (keys.length === 0) return "<div class='text-gray-400'>Không có key bị thiếu</div>";
    
    return keys.map(key => 
      `<div class="mb-1 px-2 py-1 bg-gray-500/10 rounded">
        <span class="text-yellow-300">${key}</span>
      </div>`
    ).join('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>JSON bên trái</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={leftTextareaRef}
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Nhập JSON thứ nhất..."
              className="min-h-[200px] font-mono resize-none"
            />
            {leftError && <div className="mt-2 text-red-500">{leftError}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JSON bên phải</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={rightTextareaRef}
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Nhập JSON thứ hai..."
              className="min-h-[200px] font-mono resize-none"
            />
            {rightError && <div className="mt-2 text-red-500">{rightError}</div>}
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
          <CardHeader>
            <CardTitle>Keys thiếu ở bên trái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-mono overflow-auto max-h-[300px] text-sm">
              {missingInLeftKeys.length > 0 ? (
                <div dangerouslySetInnerHTML={{ __html: renderKeyList(missingInLeftKeys) }} />
              ) : (
                <div className="text-gray-400">Không có key nào bị thiếu ở bên trái</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keys thiếu ở bên phải</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md font-mono overflow-auto max-h-[300px] text-sm">
              {missingInRightKeys.length > 0 ? (
                <div dangerouslySetInnerHTML={{ __html: renderKeyList(missingInRightKeys) }} />
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