import { Editor } from "@tiptap/react";
import { EditorState } from "@tiptap/pm/state";

const getHighlightedRanges = (editor: Editor, state?: EditorState) => {
  const doc = (state || editor.state).doc;
  const ranges: Array<{
    from: number;
    to: number;
    text: string;
    index: number;
  }> = [];

  doc.descendants((node: any, pos: number) => {
    if (!node.isText) return;

    const mark = node.marks.find(
      (m: any) => m.type.name === "highlight" && m.attrs?.dataIndex != null
    );
    if (!mark) return;

    // Bỏ qua mark chỉ chứa khoảng trắng
    if (node.text.trim() === "") return;

    const index = Number(mark.attrs.dataIndex);
    if (Number.isNaN(index)) return;

    ranges.push({
      from: pos,
      to: pos + node.nodeSize - 2,
      text: node.text,
      index,
    });
  });

  return ranges;
};

/* =========================
   5. Editor → Template
   ========================= */
export const editorToTemplate = (editor: Editor) => {
  const text = editor.state.doc.textContent;
  const ranges = getHighlightedRanges(editor);

  if (!ranges.length) return text;

  const sorted = [...ranges].sort((a, b) => a.from - b.from);

  let result = "";
  let last = 0;

  sorted.forEach((r) => {
    if (r.from > last) {
      result += text.slice(last, r.from);
    }
    result += `{${r.index}}`;
    last = r.to;
  });

  if (last < text.length) {
    result += text.slice(last);
  }

  return result;
};

export /* =========================
7. Helper function to build content from template
========================= */
const buildContentFromTemplate = (
  _editor: Editor,
  template: string,
  opts: string[]
) => {
  const regex = /\{(\d+)\}/g;
  let last = 0;
  const content: any[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const index = Number(match[1]);

    if (match.index > last) {
      content.push({
        type: "text",
        text: template.slice(last, match.index),
      });
    }

    const optionText = opts[index] ?? `{${index}}`;

    if (optionText.trim() === "") {
      content.push({
        type: "text",
        text: optionText,
      });
    } else {
      content.push({
        type: "text",
        text: optionText,
        marks: [
          {
            type: "highlight",
            attrs: {
              dataIndex: index.toString(),
              uniqueId: crypto.randomUUID(),
            },
          },
        ],
      });
    }

    last = match.index + match[0].length;
  }

  if (last < template.length) {
    content.push({
      type: "text",
      text: template.slice(last),
    });
  }

  return content;
};

export function parseHtmlMarkToTemplate(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;

  const options: string[] = [];
  let index = 0;

  const walk = (node: ChildNode): string => {
    // Text node
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    // Mark node
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as HTMLElement).tagName === "MARK"
    ) {
      const text = node.textContent || "";

      // Nếu mark chỉ chứa khoảng trắng (trim() === ''), bỏ qua mark và chỉ trả về text
      // Điều này xử lý trường hợp <mark> </mark> hoặc <mark>   </mark>
      if (text.trim() === "") {
        return text;
      }

      // Trim text trước khi push vào options để tránh khoảng trắng thừa
      const trimmedText = text.trim();
      const currentIndex = index++;
      options.push(trimmedText);

      // Nếu text có khoảng trắng ở đầu hoặc cuối, cần giữ lại trong template
      const leadingSpaces = text.match(/^\s*/)?.[0] || "";
      const trailingSpaces = text.match(/\s*$/)?.[0] || "";

      return leadingSpaces + `{${currentIndex}}` + trailingSpaces;
    }

    // Element khác (p, span, ...)
    if (node.nodeType === Node.ELEMENT_NODE) {
      let result = "";
      node.childNodes.forEach((child) => {
        result += walk(child);
      });
      return result;
    }

    return "";
  };

  let template = "";
  container.childNodes.forEach((node) => {
    template += walk(node);
  });

  return {
    template,
    options,
  };
}
