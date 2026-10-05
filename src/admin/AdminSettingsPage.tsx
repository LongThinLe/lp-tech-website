import { useEffect, useRef, useState } from "react";
import { FiSave, FiSettings, FiUploadCloud } from "react-icons/fi";
import {
  getCompanySettings,
  saveCompanySettings,
  extractMapSrc,
  mapEmbedSrc,
  mapOpenLink,
} from "../services/settingsService";
import type { CompanySettings } from "../services/settingsService";
import { uploadProductImage } from "../services/storageService";

type LogoKey = "logoHeader" | "logoFooter";

const logos: { key: LogoKey; label: string; hint: string; fallback: string; dark: boolean }[] = [
  {
    key: "logoHeader",
    label: "Logo đầu trang",
    hint: "Hiện ở góc trái thanh menu (nền trắng).",
    fallback: "/logo-icon.png",
    dark: false,
  },
  {
    key: "logoFooter",
    label: "Logo chân trang",
    hint: "Hiện ở cuối trang (nền xanh đậm) — nên dùng logo sáng màu.",
    fallback: "/logo-icon-gold.png",
    dark: true,
  },
];

const fields: { key: keyof CompanySettings; label: string; placeholder?: string; hint?: string }[] = [
  { key: "companyName", label: "Tên công ty" },
  { key: "taxCode", label: "Mã số thuế" },
  { key: "address", label: "Địa chỉ", hint: "Hiện ở chân trang và trang Liên hệ." },
  { key: "phone", label: "Số điện thoại", hint: "Dùng cho nút gọi điện và Zalo." },
  { key: "email", label: "Email" },
  { key: "workingHours", label: "Giờ làm việc", hint: "Hiện ở thanh trên cùng của web." },
  { key: "facebook", label: "Link Facebook", placeholder: "https://www.facebook.com/...", hint: "Để trống nếu muốn ẩn biểu tượng." },
  { key: "instagram", label: "Link Instagram", placeholder: "https://www.instagram.com/...", hint: "Để trống nếu muốn ẩn biểu tượng." },
  { key: "supportLine", label: "Dòng giới thiệu người tư vấn", hint: "Hiện ở khung \"Cần tư vấn đặt hàng số lượng lớn?\"" },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState<CompanySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [uploadingKey, setUploadingKey] = useState<LogoKey | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const pickingKey = useRef<LogoKey | null>(null);

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

  const chooseLogo = (key: LogoKey) => {
    pickingKey.current = key;
    logoInputRef.current?.click();
  };

  const handleLogoFile = async (file: File) => {
    const key = pickingKey.current;
    if (!key) return;
    setUploadingKey(key);
    setMessage(null);
    try {
      const url = await uploadProductImage(file);
      setForm((prev) => (prev ? { ...prev, [key]: url } : prev));
      setMessage({ type: "ok", text: "Đã tải logo lên. Nhớ bấm \"Lưu thông tin\" ở cuối trang để áp dụng." });
    } catch (err) {
      console.error("Lỗi tải logo:", err);
      setMessage({ type: "error", text: "Tải logo lên thất bại — thử lại nhé." });
    } finally {
      setUploadingKey(null);
    }
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
      setMessage({ type: "ok", text: "Đã lưu! Web sẽ cập nhật ngay (tải lại trang để thấy)." });
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

      {/* Logo */}
      <div className="bg-white rounded-4 p-4 mb-4" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
        <div className="fw-semibold mb-1" style={{ fontSize: ".95rem" }}>Logo</div>
        <div style={{ fontSize: ".78rem", color: "#5B6B76", marginBottom: 14 }}>
          Chọn ảnh logo mới (PNG nền trong suốt là đẹp nhất). Chưa chọn thì web dùng logo mặc định.
        </div>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="d-none"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleLogoFile(file);
            e.target.value = "";
          }}
        />
        <div className="row g-3">
          {logos.map((l) => (
            <div className="col-md-6" key={l.key}>
              <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44", marginBottom: 6 }}>{l.label}</div>
              <div
                className="rounded-3 d-flex align-items-center justify-content-center mb-2"
                style={{
                  height: 90,
                  background: l.dark ? "#16332A" : "#fff",
                  border: "1.5px solid #E1E9E3",
                }}
              >
                {uploadingKey === l.key ? (
                  <div className="spinner-border spinner-border-sm" style={{ color: "#2F8F76" }} role="status" />
                ) : (
                  <img
                    src={form[l.key] || l.fallback}
                    alt={l.label}
                    style={{ maxHeight: 60, maxWidth: "80%", objectFit: "contain" }}
                  />
                )}
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => chooseLogo(l.key)}
                  disabled={uploadingKey !== null}
                  className="btn btn-sm d-inline-flex align-items-center gap-1"
                  style={{ background: "#E4F1EA", color: "#22684F", fontWeight: 600 }}
                >
                  <FiUploadCloud size={13} /> Chọn logo mới
                </button>
                {form[l.key] && (
                  <button
                    type="button"
                    onClick={() => update(l.key, "")}
                    className="btn btn-sm"
                    style={{ background: "#F1F1EE", color: "#B93A31", fontWeight: 600 }}
                  >
                    Dùng logo mặc định
                  </button>
                )}
              </div>
              <div style={{ fontSize: ".72rem", color: "#96A0A8", marginTop: 6 }}>{l.hint}</div>
            </div>
          ))}
        </div>
      </div>

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
        disabled={saving || uploadingKey !== null}
        className="btn d-inline-flex align-items-center gap-2"
        style={{
          background: "linear-gradient(135deg, #2F8F76, #22684F)", color: "#fff", fontWeight: 700,
          fontSize: ".9rem", padding: "11px 30px", border: "none", borderRadius: 11,
          opacity: saving || uploadingKey !== null ? 0.6 : 1,
        }}
      >
        <FiSave /> {saving ? "Đang lưu..." : "Lưu thông tin"}
      </button>
    </div>
  );
}