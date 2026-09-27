import { FiTarget, FiUsers, FiTruck } from "react-icons/fi";
import { BsXCircleFill, BsCheckCircleFill } from "react-icons/bs";

export default function AboutPage() {
  return (
    <>
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(251,251,248,.55), rgba(251,251,248,.55)), url('/about-warehouse.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container py-4 text-center" data-aos="fade-up">
          <span
            className="spec-chip mb-3"
            style={{
              background: "rgba(47,143,118,.28)",
              borderColor: "rgba(47,143,118,.6)",
              color: "#1A5240",
              fontWeight: 700,
            }}
          >
            VỀ CHÚNG TÔI
          </span>
          <h1
            className="display-5 fw-bold mt-3 mb-3"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              textShadow: "0 2px 16px rgba(251,251,248,.9), 0 1px 4px rgba(251,251,248,.95)",
            }}
          >
            Đồng hành cùng doanh nghiệp <span className="text-signal">từ nhà kho đến phòng lab</span>
          </h1>
          <p
            className="fs-5 mx-auto"
            style={{
              color: "#3D4A44",
              fontWeight: 600,
              maxWidth: 620,
              textShadow: "0 2px 12px rgba(251,251,248,.9), 0 1px 3px rgba(251,251,248,.95)",
            }}
          >
            LP Tech cung cấp vật tư đóng gói và thiết bị, vật tư phòng thí nghiệm
            với cam kết chất lượng, giá sỉ hợp lý và giao hàng đúng hẹn.
          </p>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            {[
              {
                icon: <FiTarget size={24} />,
                title: "Sứ mệnh",
                desc: "Giúp doanh nghiệp tiếp cận vật tư chất lượng với giá tốt nhất, không qua trung gian.",
                bg: "#FFFFFF",
                textColor: "#0D1512",
                iconBg: "#E4F1EA",
                iconColor: "#22684F",
                border: "1px solid #EAEAEA",
                shadow: "0 4px 20px rgba(0,0,0,0.03)",
              },
              {
                icon: <FiUsers size={24} />,
                title: "Đội ngũ",
                desc: "Nhân viên kỹ thuật am hiểu sản phẩm, tư vấn đúng nhu cầu thay vì chỉ bán hàng.",
                bg: "linear-gradient(135deg, #22684F 0%, #1A5240 100%)",
                textColor: "#FFFFFF",
                iconBg: "rgba(255,255,255,0.15)",
                iconColor: "#7FD9BE",
                border: "none",
                shadow: "0 20px 40px rgba(34,104,79,0.25)",
              },
              {
                icon: <FiTruck size={24} />,
                title: "Vận hành",
                desc: "Kho hàng sẵn sàng, giao nhanh toàn quốc, đóng gói đúng chuẩn an toàn.",
                bg: "#FFFFFF",
                textColor: "#0D1512",
                iconBg: "#FEF3E2",
                iconColor: "#C9821E",
                border: "1px solid #EAEAEA",
                shadow: "0 4px 20px rgba(0,0,0,0.03)",
              },
            ].map((c, i) => (
              <div className="col-md-4" key={c.title} data-aos="fade-up" data-aos-delay={i * 100}>
                <div
                  className="p-4 p-xl-5 rounded-5 h-100 d-flex flex-column justify-content-between"
                  style={{
                    background: c.bg,
                    color: c.textColor,
                    border: c.border,
                    boxShadow: c.shadow,
                  }}
                >
                  <div>
                    <div
                      className="d-flex align-items-center justify-content-center mb-4 rounded-4"
                      style={{
                        width: 52,
                        height: 52,
                        background: c.iconBg,
                        color: c.iconColor,
                      }}
                    >
                      {c.icon}
                    </div>
                    <div
                      className="h5 fw-bold mb-3"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: c.textColor }}
                    >
                      {c.title}
                    </div>
                    <div style={{ fontSize: ".92rem", lineHeight: 1.6, opacity: c.textColor === "#FFFFFF" ? 0.9 : 0.75 }}>
                      {c.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5" style={{ background: "#EEF4F0" }}>
        <div className="container py-3">
          <div className="text-center mb-5" data-aos="fade-up">
            <span
              className="badge px-3 py-2 rounded-pill mb-3"
              style={{
                background: "rgba(47,143,118,0.25)",
                color: "#1A5240",
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: "0.5px",
              }}
            >
              SO SÁNH MINH BẠCH
            </span>
            <h2
              className="h3 fw-semibold mb-2 text-center"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Vì sao nên mua trực tiếp từ nhà phân phối?
            </h2>
            <p className="text-center mb-0" style={{ color: "#5B6B76" }}>
              So sánh giữa mua qua trung gian và mua trực tiếp từ LP Tech
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-md-6" data-aos="fade-right">
              <div
                className="p-4 p-xl-5 rounded-5 h-100 bg-white"
                style={{
                  border: "1px solid #E1E9E3",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  className="fw-semibold mb-4"
                  style={{ color: "#96A0A8", fontSize: "0.8rem", letterSpacing: "1px" }}
                >
                  MUA QUA TRUNG GIAN
                </div>
                <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                  {[
                    "Giá bị đội thêm qua nhiều lớp trung gian",
                    "Khó xác minh nguồn gốc, chất lượng sản phẩm",
                    "Thời gian giao hàng kéo dài qua nhiều khâu",
                    "Khó được hỗ trợ kỹ thuật khi có vấn đề phát sinh",
                  ].map((t) => (
                    <li key={t} className="d-flex align-items-start gap-3">
                      <BsXCircleFill
                        className="flex-shrink-0 mt-1"
                        size={18}
                        style={{ color: "#D9847C" }}
                      />
                      <span style={{ color: "#5B6B76", fontSize: ".92rem", lineHeight: 1.5 }}>
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-md-6" data-aos="fade-left" data-aos-delay="120">
              <div
                className="p-4 p-xl-5 rounded-5 h-100 text-white"
                style={{
                  background: "linear-gradient(135deg, #22684F 0%, #1A5240 100%)",
                  boxShadow: "0 20px 40px rgba(34,104,79,0.25)",
                }}
              >
                <div
                  className="fw-semibold mb-4"
                  style={{ color: "#7FD9BE", fontSize: "0.8rem", letterSpacing: "1px" }}
                >
                  MUA TRỰC TIẾP TỪ LP TECH
                </div>
                <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                  {[
                    "Giá sỉ trực tiếp từ nhà phân phối, không qua trung gian",
                    "Nguồn gốc rõ ràng, đầy đủ chứng từ CO/CQ",
                    "Giao hàng nhanh, ít khâu trung gian hơn",
                    "Đội ngũ kỹ thuật tư vấn và hỗ trợ trực tiếp",
                  ].map((t) => (
                    <li key={t} className="d-flex align-items-start gap-3">
                      <BsCheckCircleFill
                        className="flex-shrink-0 mt-1"
                        size={18}
                        style={{ color: "#7FD9BE" }}
                      />
                      <span className="text-white" style={{ opacity: 0.95, fontSize: ".92rem", lineHeight: 1.5 }}>
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}