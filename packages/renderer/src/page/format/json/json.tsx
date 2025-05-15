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

export default function JsonFormatter() {
  // Track usage of the JSON formatter
  useFeatureTracking('json_formatter');
  const { t } = useLanguage();

  const [input, setInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState<null | string>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  
  const { isSearchOpen, openSearch, closeSearch } = useSearch();

  // Hàm định dạng JSON với syntax highlighting
  const syntaxHighlight = useCallback((json: string) => {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?=\s*:))|("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([{}[\],:])/g,
      (match, key, _, string, __, booleanNull, number, symbol) => {
        if (key) return `<span class='text-lime-300'>${match}</span>`;
        if (string) return `<span class='text-blue-300'>${match}</span>`;
        if (booleanNull) return `<span class='text-purple-300'>${match}</span>`;
        if (number) return `<span class='text-orange-300'>${match}</span>`;
        if (symbol) return `<span class='text-red-300'>${match}</span>`;
        return match;
      }
    );
  }, []);

  // Cập nhật kích thước textarea khi input thay đổi
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Cập nhật kích thước pre element khi formatted json thay đổi
  useEffect(() => {
    if (preRef.current) {
      preRef.current.style.height = "auto";
      preRef.current.style.height = `${preRef.current.scrollHeight}px`;
    }
  }, [formattedJson]);

  // Định dạng JSON
  const formatJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setFormattedJson("");
        setError(null);
        return;
      }
      
      const parsed = JSON.parse(input);
      setFormattedJson(syntaxHighlight(JSON.stringify(parsed, null, 2)));
      setError(null);
    } catch (err) {
      setError(t('json.invalid_format'));
      setFormattedJson("");
    }
  }, [input, syntaxHighlight, t]);

  // Format JSON khi input thay đổi
  useEffect(() => {
    // Sử dụng debounce ở đây nếu cần
    const timeoutId = setTimeout(() => {
      formatJson();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [formatJson]);

  // Copy formatted JSON to clipboard
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (formattedJson) {
      // Tạo phiên bản plain text không có thẻ HTML
      const plainText = JSON.parse(input);
      navigator.clipboard.writeText(JSON.stringify(plainText, null, 2));
      toast.success(t('json.copied_to_clipboard'));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('json.original_json')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('json.enter_json_to_format')}
            className="min-h-[300px] font-mono resize-none"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('json.formatted_json')}</CardTitle>
          <Button 
            variant="outline" 
            size="icon"
            title={t('app.search') + " (Ctrl+K)"}
            onClick={openSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <pre
              ref={preRef}
              className="bg-muted p-4 rounded-md font-mono overflow-auto min-h-[300px]"
              dangerouslySetInnerHTML={{ __html: formattedJson }}
              onContextMenu={handleCopy}
            />
          )}
        </CardContent>
      </Card>

      <SearchDialog 
        open={isSearchOpen} 
        onOpenChange={closeSearch} 
        targetRef={preRef as React.RefObject<HTMLElement>}
        placeholder={t('json.search_in_formatted_json')}
      />
    </div>
  );
}
