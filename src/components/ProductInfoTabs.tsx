import { useState, useRef, useLayoutEffect } from "react";

interface TabSection {
  label: string;
  content: React.ReactNode;
}

const MAX_CONTENT_HEIGHT = 420; // chiều cao tối đa (px) — dài hơn sẽ tự cuộn bên trong

export default function ProductInfoTabs({ tabs }: { tabs: TabSection[] }) {
  const [active, setActive] = useState(0);
  const [height, setHeight] = useState<number>();
  const contentRef = useRef<HTMLDivElement>(null);

  // Mỗi khi đổi tab, đo chiều cao thật của nội dung MỚI (React đã tự thay xong),
  // rồi áp dụng vào khối cha để CSS transition chạy mượt — không cần "ẩn tạm rồi đo" như JS thuần
  useLayoutEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [active, tabs]);

  const displayHeight = height !== undefined ? Math.min(height, MAX_CONTENT_HEIGHT) : height;

  return (
    <div className="rounded-4 overflow-hidden mt-3" style={{ boxShadow: "0 4px 16px rgba(0,0,0,.06)" }}>
      <div className="d-flex gap-2 p-2" style={{ background: "#F1EFE8" }}>
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className="flex-fill border-0 text-center rounded-3"
            style={{
              padding: "10px",
              fontSize: ".82rem",
              fontWeight: 600,
              color: active === i ? "#fff" : "#5F5E5A",
              background: active === i ? "#2F8F76" : "transparent",
              boxShadow: active === i ? "0 2px 8px rgba(47,143,118,.3)" : "none",
              transition: "all .15s ease",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        style={{
          height: displayHeight,
          overflowY: "auto",
          transition: "height .3s ease",
          background: "#fff",
        }}
      >
        <div ref={contentRef} className="px-4 py-3" style={{ fontSize: ".85rem", color: "#5B6B76", lineHeight: 1.6, whiteSpace: "pre-line" }}>
          {tabs[active].content}
        </div>
      </div>
    </div>
  );
}