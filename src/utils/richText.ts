import DOMPurify from "dompurify";

// Nội dung có phải HTML do khung soạn thảo tạo ra không (khác với chữ thuần khách gõ trước đây)
export function looksLikeHtml(text: string): boolean {
  return /<\/?(p|div|span|strong|em|u|b|i|br|ul|ol|li|a)(\s[^>]*)?>/i.test(text);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Đưa nội dung vào khung soạn thảo: chữ thuần (cũ) -> mỗi dòng một đoạn; HTML -> giữ nguyên
export function toEditorHtml(text: string): string {
  if (!text) return "";
  if (looksLikeHtml(text)) return text;
  return text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line.trim())}</p>`)
    .join("");
}

// Nội dung rỗng (kể cả "<p></p>") thì coi như không có gì
export function isEmptyRich(text: string): boolean {
  if (!text) return true;
  const stripped = text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return stripped === "";
}

const URL_RE = /((?:https?:\/\/|www\.)[^\s<]+)/g;

// Lọc HTML cho an toàn, biến link trơn thành link bấm được, mọi link mở tab mới
export function sanitizeRich(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "span", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["style", "href", "target", "rel"],
  });

  const doc = new DOMParser().parseFromString(`<div id="root">${clean}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) return clean;

  // Biến link trơn trong chữ thành thẻ <a> (bỏ qua chữ đã nằm trong <a>)
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  for (const node of textNodes) {
    if (node.parentElement?.closest("a")) continue;
    const value = node.nodeValue ?? "";
    if (!URL_RE.test(value)) {
      URL_RE.lastIndex = 0;
      continue;
    }
    URL_RE.lastIndex = 0;
    const frag = doc.createDocumentFragment();
    value.split(URL_RE).forEach((part, i) => {
      if (i % 2 === 0) {
        if (part) frag.appendChild(doc.createTextNode(part));
        return;
      }
      const m = part.match(/^(.*?)([.,;:!?)\]]*)$/);
      const url = m ? m[1] : part;
      const tail = m ? m[2] : "";
      const a = doc.createElement("a");
      a.setAttribute("href", url.startsWith("www.") ? `https://${url}` : url);
      a.textContent = url;
      frag.appendChild(a);
      if (tail) frag.appendChild(doc.createTextNode(tail));
    });
    node.parentNode?.replaceChild(frag, node);
  }

  root.querySelectorAll("a").forEach((a) => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });

  return root.innerHTML;
}