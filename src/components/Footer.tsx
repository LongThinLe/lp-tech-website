import { Link, useLocation } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { SiGmail, SiZalo, SiShopee } from "react-icons/si";
import { useCompanySettings } from "../hooks/useCompanySettings";
import { mapEmbedSrc, mapOpenLink } from "../services/settingsService";

// Biểu tượng mạng xã hội: vòng tròn trắng, biểu tượng giữ màu thương hiệu
const iconCircle = (size: number): React.CSSProperties => ({
  width: size,
  height: size,
  borderRadius: "50%",
  background: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "0 2px 8px rgba(0,0,0,.18)",
  transition: "transform .2s ease",
});

export default function Footer() {
  const { pathname } = useLocation();
  const isContactPage = pathname === "/lien-he";
  const s = useCompanySettings();
  const phoneDigits = s.phone.replace(/\D/g, "");

  return (
    <footer>
      {!isContactPage && (
        <div className="bg-white py-4 border-bottom">
          <div className="container">
            <div className="support-card" style={{ maxWidth: 480 }}>
              <div className="rounded-circle flex-shrink-0" style={{ width: 56, height: 56, background: "#F1EDE4" }} />
              <div>
                <div className="fw-semibold" style={{ fontSize: ".95rem" }}>Cần tư vấn đặt hàng số lượng lớn?</div>
                <div style={{ fontSize: ".82rem", color: "#5B6B76" }}>{s.supportLine}</div>
              </div>
              <a href={`tel:${phoneDigits}`} className="btn btn-accent-solid ms-auto flex-shrink-0">
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
              <img src={s.logoFooter || "/logo-icon-gold.png"} alt="LP Tech" className="mb-2" style={{ height: 52 }} />
              <div style={{ fontSize: ".72rem", opacity: .8 }} className="mb-3">
                {s.companyName} · MST: {s.taxCode}
              </div>
              <div className="d-flex flex-column gap-2" style={{ fontSize: ".875rem" }}>
                <span className="d-flex align-items-start gap-2">
                  <FiMapPin size={14} className="mt-1 flex-shrink-0" />
                  {s.address}
                </span>
                <span className="d-flex align-items-center gap-2">
                  <FiPhone size={14} className="flex-shrink-0" /> {s.phone}
                </span>
                <span className="d-flex align-items-center gap-2">
                  <FiMail size={14} className="flex-shrink-0" /> {s.email}
                </span>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                {s.facebook && (
                  <a href={s.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" style={iconCircle(42)}><FaFacebookF size={20} color="#1877F2" /></a>
                )}
                <a href={`https://zalo.me/${phoneDigits}`} target="_blank" rel="noreferrer" aria-label="Zalo" style={iconCircle(42)}><SiZalo size={24} color="#0068FF" /></a>
                <a href={`mailto:${s.email}`} aria-label="Gmail" style={iconCircle(42)}><SiGmail size={20} color="#EA4335" /></a>
                {s.instagram && (
                  <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" style={iconCircle(42)}><FaInstagram size={22} color="#E4405F" /></a>
                )}
                {s.tiktok && (
                  <a href={s.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" style={iconCircle(42)}><FaTiktok size={19} color="#000" /></a>
                )}
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

            {s.shopee && (
              <div className="col-6 col-lg-2">
                <div className="fw-semibold text-white mb-3">Mua hàng online</div>
                <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: ".875rem" }}>
                  <li>
                    <a href={s.shopee} target="_blank" rel="noreferrer" className="d-inline-flex align-items-center gap-2 text-decoration-none" style={{ color: "inherit" }}>
                      <span style={iconCircle(30)}><SiShopee size={16} color="#EE4D2D" /></span>
                      Gian hàng Shopee
                    </a>
                  </li>
                </ul>
              </div>
            )}

            <div className="col-lg-5">
              <div className="fw-semibold text-white mb-3">Vị trí</div>
              <div className="d-flex gap-2 align-items-start">
                <div style={{ width: 220 }}>
                  <div className="rounded-3 overflow-hidden" style={{ border: "1px solid rgba(251,251,248,.15)", height: 160 }}>
                    <iframe title="Bản đồ công ty" width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={mapEmbedSrc(s)} />
                  </div>
                  <a
                    href={mapOpenLink(s)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none d-inline-block mt-2"
                    style={{ fontSize: ".75rem", color: "inherit", textDecoration: "underline" }}
                  >
                    Mở trong Google Maps
                  </a>
                </div>
                <a href={`mailto:${s.email}`} aria-label="Gửi email cho LP Tech" title="Gửi email cho LP Tech" className="d-flex align-items-center justify-content-center flex-shrink-0" style={{ height: 160 }}>
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
            <span>© 2026 {s.companyName}. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}