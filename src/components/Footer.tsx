import { Link, useLocation } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { SiGmail, SiZalo } from "react-icons/si";

export default function Footer() {
  const { pathname } = useLocation();
  const isContactPage = pathname === "/lien-he";

  return (
    <footer>
      {!isContactPage && (
        <div className="bg-white py-4 border-bottom">
          <div className="container">
            <div className="support-card" style={{ maxWidth: 480 }}>
              <div className="rounded-circle flex-shrink-0" style={{ width: 56, height: 56, background: "#F1EDE4" }} />
              <div>
                <div className="fw-semibold" style={{ fontSize: ".95rem" }}>Cần tư vấn đặt hàng số lượng lớn?</div>
                <div style={{ fontSize: ".82rem", color: "#5B6B76" }}>
                  Ms. Khánh Linh — Phụ trách kinh doanh · phản hồi trong 15 phút
                </div>
              </div>
              <a href="tel:0989766715" className="btn btn-accent-solid ms-auto flex-shrink-0">
                Gọi ngay
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="py-5" style={{ background: "linear-gradient(135deg, #16332A 0%, #1A4C3B 100%)", color: "rgba(251,251,248,.75)" }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3">
              <img src="/logo-icon-gold.png" alt="LP Tech" className="mb-2" style={{ height: 52 }} />
              <div style={{ fontSize: ".72rem", opacity: .8 }} className="mb-3">
                Công ty TNHH TM LP Tech · MST: 3604118169
              </div>
              <div className="d-flex flex-column gap-2" style={{ fontSize: ".875rem" }}>
                <span className="d-flex align-items-start gap-2">
                  <FiMapPin size={14} className="mt-1 flex-shrink-0" />
                  92, Tổ 17C, Khu phố 3, Phường Tam Hiệp, Thành phố Đồng Nai, Việt Nam
                </span>
                <span className="d-flex align-items-center gap-2">
                  <FiPhone size={14} className="flex-shrink-0" /> 0989 766 715
                </span>
                <span className="d-flex align-items-center gap-2">
                  <FiMail size={14} className="flex-shrink-0" /> lptechco.ltd@gmail.com
                </span>
              </div>

              <div className="d-flex gap-2 mt-4">
                <a href="https://www.facebook.com/linh.tau.503" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-icon"><FaFacebookF size={21} /></a>
                <a href="https://zalo.me/0989766715" target="_blank" rel="noreferrer" aria-label="Zalo" className="social-icon"><SiZalo size={24} /></a>
                <a href="mailto:lptechco.ltd@gmail.com" aria-label="Gmail" className="social-icon"><SiGmail size={21} /></a>
                <a href="#" aria-label="Instagram" className="social-icon"><FaInstagram size={22} /></a>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="fw-semibold text-white mb-3">Sản phẩm</div>
              <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: ".875rem" }}>
                <li><Link to="/san-pham" className="text-decoration-none" style={{ color: "inherit" }}>Vật tư đóng gói</Link></li>
                <li><Link to="/san-pham" className="text-decoration-none" style={{ color: "inherit" }}>Vật tư phòng thí nghiệm</Link></li>
                <li><Link to="/san-pham" className="text-decoration-none" style={{ color: "inherit" }}>Thiết bị đo</Link></li>
              </ul>
            </div>

            <div className="col-6 col-lg-2">
              <div className="fw-semibold text-white mb-3">Chính sách</div>
              <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: ".875rem" }}>
                <li><Link to="/dich-vu" className="text-decoration-none" style={{ color: "inherit" }}>Vận chuyển</Link></li>
                <li><Link to="/dich-vu" className="text-decoration-none" style={{ color: "inherit" }}>Đổi trả</Link></li>
                <li><Link to="/dich-vu" className="text-decoration-none" style={{ color: "inherit" }}>Bảo mật</Link></li>
              </ul>
            </div>

            <div className="col-lg-5">
              <div className="fw-semibold text-white mb-3">Vị trí</div>
              <div className="d-flex gap-2 align-items-start">
                <div style={{ width: 220 }}>
                  <div className="rounded-3 overflow-hidden" style={{ border: "1px solid rgba(251,251,248,.15)", height: 160 }}>
                    <iframe title="Bản đồ công ty" width="100%" height="100%" style={{ border: 0 }} loading="lazy" src="https://www.google.com/maps?q=92,%20T%E1%BB%95%2017C,%20Khu%20ph%E1%BB%91%203,%20Ph%C6%B0%E1%BB%9Dng%20Tam%20Hi%E1%BB%87p,%20%C4%90%E1%BB%93ng%20Nai&output=embed" />
                  </div>
                </div>
                <a href="mailto:lptechco.ltd@gmail.com" aria-label="Gửi email cho LP Tech" title="Gửi email cho LP Tech" className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ height: 160 }}>
                  <svg width="200" height="200" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="44" height="36" rx="6" fill="#fff" />
                    <path d="M2 12L24 27L46 12V38.5C46 40.43 44.43 42 42.5 42H41V16L24 29L7 16V42H5.5C3.57 42 2 40.43 2 38.5V12Z" fill="#EA4335" />
                    <path d="M2 12C2 8.69 4.69 6 8 6H9V21L2 15.8V12Z" fill="#FBBC04" />
                    <path d="M46 12C46 8.69 43.31 6 40 6H39V21L46 15.8V12Z" fill="#34A853" />
                    <path d="M9 6H39V21L24 32L9 21V6Z" fill="#4285F4" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(251,250,247,.12)", fontSize: ".8rem" }}>
            <span>© 2026 Công ty TNHH TM LP TECH. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}