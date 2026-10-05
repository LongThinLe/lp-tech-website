import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiImage, FiType } from "react-icons/fi";
import {
  getNews,
  addNews,
  updateNews,
  deleteNews,
  formatNewsDate,
  type NewsPost,
  type NewsBlock,
} from "../services/newsService";
import { uploadProductImage } from "../services/storageService";
import { toSlug, uniqueSlug } from "../utils/slug";

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#5B6B76",
  margin: "14px 0 6px",
  display: "block",
};
const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E1E9E3",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  background: "#fff",
};
const btnGreen: React.CSSProperties = {
  background: "#2F8F76",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 14,
  fontWeight: 600,
};
const btnLight: React.CSSProperties = {
  background: "#fff",
  color: "#5B6B76",
  border: "1px solid #E1E9E3",
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 14,
};

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () =>
    getNews()
      .then(setPosts)
      .catch(() => alert("Không tải được danh sách tin tức"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setIsNew(true);
    setEditing({
      id: "",
      title: "",
      slug: "",
      summary: "",
      cover: "",
      blocks: [{ id: uid(), type: "text", text: "" }],
      publishedAt: today(),
      hidden: false,
    });
  };

  const startEdit = (p: NewsPost) => {
    setIsNew(false);
    setEditing({ ...p, blocks: p.blocks.map((b) => ({ ...b })) });
  };

  const patch = (data: Partial<NewsPost>) =>
    setEditing((e) => (e ? { ...e, ...data } : e));

  const setBlocks = (blocks: NewsBlock[]) => patch({ blocks });

  const move = (i: number, dir: -1 | 1) => {
    if (!editing) return;
    const j = i + dir;
    if (j < 0 || j >= editing.blocks.length) return;
    const arr = [...editing.blocks];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setBlocks(arr);
  };

  const removeBlock = (i: number) => {
    if (!editing) return;
    setBlocks(editing.blocks.filter((_, k) => k !== i));
  };

  const changeText = (i: number, text: string) => {
    if (!editing) return;
    setBlocks(
      editing.blocks.map((b, k) =>
        k === i && b.type === "text" ? { ...b, text } : b
      )
    );
  };

  const addText = () => {
    if (!editing) return;
    setBlocks([...editing.blocks, { id: uid(), type: "text", text: "" }]);
  };

  const addImages = async (files: FileList | null) => {
    if (!editing || !files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadProductImage(f)));
      const newBlocks: NewsBlock[] = urls.map((url) => ({ id: uid(), type: "image", url }));
      setEditing((e) => (e ? { ...e, blocks: [...e.blocks, ...newBlocks] } : e));
    } catch {
      alert("Upload ảnh lỗi, thử lại nhé");
    } finally {
      setUploading(false);
    }
  };

  const uploadCover = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(files[0]);
      patch({ cover: url });
    } catch {
      alert("Upload ảnh lỗi, thử lại nhé");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      alert("Nhập tiêu đề bài viết");
      return;
    }
    setSaving(true);
    try {
      const blocks = editing.blocks.filter((b) =>
        b.type === "text" ? b.text.trim() !== "" : true
      );
      const taken = posts.filter((p) => p.id !== editing.id).map((p) => p.slug);
      const slug = editing.slug || uniqueSlug(toSlug(editing.title), taken);
      const data = {
        title: editing.title.trim(),
        slug,
        summary: editing.summary.trim(),
        cover: editing.cover,
        blocks,
        publishedAt: editing.publishedAt || today(),
        hidden: !!editing.hidden,
      };
      if (isNew) await addNews(data);
      else await updateNews(editing.id, data);
      setEditing(null);
      await load();
    } catch {
      alert("Có lỗi khi lưu — kiểm tra lại kết nối Firebase");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: NewsPost) => {
    if (!window.confirm(`Xóa bài "${p.title}"?`)) return;
    try {
      await deleteNews(p.id);
      await load();
    } catch {
      alert("Xóa không được, thử lại nhé");
    }
  };

  const toggleHidden = async (p: NewsPost) => {
    try {
      const { id, ...rest } = p;
      await updateNews(id, { ...rest, hidden: !p.hidden });
      await load();
    } catch {
      alert("Có lỗi, thử lại nhé");
    }
  };

  /* ---------- Editor toàn màn hình ---------- */
  if (editing) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1050,
          background: "#F7FAF8",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "#fff",
            borderBottom: "1px solid #E1E9E3",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <h2 style={{ fontSize: 20, margin: 0, marginRight: "auto" }}>
            {isNew ? "Thêm bài viết" : "Sửa bài viết"}
          </h2>
          <button style={btnLight} onClick={() => setEditing(null)} disabled={saving}>
            Hủy
          </button>
          <button style={btnGreen} onClick={save} disabled={saving || uploading}>
            {saving ? "Đang lưu..." : "Lưu bài viết"}
          </button>
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "10px 28px 60px" }}>
          <label style={label}>Tiêu đề</label>
          <input
            style={input}
            value={editing.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Nhập tiêu đề bài viết"
          />

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Ngày đăng</label>
              <input
                type="date"
                style={input}
                value={editing.publishedAt}
                onChange={(e) => patch({ publishedAt: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Trạng thái</label>
              <select
                style={input}
                value={editing.hidden ? "hidden" : "show"}
                onChange={(e) => patch({ hidden: e.target.value === "hidden" })}
              >
                <option value="show">Hiển thị</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>

          <label style={label}>Tóm tắt (hiện ở trang danh sách)</label>
          <textarea
            style={{ ...input, minHeight: 70 }}
            value={editing.summary}
            onChange={(e) => patch({ summary: e.target.value })}
            placeholder="Vài câu giới thiệu ngắn về bài viết"
          />

          <label style={label}>Ảnh bìa</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 140,
                height: 88,
                borderRadius: 8,
                background: "#E4F1EA",
                overflow: "hidden",
              }}
            >
              {editing.cover && (
                <img
                  src={editing.cover}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <label style={{ ...btnLight, cursor: "pointer", margin: 0 }}>
              {editing.cover ? "Đổi ảnh" : "Chọn ảnh"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  uploadCover(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {editing.cover && (
              <button style={btnLight} onClick={() => patch({ cover: "" })}>
                Xóa ảnh bìa
              </button>
            )}
          </div>

          <label style={{ ...label, fontSize: 15, color: "#223028", marginTop: 26 }}>
            Nội dung bài viết
          </label>

          {editing.blocks.map((b, i) => (
            <div
              key={b.id}
              style={{
                background: "#fff",
                border: "1px solid #E1E9E3",
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <b style={{ fontSize: 12, color: "#96A0A8", marginRight: "auto" }}>
                  {b.type === "text" ? "ĐOẠN VĂN" : "HÌNH ẢNH"}
                </b>
                <button style={{ ...btnLight, padding: "4px 8px" }} onClick={() => move(i, -1)}>
                  <FiArrowUp />
                </button>
                <button style={{ ...btnLight, padding: "4px 8px", marginLeft: 4 }} onClick={() => move(i, 1)}>
                  <FiArrowDown />
                </button>
                <button
                  style={{ ...btnLight, padding: "4px 8px", marginLeft: 4, color: "#E1483D" }}
                  onClick={() => removeBlock(i)}
                >
                  <FiTrash2 />
                </button>
              </div>
              {b.type === "text" ? (
                <textarea
                  style={{ ...input, minHeight: 110, lineHeight: 1.6 }}
                  value={b.text}
                  onChange={(e) => changeText(i, e.target.value)}
                  placeholder="Gõ nội dung, nhấn Enter để xuống dòng"
                />
              ) : (
                <img
                  src={b.url}
                  alt=""
                  style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 8, display: "block" }}
                />
              )}
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button style={btnLight} onClick={addText}>
              <FiType /> Thêm đoạn văn
            </button>
            <label style={{ ...btnLight, cursor: "pointer", margin: 0 }}>
              <FiImage /> {uploading ? "Đang tải ảnh..." : "Thêm ảnh (chọn nhiều ảnh)"}
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={uploading}
                onChange={(e) => {
                  addImages(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Danh sách ---------- */
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontSize: 22, margin: 0, marginRight: "auto" }}>Tin tức</h2>
        <button style={btnGreen} onClick={startNew}>
          <FiPlus /> Thêm bài viết
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : posts.length === 0 ? (
        <p style={{ color: "#5B6B76" }}>Chưa có bài viết nào. Bấm "Thêm bài viết" để đăng bài đầu tiên.</p>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E1E9E3", borderRadius: 14, overflow: "hidden" }}>
          <table className="table mb-0" style={{ verticalAlign: "middle" }}>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th style={{ width: 120 }}>Ngày đăng</th>
                <th style={{ width: 110 }}>Trạng thái</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{formatNewsDate(p.publishedAt)}</td>
                  <td>
                    <button
                      style={{ ...btnLight, padding: "3px 10px", fontSize: 13 }}
                      onClick={() => toggleHidden(p)}
                    >
                      {p.hidden ? "Đang ẩn" : "Hiển thị"}
                    </button>
                  </td>
                  <td>
                    <button style={{ ...btnLight, padding: "4px 8px" }} onClick={() => startEdit(p)}>
                      <FiEdit2 />
                    </button>
                    <button
                      style={{ ...btnLight, padding: "4px 8px", marginLeft: 4, color: "#E1483D" }}
                      onClick={() => remove(p)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}