import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { FiBold, FiItalic, FiUnderline, FiXCircle } from "react-icons/fi";
import { toEditorHtml } from "../utils/richText";

const COLORS = [
  { name: "Mặc định", value: "" },
  { name: "Xanh lá đậm", value: "#22684F" },
  { name: "Đỏ", value: "#E1483D" },
  { name: "Cam", value: "#C9821E" },
  { name: "Xanh dương", value: "#2563EB" },
  { name: "Tím", value: "#7C3AED" },
  { name: "Xám", value: "#5B6B76" },
  { name: "Đen", value: "#000000" },
];

const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];

const FONTS = [
  { name: "Font mặc định", value: "" },
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
];

type Props = {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
};

export default function RichTextEditor({ value, onChange, minHeight = 120 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        link: { openOnClick: false, autolink: true },
      }),
      TextStyleKit.configure({ backgroundColor: false, lineHeight: false }),
    ],
    content: toEditorHtml(value),
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.isEmpty ? "" : ed.getHTML());
    },
  });

  if (!editor) return null;

  const btn = (active: boolean) => ({
    width: 32,
    height: 32,
    border: "1px solid " + (active ? "#2F8F76" : "#E1E9E3"),
    background: active ? "#E4F1EA" : "#fff",
    color: active ? "#22684F" : "#3D4A44",
    borderRadius: 8,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  } as const);

  const selectStyle = {
    height: 32,
    border: "1px solid #E1E9E3",
    borderRadius: 8,
    fontSize: ".78rem",
    background: "#fff",
    color: "#3D4A44",
    padding: "0 6px",
  } as const;

  const attrs = editor.getAttributes("textStyle");
  const currentColor: string = attrs.color ?? "";
  const currentSize: string = attrs.fontSize ?? "";
  const currentFont: string = attrs.fontFamily ?? "";

  return (
    <div style={{ border: "1px solid #E1E9E3", borderRadius: 10, background: "#fff", overflow: "hidden" }}>
      <style>{`
        .rte-body .ProseMirror { outline: none; padding: 10px 12px; font-size: .88rem; line-height: 1.6; }
        .rte-body .ProseMirror p { margin: 0 0 .4rem; }
        .rte-body .ProseMirror ul, .rte-body .ProseMirror ol { padding-left: 1.3rem; margin: 0 0 .4rem; }
        .rte-body .ProseMirror a { color: #2F8F76; text-decoration: underline; }
      `}</style>

      <div
        className="d-flex flex-wrap align-items-center gap-1"
        style={{ padding: 6, borderBottom: "1px solid #E1E9E3", background: "#F7FAF8" }}
        onMouseDown={(e) => {
          // Giữ vùng chữ đang bôi đen khi bấm nút (trừ ô chọn)
          if ((e.target as HTMLElement).tagName !== "SELECT" && (e.target as HTMLElement).tagName !== "INPUT") {
            e.preventDefault();
          }
        }}
      >
        <button type="button" title="In đậm" style={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <FiBold size={15} />
        </button>
        <button type="button" title="In nghiêng" style={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <FiItalic size={15} />
        </button>
        <button type="button" title="Gạch chân" style={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <FiUnderline size={15} />
        </button>

        <span style={{ width: 1, height: 20, background: "#E1E9E3", margin: "0 4px" }} />

        <select
          title="Font chữ"
          style={{ ...selectStyle, maxWidth: 130 }}
          value={FONTS.some((f) => f.value === currentFont) ? currentFont : ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v) editor.chain().focus().setFontFamily(v).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
        >
          {FONTS.map((f) => (
            <option key={f.name} value={f.value}>{f.name}</option>
          ))}
        </select>

        <select
          title="Cỡ chữ"
          style={selectStyle}
          value={SIZES.includes(currentSize) ? currentSize : ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v) editor.chain().focus().setFontSize(v).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
        >
          <option value="">Cỡ chữ</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>{s.replace("px", "")}</option>
          ))}
        </select>

        <span style={{ width: 1, height: 20, background: "#E1E9E3", margin: "0 4px" }} />

        {COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            title={`Màu: ${c.name}`}
            onClick={() => {
              if (c.value) editor.chain().focus().setColor(c.value).run();
              else editor.chain().focus().unsetColor().run();
            }}
            style={{
              width: 20, height: 20, borderRadius: "50%", padding: 0, cursor: "pointer",
              border: currentColor.toLowerCase() === c.value.toLowerCase() ? "2px solid #223028" : "1px solid #D8D8D3",
              background: c.value || "linear-gradient(135deg, #fff 45%, #E1483D 45%, #E1483D 55%, #fff 55%)",
            }}
          />
        ))}
        <input
          type="color"
          title="Chọn màu khác"
          value={/^#[0-9a-f]{6}$/i.test(currentColor) ? currentColor : "#000000"}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          style={{ width: 26, height: 26, padding: 0, border: "1px solid #E1E9E3", borderRadius: 6, background: "#fff", cursor: "pointer" }}
        />

        <span style={{ width: 1, height: 20, background: "#E1E9E3", margin: "0 4px" }} />

        <button
          type="button"
          title="Xóa định dạng"
          style={btn(false)}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          <FiXCircle size={15} />
        </button>
      </div>

      <div className="rte-body" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}