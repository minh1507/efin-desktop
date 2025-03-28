import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ArrayFormatter() {
  const [input, setInput] = useState("");
  const [formattedArray, setFormattedArray] = useState("");
  const [error, setError] = useState<null | string>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.style.height = "auto";
      preRef.current.style.height = `${preRef.current.scrollHeight}px`;
    }
  }, [formattedArray]);

  const formatArray = () => {
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) throw new Error("Sai định dạng");

      // Format JSON đúng chuẩn
      const formatted = JSON.stringify(parsed, null, 2);

      setFormattedArray(syntaxHighlight(formatted));
      setError(null);
    } catch (err) {
      setError("Sai định dạng");
      setFormattedArray("");
    }
  };

  useEffect(() => {
    if (input.trim() === "") {
      setFormattedArray("");
      setError(null);
      return;
    }
    formatArray();
  }, [input]);

  const syntaxHighlight = (json: string) => {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?=\s*:))|("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([{}[\],:])/g,
      (match, key, _, string, __, booleanNull, number, symbol) => {
        if (key) return `<span class='text-lime-300'>${match}</span>`; // Key object
        if (string) return `<span class='text-blue-300'>${match}</span>`; // String
        if (booleanNull) return `<span class='text-purple-300'>${match}</span>`; // Boolean & Null
        if (number) return `<span class='text-orange-300'>${match}</span>`; // Number
        if (symbol) return `<span class='text-red-300'>${match}</span>`; // Symbols
        return match;
      }
    );
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (error || !input.trim()) return;
    navigator.clipboard.writeText(JSON.stringify(JSON.parse(input), null, 2));
    toast.success("Đã sao chép mảng!");
  };

  return (
    <div className="flex gap-6 p-6 bg-neutral-900 min-h-screen items-start justify-center text-gray-200 w-full">
      <div className="flex w-full max-w-full gap-6 px-6">
        <Card className="w-1/2 shadow-lg border border-neutral-700 bg-neutral-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">Đầu vào (Array)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <Textarea
              ref={textareaRef}
              placeholder='Nhập mảng JSON, ví dụ: ["apple", 42, true, { "name": "John" }, [1, 2, 3]]'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="p-3 border rounded-md bg-neutral-700 text-gray-200 focus:ring focus:ring-gray-500 resize-none overflow-hidden"
            />
          </CardContent>
        </Card>
        <Card className="w-1/2 shadow-lg border border-neutral-700 bg-neutral-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">Đầu ra</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            {error ? (
              <p className="text-red-400 font-medium">{error}</p>
            ) : (
              <pre
                ref={preRef}
                className="whitespace-pre-wrap break-words text-sm bg-neutral-700 p-3 rounded-md border border-neutral-600 text-gray-300 overflow-hidden resize-none cursor-pointer"
                dangerouslySetInnerHTML={{ __html: formattedArray }}
                onContextMenu={handleCopy}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
