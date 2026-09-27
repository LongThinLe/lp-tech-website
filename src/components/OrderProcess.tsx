import { Link } from "react-router-dom";
import { FiShoppingBag, FiSend, FiCheckCircle, FiTruck, FiPhoneCall, FiEdit3 } from "react-icons/fi";
import { SiZalo } from "react-icons/si";

export default function OrderProcess() {
  return (
    <>
      {/* Quy trình đặt hàng — 4 bước, kiểu vuông bo góc, viền mảnh */}
      <section className="py-5" style={{ background: "#fff" }}>
        <div className="container">
          <h2 className="h3 fw-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-aos="fade-up" >
            Quy trình đặt hàng đơn giản
          </h2>
          <p className="mb-5" style={{ color: "#5B6B76" }} data-aos="fade-up">
            Chỉ 4 bước để nhận được hàng đúng nhu cầu
          </p>

          <div className="row g-4">
            {[
              { icon: <FiShoppingBag />, step: "1", title: "Chọn sản phẩm", desc: "Duyệt danh mục hoặc tìm kiếm đúng vật tư cần dùng" },
              { icon: <FiSend />, step: "2", title: "Gửi yêu cầu báo giá", desc: "Điền form hoặc nhắn Zalo/hotline với số lượng cần" },
              { icon: <FiCheckCircle />, step: "3", title: "Xác nhận đơn hàng", desc: "Đội ngũ tư vấn xác nhận giá, số lượng và thời gian giao" },
              { icon: <FiTruck />, step: "4", title: "Giao hàng tận nơi", desc: "Đóng gói đạt chuẩn, giao nhanh toàn quốc" },
            ].map((s, i) => (
              <div className="col-6 col-lg-3" key={s.step} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="p-4 rounded-4 h-100 position-relative" style={{ border: "1.5px solid #B8CFC3" }}>
                  <span className="position-absolute d-flex align-items-center justify-content-center fw-bold" style={{ top: 12, right: 12, width: 22, height: 22, borderRadius: 6, background: "#E4F1EA", color: "#22684F", fontSize: ".7rem" }} >
                    {s.step}
                  </span>
                  <div className="mb-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, borderRadius: 12, background: "#2F8F76", color: "#fff", fontSize: "1.3rem" }} >
                    {s.icon}
                  </div>
                  <div className="fw-semibold mb-1">{s.title}</div>
                  <div style={{ fontSize: ".85rem", color: "#5B6B76" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hướng dẫn liên hệ đặt hàng — dành cho khách lần đầu ghé web, chưa biết bắt đầu từ đâu */}
      <section className="py-5" style={{ background: "#fff" }}>
        <div className="container">
          <div className="text-center mx-auto mb-5" style={{ maxWidth: 560 }} data-aos="fade-up">
            <span className="d-inline-block mb-3 fw-bold" style={{ fontFamily: "monospace", fontSize: "1.9rem", letterSpacing: ".02em", padding: ".45rem 1.3rem", borderRadius: 12, color: "#1A5240", background: "rgba(47,143,118,.22)", border: "1.5px solid rgba(47,143,118,.5)", }} >
              BẠN CẦN HỖ TRỢ?
            </span>
            <h2 className="h3 fw-semibold mt-3 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Không biết bắt đầu từ đâu? Chọn 1 trong 3 cách dưới đây
            </h2>
            <p className="mb-0" style={{ color: "#5B6B76" }}>
              Đội ngũ LP Tech luôn sẵn sàng hỗ trợ — chọn cách nào tiện nhất cho bạn.
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-4" data-aos="fade-up">
              <div className="p-4 rounded-4 h-100 position-relative text-white" style={{ background: "linear-gradient(135deg, #22684F 0%, #1A5240 100%)" }} >
                <span className="position-absolute fw-bold" style={{ top: -10, right: 16, background: "#E1483D", color: "#fff", fontSize: ".65rem", padding: "3px 10px", borderRadius: 20, }} >
                  NHANH NHẤT
                </span>
                <div className="d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 52, height: 52, background: "rgba(255,255,255,.15)" }} >
                  <FiPhoneCall size={22} />
                </div>
                <h3 className="h6 fw-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Gọi điện trực tiếp
                </h3>
                <p className="mb-3" style={{ fontSize: ".85rem", color: "rgba(255,255,255,.8)", lineHeight: 1.6 }}>
                  Trao đổi ngay với đội kinh doanh — phù hợp khi cần tư vấn gấp hoặc muốn hỏi chi tiết.
                </p>
                <a href="tel:0989766715" className="btn w-100 fw-semibold" style={{ background: "#fff", color: "#22684F", borderRadius: 999, fontSize: ".85rem" }} >
                  0989 766 715
                </a>
              </div>
            </div>

            <div className="col-md-4" data-aos="fade-up" data-aos-delay="80">
              <div className="p-4 rounded-4 h-100" style={{ border: "1.5px solid #E1E9E3" }}>
                <div className="d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 52, height: 52, background: "#E4F1EA", color: "#22684F" }} >
                  <FiEdit3 size={22} />
                </div>
                <h3 className="h6 fw-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Điền form liên hệ
                </h3>
                <p className="mb-3" style={{ fontSize: ".85rem", color: "#5B6B76", lineHeight: 1.6 }}>
                  Mô tả chi tiết nhu cầu, đội ngũ tư vấn sẽ phản hồi qua email/điện thoại trong 15 phút làm việc.
                </p>
                <Link to="/lien-he" className="btn w-100 fw-semibold" style={{ background: "#F1F1EE", color: "#223028", borderRadius: 999, fontSize: ".85rem" }} >
                  Đến form liên hệ
                </Link>
              </div>
            </div>

            <div className="col-md-4" data-aos="fade-up" data-aos-delay="160">
              <div className="p-4 rounded-4 h-100" style={{ border: "1.5px solid #E1E9E3" }}>
                <div className="d-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 52, height: 52, background: "#E4F1EA", color: "#22684F" }} >
                  <SiZalo size={20} />
                </div>
                <h3 className="h6 fw-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Nhắn tin qua Zalo
                </h3>
                <p className="mb-3" style={{ fontSize: ".85rem", color: "#5B6B76", lineHeight: 1.6 }}>
                  Gửi hình ảnh, mô tả nhu cầu thoải mái — tiện lợi, không cần gọi điện, phản hồi trong giờ làm việc.
                </p>
                <a href="https://zalo.me/0989766715" target="_blank" rel="noreferrer" className="btn w-100 fw-semibold" style={{ background: "#F1F1EE", color: "#223028", borderRadius: 999, fontSize: ".85rem" }} >
                  Mở Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}