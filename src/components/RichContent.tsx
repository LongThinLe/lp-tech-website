import type { ReactNode } from "react";
import { looksLikeHtml, sanitizeRich } from "../utils/richText";

// Biến link (http://, https://, www.) trong một dòng chữ thuần thành link bấm được
function linkify(text: string): ReactNode[] {
  const parts = text.split(/((?:https?:\/\/|www\.)[^\s]+)/g);
  return parts.map((part, i) => {
    if (i % 2 === 0) return part;
    const m = part.match(/^(.*?)([.,;:!?)\]]*)$/);
    const url = m ? m[1] : part;
    const tail = m ? m[2] : "";
    const href = url.startsWith("www.") ? `https://${url}` : url;
    return (
      <span key={i}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2F8F76", textDecoration: "underline", wordBreak: "break-all" }}
        >
          {url}
        </a>
        {tail}
      </span>
    );
  });
}

// Chữ thuần (nội dung cũ):
//  - dòng thường: chữ trơn, không dấu
//  - dòng bắt đầu bằng "-": ý phụ, thụt vào, giữ gạch ngang
//  - dòng bắt đầu bằng "•" hoặc "*": giữ một dấu "•"
function PlainLines({ lines }: { lines: string[] }) {
  return (
    <div style={{ lineHeight: 1.6 }}>
      {lines.map((raw, i) => {
        const line = raw.trim();
        if (!line) return <div key={i} style={{ height: ".6rem" }} />;

        if (/^[-–—]\s*/.test(line)) {
          const rest = line.replace(/^[-–—]\s*/, "");
          return (
            <div key={i} style={{ paddingLeft: "1.1rem", textIndent: "-0.8rem" }}>
              – {linkify(rest)}
            </div>
          );
        }

        if (/^[•*]\s*/.test(line)) {
          const rest = line.replace(/^[•*]\s*/, "");
          return (
            <div key={i} style={{ paddingLeft: "1rem", textIndent: "-0.8rem" }}>
              • {linkify(rest)}
            </div>
          );
        }

        return <div key={i}>{linkify(line)}</div>;
      })}
    </div>
  );
}

// Hiển thị nội dung do admin nhập: HTML từ khung soạn thảo (đã lọc an toàn) hoặc chữ thuần cũ.
// "lines" dùng cho dữ liệu cũ dạng mảng dòng (Thông số kỹ thuật).
export default function RichContent({ text, lines }: { text?: string; lines?: string[] }) {
  const source = text ?? (lines && lines.length === 1 ? lines[0] : undefined);

  if (source !== undefined && looksLikeHtml(source)) {
    return (
      <>
        <style>{`
          .rich-content p { margin: 0 0 .5rem; }
          .rich-content p:last-child { margin-bottom: 0; }
          .rich-content ul, .rich-content ol { padding-left: 1.3rem; margin: 0 0 .5rem; }
          .rich-content a { color: #2F8F76; text-decoration: underline; word-break: break-all; }
        `}</style>
        <div
          className="rich-content"
          style={{ lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: sanitizeRich(source) }}
        />
      </>
    );
  }

  const list = lines ?? (text ?? "").split("\n");
  return <PlainLines lines={list} />;
}