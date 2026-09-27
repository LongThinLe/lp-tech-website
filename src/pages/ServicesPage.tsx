import { FiCheckCircle, FiPhoneCall } from "react-icons/fi";

const SERVICES = [
  {
    id: "packaging",
    badge: "Industrial Supply",
    title: "Vật Tư Đóng Gói Chuẩn Công Nghiệp",
    subtitle: "Tối ưu hóa chuỗi vận hành nhà kho & xuất khẩu",
    desc: "Giải pháp bảo vệ hàng hóa toàn diện với màng PE cao cấp, băng keo chịu lực và vật liệu chống sốc tiêu chuẩn quốc tế.",
    features: [
      "Đạt tiêu chuẩn xuất khẩu EU/US",
      "Độ giãn cao, tiết kiệm vật tư sử dụng",
      "Giao hàng nhanh trong khu vực Đồng Nai",
    ],
    featured: false,
  },
  {
    id: "lab-supplies",
    badge: "Lab & Science",
    title: "Thiết Bị & Vật Tư Phòng Lab Chuyên Sâu",
    subtitle: "Chính xác tuyệt đối cho R&D và Kiểm định QC",
    desc: "Cung cấp dụng cụ thủy tinh, hóa chất tinh khiết và thiết bị đo lường chính xác cao với đầy đủ chứng nhận CO/CQ nguồn gốc.",
    features: [
      "Chứng nhận CO/CQ đầy đủ theo lô hàng",
      "Hàng chính hãng, nguồn gốc rõ ràng",
      "Tư vấn kỹ thuật bởi đội ngũ chuyên môn",
    ],
    featured: true,
  },
  {
    id: "consulting",
    badge: "Enterprise Solution",
    title: "Tư Vấn Giải Pháp Cung Ứng Định Kỳ",
    subtitle: "Tối ưu chi phí & đảm bảo không đứt gãy chuỗi cung ứng",
    desc: "Khảo sát quy trình thực tế tại nhà máy, đề xuất vật tư thay thế tối ưu và lập kế hoạch giao hàng định kỳ theo nhu cầu sản xuất.",
    features: [
      "Khảo sát nhu cầu thực tế miễn phí",
      "Chiết khấu theo sản lượng hợp tác dài hạn",
      "Hỗ trợ kỹ thuật xuyên suốt quá trình dùng",
    ],
    featured: false,
  },
];

const COMMITMENTS = [
  { label: "Hàng chính hãng", desc: "Nguồn gốc rõ ràng" },
  { label: "Chứng từ đầy đủ", desc: "CO/CQ, hoá đơn VAT" },
  { label: "Giao đúng hẹn", desc: "Cam kết thời gian" },
  { label: "Hỗ trợ kỹ thuật", desc: "Trước & sau bán hàng" },
];

export default function ServicesPage() {
  return (
    <div style={{ background: "#FBFBF8", color: "#223028" }}>
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(27,46,39,.6), rgba(27,46,39,.6)), url('/hero-services.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container py-4 text-center" data-aos="fade-up">
          <span
            className="spec-chip mb-3"
            style={{
              background: "rgba(127,217,190,.18)",
              borderColor: "rgba(127,217,190,.5)",
              color: "#DFF5EC",
              fontWeight: 700,
            }}
          >
            ECOSYSTEM SERVICES
          </span>
          <h1
            className="display-5 fw-bold mt-3 mb-3 text-white"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              textShadow: "0 2px 16px rgba(0,0,0,.5), 0 1px 4px rgba(0,0,0,.6)",
            }}
          >
            Cung ứng vật tư thông minh <span style={{ color: "#7FD9BE" }}>từ kho bãi đến phòng lab</span>
          </h1>
          <p
            className="fs-5 mx-auto"
            style={{
              color: "rgba(255,255,255,.85)",
              fontWeight: 600,
              maxWidth: 620,
              textShadow: "0 2px 12px rgba(0,0,0,.4)",
            }}
          >
            LP Tech đơn giản hóa quy trình mua sắm vật tư doanh nghiệp bằng giải pháp phân phối trực tiếp, chứng nhận minh bạch và hỗ trợ kỹ thuật chuyên sâu.
          </p>

          <div className="row g-4 justify-content-center mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,.2)" }} data-aos="fade-up" data-aos-delay="160">
            {COMMITMENTS.map((c, idx) => (
              <div key={idx} className="col-6 col-md-3">
                <div className="fw-semibold mb-1 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1rem" }}>
                  {c.label}
                </div>
                <div className="small" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,.7)" }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {SERVICES.map((s) => (
              <div key={s.id} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={SERVICES.indexOf(s) * 100}>
                <div className="p-4 p-xl-5 rounded-5 h-100 d-flex flex-column justify-content-between position-relative" style={{ background: s.featured ? "#22684F" : "#FFFFFF", color: s.featured ? "#FFFFFF" : "#223028", border: s.featured ? "none" : "1px solid #E1E9E3", boxShadow: s.featured ? "0 20px 40px rgba(34,104,79,0.25)" : "0 4px 20px rgba(0,0,0,0.03)" }}>
                  <div>
                    <span className="badge mb-4 px-3 py-2 rounded-pill" style={{ background: s.featured ? "rgba(255,255,255,0.15)" : "#E4F1EA", color: s.featured ? "#7FD9BE" : "#1A5240", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                      {s.badge}
                    </span>

                    <h3 className="fw-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.2rem", color: s.featured ? "#fff" : "#223028" }}>
                      {s.title}
                    </h3>

                    <p className="small mb-4" style={{ color: s.featured ? "rgba(255,255,255,0.7)" : "#5B6B76" }}>
                      {s.subtitle}
                    </p>

                    <p className="mb-4" style={{ fontSize: "0.95rem", lineHeight: 1.6, opacity: s.featured ? 0.9 : 0.85 }}>
                      {s.desc}
                    </p>

                    <hr style={{ borderColor: s.featured ? "rgba(255,255,255,0.15)" : "#E1E9E3" }} className="my-4" />

                    <ul className="list-unstyled d-flex flex-column gap-3 mb-5">
                      {s.features.map((f, i) => (
                        <li key={i} className="d-flex align-items-center gap-2" style={{ fontSize: "0.9rem" }}>
                          <FiCheckCircle style={{ color: s.featured ? "#7FD9BE" : "#2F8F76" }} className="flex-shrink-0" size={18} />
                          <span style={{ opacity: s.featured ? 0.95 : 0.85 }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 my-5">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.6rem" }}>
              Quy trình trải nghiệm dịch vụ
            </h2>
            <p className="text-secondary">Chuẩn hóa 4 bước từ tiếp nhận đến bàn giao tận kho</p>
          </div>

          <div className="row g-4">
            {[
              { num: "01", title: "Khảo sát nhu cầu", desc: "Đội ngũ kỹ thuật phân tích chính xác mã vật tư & quy mô đơn hàng." },
              { num: "02", title: "Gửi mẫu & CO/CQ", desc: "Cung cấp mẫu dùng thử thực tế và đầy đủ chứng nhận chất lượng." },
              { num: "03", title: "Báo giá sỉ tối ưu", desc: "Áp dụng bảng giá gốc trực tiếp từ nhà phân phối không trung gian." },
              { num: "04", title: "Giao nhận & Hỗ trợ", desc: "Giao tận kho đúng hẹn, kèm hóa đơn VAT và hỗ trợ kỹ thuật khi cần." },
            ].map((step, idx) => (
              <div key={idx} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={idx * 80}>
                <div className="p-4 rounded-4 bg-white h-100 border position-relative overflow-hidden" style={{ borderColor: "#E1E9E3" }}>
                  <span className="position-absolute top-0 end-0 p-3 display-4 fw-bold" style={{ opacity: 0.12, fontFamily: "'Space Grotesk', sans-serif", color: "#22684F" }}>
                    {step.num}
                  </span>
                  <div className="fw-semibold mb-2 mt-4" style={{ color: "#22684F", fontSize: "1rem" }}>{step.title}</div>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" id="contact">
        <div className="container">
          <div className="p-5 rounded-5 text-white position-relative overflow-hidden text-center text-lg-start" style={{ background: "linear-gradient(135deg, #1A5240 0%, #22684F 100%)", boxShadow: "0 24px 48px rgba(26,82,64,0.2)" }}>
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="badge px-3 py-2 rounded-pill mb-3" style={{ background: "rgba(255,255,255,0.12)", color: "#7FD9BE" }}>
                  B2B ENTERPRISE SUPPORT
                </span>
                <h2 className="fw-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5rem" }}>
                  Sẵn sàng nâng cấp chuỗi cung ứng của bạn?
                </h2>
                <p className="mb-0 text-white-50 fs-6" style={{ maxWidth: 600 }}>
                  Liên hệ ngay với bộ phận kỹ thuật để nhận catalogue chi tiết, tư vấn vật tư mẫu và báo giá sỉ ưu đãi.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end d-flex flex-column flex-sm-row justify-content-lg-end gap-3">
                <a href="tel:0989766715" className="btn btn-light btn-lg rounded-pill fw-bold px-4 py-3 d-inline-flex align-items-center justify-content-center gap-2" style={{ color: "#1A5240", fontSize: "0.95rem" }}>
                  <FiPhoneCall /> Hotline Kinh Doanh
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}