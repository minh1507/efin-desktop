import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as jsondiffpatch from "jsondiffpatch";

export default function JsonComparator() {
  const [json1, setJson1] = useState("");
  const [json2, setJson2] = useState("");
  const [highlightedJson1, setHighlightedJson1] = useState("");
  const [highlightedJson2, setHighlightedJson2] = useState("");
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    compareJson();
  }, [json1, json2]);

  const compareJson = () => {
    try {
      const parsed1 = JSON.parse(json1);
      const parsed2 = JSON.parse(json2);
      const delta = jsondiffpatch.diff(parsed1, parsed2);

      if (!delta) {
        setHighlightedJson1(JSON.stringify(parsed1, null, 2));
        setHighlightedJson2(JSON.stringify(parsed2, null, 2));
      } else {
        setHighlightedJson1(highlightDifferences(parsed1, delta, "json1"));
        setHighlightedJson2(highlightDifferences(parsed2, delta, "json2"));
      }
      setError(null);
    } catch (err) {
      setError("Sai định dạng JSON");
      setHighlightedJson1("");
      setHighlightedJson2("");
    }
  };

  const highlightDifferences = (original: any, delta: any, jsonType: "json1" | "json2"): string => {
    const originalCopy = JSON.parse(JSON.stringify(original)); // Deep copy tránh thay đổi dữ liệu gốc
    jsondiffpatch.unpatch(originalCopy, delta); // Loại bỏ sự khác biệt để so sánh

    const originalStr = JSON.stringify(original, null, 2).split("\n");
    const modifiedStr = JSON.stringify(originalCopy, null, 2).split("\n");

    return originalStr
      .map((line, index) => {
        if (line !== modifiedStr[index]) {
          // Nếu là JSON1 và prop bị xóa → tô đỏ
          if (jsonType === "json1" && !modifiedStr.includes(line)) {
            return `<span class="text-red-400">${line}</span>`;
          }
          // Nếu là JSON2 và prop bị thêm mới → tô đỏ
          if (jsonType === "json2" && !originalStr.includes(line)) {
            return `<span class="text-green-400">${line}</span>`;
          }
        }
        return line;
      })
      .join("\n");
  };

  return (
    <div className="flex gap-6 p-6 bg-neutral-900 min-h-screen items-start justify-center text-gray-200 w-full">
      <div className="flex w-full max-w-full gap-6 px-6">
        <Card className="w-1/2 shadow-lg border border-neutral-700 bg-neutral-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">JSON 1</CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              contentEditable
              className="p-3 border rounded-md bg-neutral-700 text-gray-200 focus:ring focus:ring-gray-500 overflow-hidden min-h-[200px] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightedJson1 }}
              onBlur={(e) => setJson1(e.currentTarget.innerText)}
            />
          </CardContent>
        </Card>

        <Card className="w-1/2 shadow-lg border border-neutral-700 bg-neutral-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">JSON 2</CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              contentEditable
              className="p-3 border rounded-md bg-neutral-700 text-gray-200 focus:ring focus:ring-gray-500 overflow-hidden min-h-[200px] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightedJson2 }}
              onBlur={(e) => setJson2(e.currentTarget.innerText)}
            />
          </CardContent>
        </Card>
      </div>

      {error && <p className="text-red-400 font-medium">{error}</p>}
    </div>
  );
}
