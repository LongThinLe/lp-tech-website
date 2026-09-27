import { useState, type FormEvent } from "react";
import { FiMapPin, FiPhone, FiMail, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { addLead } from "../services/leadService";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // Lưu vào Firebase — để hiện trong Admin, mục "Yêu cầu báo giá"
      await addLead({
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
      });
      setStatus("success");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-5 bg-white" style={{ minHeight: "70vh" }}>
      <div className="container">
        <div className="mb-5 text-center" data-aos="fade-up">
          <h1 className="h2 fw-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Liên hệ với chúng tôi
          </h1>
          <p style={{ color: "#5B6B76" }}>Gửi yêu cầu — đội ngũ tư vấn phản hồi trong 15 phút</p>
        </div>

        <div className="row g-5">
          <div className="col-lg-5" data-aos="fade-right">
            <div className="d-flex flex-column gap-4">
              <div className="d-flex gap-3">
                <div className="trust-item__icon flex-shrink-0"><FiMapPin /></div>
                <div>
                  <div className="fw-semibold mb-1">Địa chỉ</div>
                  <div style={{ fontSize: ".9rem", color: "#5B6B76" }}>92, Tổ 17C, Khu phố 3, Phường Tam Hiệp, Thành phố Đồng Nai, Việt Nam</div>
                </div>
              </div>
              <div className="d-flex gap-3">
                <div className="trust-item__icon flex-shrink-0"><FiPhone /></div>
                <div>
                  <div className="fw-semibold mb-1">Hotline</div>
                  <div style={{ fontSize: ".9rem", color: "#5B6B76" }}>0989 766 715</div>
                </div>
              </div>
              <div className="d-flex gap-3">
                <div className="trust-item__icon flex-shrink-0"><FiMail /></div>
                <div>
                  <div className="fw-semibold mb-1">Email</div>
                  <div style={{ fontSize: ".9rem", color: "#5B6B76" }}>lptechco.ltd@gmail.com</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7" data-aos="fade-left" data-aos-delay="120">
            {status === "success" ? (
              <div
                className="d-flex align-items-start gap-3 p-4 rounded-4"
                style={{ background: "#E4F1EA", border: "1px solid rgba(47,143,118,.3)" }}
              >
                <FiCheckCircle className="text-signal flex-shrink-0 mt-1" size={22} />
                <div>
                  <div className="fw-semibold mb-1">Đã gửi yêu cầu thành công!</div>
                  <div style={{ fontSize: ".9rem", color: "#3D4A44" }}>
                    Cảm ơn bạn — đội ngũ tư vấn sẽ liên hệ lại trong thời gian sớm nhất.
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-sm mt-3"
                    onClick={() => setStatus("idle")}
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              </div>
            ) : (
              <form className="row g-3" onSubmit={handleSubmit}>
                <div className="col-md-6">
                  <label className="form-label" style={{ fontSize: ".85rem", fontWeight: 500 }}>Họ tên</label>
                  <input
                    type="text" required className="form-control" placeholder="Nguyễn Văn A"
                    value={form.name} onChange={update("name")}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ fontSize: ".85rem", fontWeight: 500 }}>Số điện thoại</label>
                  <input
                    type="tel" required className="form-control" placeholder="09xx xxx xxx"
                    value={form.phone} onChange={update("phone")}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ fontSize: ".85rem", fontWeight: 500 }}>Email</label>
                  <input
                    type="email" required className="form-control" placeholder="ban@congty.com"
                    value={form.email} onChange={update("email")}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label" style={{ fontSize: ".85rem", fontWeight: 500 }}>Nội dung yêu cầu</label>
                  <textarea
                    required className="form-control" rows={4} placeholder="Mô tả sản phẩm và số lượng cần báo giá..."
                    value={form.message} onChange={update("message")}
                  />
                </div>

                {status === "error" && (
                  <div className="col-12 d-flex align-items-center gap-2" style={{ color: "#B93A31", fontSize: ".85rem" }}>
                    <FiAlertCircle /> Gửi chưa thành công, bạn thử lại hoặc gọi trực tiếp hotline nhé.
                  </div>
                )}

                <div className="col-12">
                  <button type="submit" className="btn btn-accent-solid" disabled={status === "loading"}>
                    {status === "loading" ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}