import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  getServices,
  addService,
  updateService,
  deleteService,
  DEFAULT_SERVICES,
  type ServiceItem,
  type ServiceInput,
} from "../services/serviceService";

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

// Dữ liệu đang sửa: features là chuỗi nhiều dòng cho dễ gõ
interface Draft {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  featuresText: string;
  featured: boolean;
  order: number;
  hidden: boolean;
}

export default function AdminServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    getServices()
      .then(setItems)
      .catch(() => alert("Không tải được danh sách dịch vụ"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setIsNew(true);
    setDraft({
      id: "",
      badge: "",
      title: "",
      subtitle: "",
      desc: "",
      featuresText: "",
      featured: false,
      order: items.length ? Math.max(...items.map((i) => i.order)) + 1 : 1,
      hidden: false,
    });
  };

  const startEdit = (s: ServiceItem) => {
    setIsNew(false);
    setDraft({
      id: s.id,
      badge: s.badge,
      title: s.title,
      subtitle: s.subtitle,
      desc: s.desc,
      featuresText: s.features.join("\n"),
      featured: s.featured,
      order: s.order,
      hidden: s.hidden,
    });
  };

  const patch = (data: Partial<Draft>) =>
    setDraft((d) => (d ? { ...d, ...data } : d));

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      alert("Nhập tên dịch vụ");
      return;
    }
    setSaving(true);
    try {
      const data: ServiceInput = {
        badge: draft.badge.trim(),
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        desc: draft.desc.trim(),
        features: draft.featuresText
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l !== ""),
        featured: draft.featured,
        order: Number(draft.order) || 0,
        hidden: draft.hidden,
      };
      if (isNew) await addService(data);
      else await updateService(draft.id, data);
      setDraft(null);
      await load();
    } catch {
      alert("Có lỗi khi lưu — kiểm tra lại kết nối Firebase");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: ServiceItem) => {
    if (!window.confirm(`Xóa dịch vụ "${s.title}"?`)) return;
    try {
      await deleteService(s.id);
      await load();
    } catch {
      alert("Xóa không được, thử lại nhé");
    }
  };

  const toggleHidden = async (s: ServiceItem) => {
    try {
      const { id, ...rest } = s;
      await updateService(id, { ...rest, hidden: !s.hidden });
      await load();
    } catch {
      alert("Có lỗi, thử lại nhé");
    }
  };

  const seed = async () => {
    if (!window.confirm("Nạp 3 dịch vụ mẫu hiện tại của web vào hệ thống?")) return;
    try {
      for (const d of DEFAULT_SERVICES) {
        const { id, ...rest } = d;
        void id;
        await addService(rest);
      }
      await load();
    } catch {
      alert("Có lỗi khi nạp, kiểm tra lại kết nối Firebase");
    }
  };

  /* ---------- Form toàn màn hình ---------- */
  if (draft) {
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
            {isNew ? "Thêm dịch vụ" : "Sửa dịch vụ"}
          </h2>
          <button style={btnLight} onClick={() => setDraft(null)} disabled={saving}>
            Hủy
          </button>
          <button style={btnGreen} onClick={save} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu dịch vụ"}
          </button>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "10px 28px 60px" }}>
          <label style={label}>Tên dịch vụ</label>
          <input
            style={input}
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="VD: Vật Tư Đóng Gói Chuẩn Công Nghiệp"
          />

          <label style={label}>Nhãn nhỏ phía trên (badge)</label>
          <input
            style={input}
            value={draft.badge}
            onChange={(e) => patch({ badge: e.target.value })}
            placeholder="VD: Industrial Supply"
          />

          <label style={label}>Phụ đề (dòng ngắn dưới tên)</label>
          <input
            style={input}
            value={draft.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
            placeholder="VD: Tối ưu hóa chuỗi vận hành nhà kho & xuất khẩu"
          />

          <label style={label}>Mô tả</label>
          <textarea
            style={{ ...input, minHeight: 110, lineHeight: 1.6 }}
            value={draft.desc}
            onChange={(e) => patch({ desc: e.target.value })}
            placeholder="Giới thiệu ngắn về dịch vụ"
          />

          <label style={label}>Điểm nổi bật (mỗi dòng là một ý, nhấn Enter để xuống dòng)</label>
          <textarea
            style={{ ...input, minHeight: 120, lineHeight: 1.6 }}
            value={draft.featuresText}
            onChange={(e) => patch({ featuresText: e.target.value })}
            placeholder={"Đạt tiêu chuẩn xuất khẩu\nGiao hàng nhanh\nHỗ trợ kỹ thuật"}
          />

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Thứ tự hiển thị (số nhỏ hiện trước)</label>
              <input
                type="number"
                style={input}
                value={draft.order}
                onChange={(e) => patch({ order: Number(e.target.value) })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Trạng thái</label>
              <select
                style={input}
                value={draft.hidden ? "hidden" : "show"}
                onChange={(e) => patch({ hidden: e.target.value === "hidden" })}
              >
                <option value="show">Hiển thị</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>

          <label
            style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, fontSize: 14 }}
          >
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => patch({ featured: e.target.checked })}
            />
            Nổi bật (thẻ nền xanh đậm)
          </label>
        </div>
      </div>
    );
  }

  /* ---------- Danh sách ---------- */
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18, gap: 8 }}>
        <h2 style={{ fontSize: 22, margin: 0, marginRight: "auto" }}>Dịch vụ</h2>
        <button style={btnGreen} onClick={startNew}>
          <FiPlus /> Thêm dịch vụ
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : items.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E1E9E3",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <p style={{ color: "#5B6B76" }}>
            Chưa có dịch vụ nào trong hệ thống, web đang hiển thị 3 dịch vụ mặc định. Bấm nút
            dưới để nạp 3 dịch vụ này vào admin rồi chỉnh sửa tiếp.
          </p>
          <button style={btnGreen} onClick={seed}>
            Nạp 3 dịch vụ mẫu
          </button>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E1E9E3",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <table className="table mb-0" style={{ verticalAlign: "middle" }}>
            <thead>
              <tr>
                <th style={{ width: 70 }}>Thứ tự</th>
                <th>Tên dịch vụ</th>
                <th style={{ width: 110 }}>Trạng thái</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>{s.order}</td>
                  <td>
                    {s.title}
                    {s.featured && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#2F8F76" }}>
                        ★ Nổi bật
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      style={{ ...btnLight, padding: "3px 10px", fontSize: 13 }}
                      onClick={() => toggleHidden(s)}
                    >
                      {s.hidden ? "Đang ẩn" : "Hiển thị"}
                    </button>
                  </td>
                  <td>
                    <button
                      style={{ ...btnLight, padding: "4px 8px" }}
                      onClick={() => startEdit(s)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      style={{ ...btnLight, padding: "4px 8px", marginLeft: 4, color: "#E1483D" }}
                      onClick={() => remove(s)}
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