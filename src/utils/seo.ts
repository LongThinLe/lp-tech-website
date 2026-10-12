// Đặt tiêu đề, mô tả và từ khóa SEO cho trang đang xem.
// Trả về hàm "hoàn lại" — gọi khi rời trang để trả tiêu đề/mô tả về như cũ.

export interface SeoInput {
  title?: string;
  description?: string;
  keywords?: string | string[]; // chuỗi cách nhau bằng dấu ; hoặc xuống dòng, hoặc mảng
}

export function splitKeywords(input?: string | string[]): string[] {
  if (!input) return [];
  const list = Array.isArray(input) ? input : input.split(/[;\n]/);
  return list.map((k) => k.trim()).filter(Boolean);
}

function setMeta(name: string, content: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  const created = !el;
  const old = el?.getAttribute("content") ?? null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return () => {
    if (!el) return;
    if (created) el.remove();
    else if (old !== null) el.setAttribute("content", old);
  };
}

export function applySeo({ title, description, keywords }: SeoInput): () => void {
  const undo: Array<() => void> = [];

  if (title) {
    const prev = document.title;
    document.title = title;
    undo.push(() => {
      document.title = prev;
    });
  }
  if (description) undo.push(setMeta("description", description));

  const kw = splitKeywords(keywords);
  if (kw.length) undo.push(setMeta("keywords", kw.join(", ")));

  return () => undo.reverse().forEach((fn) => fn());
}