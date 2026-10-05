import { useEffect, useState } from "react";
import { FiSave, FiSettings } from "react-icons/fi";
import {
  getCompanySettings,
  saveCompanySettings,
  extractMapSrc,
  mapEmbedSrc,
  mapOpenLink,
} from "../services/settingsService";
import type { CompanySettings } from "../services/settingsService";

const fields: { key: keyof CompanySettings; label: string; placeholder?: string; hint?: string }[] = [
  { key: "companyName", label: "Tên công ty" },
  { key: "taxCode", label: "Mã số thuế" },
  { key: "address", label: "Địa chỉ", hint: "Hiện ở chân trang và trang Liên hệ." },
  { key: "phone", label: "Số điện thoại", hint: "Dùng cho nút gọi điện và Zalo." },
  { key: "email", label: "Email" },
  { key: "facebook", label: "Link Facebook", placeholder: "https://www.facebook.com/...", hint: "Để trống nếu muốn ẩn biểu tượng." },
  { key: "instagram", label: "Link Instagram", placeholder: "https://www.instagram.com/...", hint: "Để trống nếu muốn ẩn biểu tượng." },
  { key: "supportLine", label: "Dòng giới thiệu người tư vấn", hint: "Hiện ở khung \"Cần tư vấn đặt hàng số lượng lớn?\"" },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState<CompanySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    getCompanySettings().then((data) => setForm(data));
  }, []);

  if (!form) {
    return <div style={{ color: "#96A0A8", fontSize: ".9rem" }}>Đang tải thông tin...</div>;
  }

  const update = (key: keyof CompanySettings, value: string) => {
    setForm({ ...form, [key]: value });
    setMessage(null);
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập tên công ty." });
      return;
    }
    const mapInput = form.mapEmbed.trim();
    const mapSrc = extractMapSrc(mapInput);
    if (mapInput && !mapSrc) {
      setMessage({
        type: "error",
        text: "Link bản đồ chưa đúng. Hãy dán đoạn mã \"Nhúng bản đồ\" lấy từ Google Maps (bắt đầu bằng <iframe...).",
      });
      return;
    }
    setSaving(true);
    try {
      const data: CompanySettings = { ...form, mapEmbed: mapSrc };
      await saveCompanySettings(data);
      setForm(data);
      setMessage({ type: "ok", text: "Đã lưu! Chân trang và trang Liên hệ sẽ cập nhật ngay." });
    } catch (err) {
      console.error("Lỗi khi lưu thông tin công ty:", err);
      setMessage({ type: "error", text: "Có lỗi khi lưu — kiểm tra lại kết nối Firebase." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="d-flex align-items-center gap-2 mb-1" style={{ color: "#22684F" }}>
        <FiSettings />
        <span style={{ fontSize: ".78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".02em" }}>
          Thiết lập
        </span>
      </div>
      <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.35rem" }}>
        Thông tin công ty
      </h2>

      <div className="bg-white rounded-4 p-4 mb-4" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
        {fields.map((f) => (
          <div className="mb-3" key={f.key}>
            <label className="form-label" style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" }}>
              {f.label}
            </label>
            <input
              className="form-control"
              style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".9rem" }}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
            />
            {f.hint && <div style={{ fontSize: ".72rem", color: "#96A0A8", marginTop: 4 }}>{f.hint}</div>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-4 p-4 mb-4" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
        <div className="fw-semibold mb-1" style={{ fontSize: ".95rem" }}>Google Map ở chân trang</div>
        <div style={{ fontSize: ".78rem", color: "#5B6B76", marginBottom: 12 }}>
          Để trống thì web tự tìm theo địa chỉ. Nếu bản đồ chưa đúng vị trí, làm như sau:
          mở Google Maps, tìm đúng vị trí công ty, bấm <b>Chia sẻ</b>, chọn thẻ <b>Nhúng bản đồ</b>,
          bấm <b>Sao chép HTML</b> rồi dán vào ô bên dưới.
        </div>
        <textarea
          className="form-control mb-3"
          style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".8rem", minHeight: 80 }}
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
          value={form.mapEmbed}
          onChange={(e) => update("mapEmbed", e.target.value)}
        />
        <div style={{ fontSize: ".72rem", color: "#96A0A8", marginBottom: 6 }}>Xem trước:</div>
        <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #E1E9E3", height: 220 }}>
          <iframe
            title="Xem trước bản đồ"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={mapEmbedSrc(form)}
          />
        </div>
        <a
          href={mapOpenLink(form)}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: ".75rem", color: "#2F8F76", display: "inline-block", marginTop: 8 }}
        >
          Mở địa chỉ này trong Google Maps
        </a>
      </div>

      {message && (
        <div
          className="mb-3"
          style={{ fontSize: ".85rem", color: message.type === "ok" ? "#22684F" : "#B93A31" }}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn d-inline-flex align-items-center gap-2"
        style={{
          background: "linear-gradient(135deg, #2F8F76, #22684F)", color: "#fff", fontWeight: 700,
          fontSize: ".9rem", padding: "11px 30px", border: "none", borderRadius: 11,
          opacity: saving ? 0.6 : 1,
        }}
      >
        <FiSave /> {saving ? "Đang lưu..." : "Lưu thông tin"}
      </button>
    </div>
  );
}