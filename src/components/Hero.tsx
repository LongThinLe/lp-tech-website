import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiHeadphones, FiUsers, FiTruck, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useCategoryGroups } from "../services/categoryService";

const heroImages = [
  "/hero-warehouse.jpg",
  "/about-warehouse.jpg",
  "/hero-bangkeo-1.jpg",
  "/hero-bangkeo-2.jpg",
  "/hero-lab.jpg",
  "/hero-pallet.jpg",
];

const brandLogos = [
  { src: "/brand-nano.png", alt: "Nano" },
  { src: "/brand-3m.png", alt: "3M" },
  { src: "/brand-wonderland.png", alt: "Wonderland" },
  { src: "/brand-daiduong.png", alt: "Băng Keo Đại Dương" },
];

// Số danh mục lớn hiện sẵn, và số thẻ mở thêm mỗi lần bấm "Xem thêm".
// Dùng số chia hết cho 6, 3, 2 (số thẻ mỗi hàng) để hàng luôn đầy.
const CATEGORY_PREVIEW = 6;
const CATEGORY_STEP = 6;

export default function Hero() {
  const categoryGroups = useCategoryGroups();
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(CATEGORY_PREVIEW);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const hiddenCount = Math.max(0, categoryGroups.length - visibleCount);
  const visibleGroups = categoryGroups.slice(0, visibleCount);
  const expanded = visibleCount > CATEGORY_PREVIEW;

  return (
    <>
      <style>{`
        @keyframes catFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .cat-more-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 24px; border-radius: 999px;
          border: 1.5px solid #2F8F76; background: #fff; color: #22684F;
          font-weight: 600; font-size: .9rem; cursor: pointer;
          transition: background .2s ease, color .2s ease, box-shadow .2s ease;
        }
        .cat-more-btn:hover { background: #2F8F76; color: #fff; box-shadow: 0 8px 20px rgba(47,143,118,.25); }
      `}</style>

      <section className="py-5 position-relative overflow-hidden">
        <div className="position-absolute" style={{ inset: 0, zIndex: 0 }}>
          {heroImages.map((src, i) => (
            <div
              key={src}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url('${src}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: i === current ? 1 : 0,
                transition: "opacity 1.4s ease",
              }}
            />
          ))}
        </div>

        <div
          className="position-absolute"
          style={{
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(90deg, rgba(251,251,248,.78) 0%, rgba(251,251,248,.42) 38%, rgba(34,48,40,.1) 100%)",
          }}
        />

        <div className="container py-4 py-lg-5 position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <span
                className="spec-chip mb-3"
                style={{
                  background: "rgba(47,143,118,.28)",
                  borderColor: "rgba(47,143,118,.6)",
                  color: "#1A5240",
                  fontWeight: 700,
                }}
              >
                NHÀ CUNG CẤP SỈ &amp; LẺ
              </span>
              <h1
                className="display-4 fw-bold mt-3 mb-4"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1.18,
                  textShadow: "0 2px 16px rgba(251,251,248,.9), 0 1px 4px rgba(251,251,248,.95)",
                }}
              >
                Vật tư đóng gói &amp;{" "}
                <span className="text-signal">thiết bị phòng thí nghiệm</span>
              </h1>
              <p
                className="fs-5 mb-4"
                style={{
                  color: "#3D4A44",
                  fontWeight: 600,
                  maxWidth: 480,
                  textShadow: "0 2px 12px rgba(251,251,248,.9), 0 1px 3px rgba(251,251,248,.95)",
                }}>
                Cung cấp màng co, màng PE, dây đai, băng keo, pallet và dụng cụ,
                vật tư tiêu hao phòng thí nghiệm — giá sỉ, giao hàng nhanh toàn quốc.
              </p>
              <div className="d-flex gap-3">
                <Link to="/san-pham" className="btn btn-accent-solid d-inline-flex align-items-center gap-2">
                  Xem sản phẩm <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <div className="brand-marquee">
            <div className="brand-marquee__track">
              {[0, 1, 2, 3, 4, 5].map((rep) => (
                <div key={rep} className="d-flex align-items-center" style={{ gap: "4rem" }}>
                  {brandLogos.map((brand) => (
                    <img key={brand.src} src={brand.src} alt={brand.alt} className="brand-marquee__logo" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 border-bottom bg-white">
        <div className="container">
          <div className="row g-4">
            {[
              { icon: <FiTruck />, title: "Giao hàng nhanh toàn quốc", desc: "Đóng gói đạt chuẩn, an toàn" },
              { icon: <FiUsers />, title: "Giá sỉ cho đại lý", desc: "Chiết khấu theo số lượng" },
              { icon: <FiHeadphones />, title: "Tư vấn tận tâm", desc: "Hỗ trợ chọn đúng vật tư" },
            ].map((t, i) => (
              <div className="col-md-4" key={t.title} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="trust-item">
                  <div className="trust-item__icon">{t.icon}</div>
                  <div>
                    <div className="trust-item__title">{t.title}</div>
                    <div className="trust-item__desc">{t.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <h2
            className="h3 fw-semibold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            data-aos="fade-up"
          >
            Danh mục sản phẩm
          </h2>
          <div className="row g-3">
            {visibleGroups.map((group, idx) => (
              <div
                className="col-6 col-md-4 col-lg-2"
                key={group.id}
                style={idx >= CATEGORY_PREVIEW ? { animation: `catFadeIn .45s ease ${(idx % CATEGORY_STEP) * 60}ms both` } : undefined}
                {...(idx < CATEGORY_PREVIEW ? { "data-aos": "fade-up", "data-aos-delay": idx * 60 } : {})}
              >
                <Link to={`/san-pham?nhom=${group.id}`} className="cat-block">
                  <div className="cat-block__label">{group.name}</div>
                  <div className="cat-block__count">{group.items.length} danh mục</div>
                </Link>
              </div>
            ))}
          </div>

          {(hiddenCount > 0 || expanded) && (
            <div className="text-center mt-4 d-flex justify-content-center gap-3 flex-wrap">
              {hiddenCount > 0 && (
                <button type="button" className="cat-more-btn" onClick={() => setVisibleCount((n) => n + CATEGORY_STEP)}>
                  Xem thêm {Math.min(CATEGORY_STEP, hiddenCount)} danh mục <FiChevronDown />
                </button>
              )}
              {expanded && (
                <button type="button" className="cat-more-btn" onClick={() => setVisibleCount(CATEGORY_PREVIEW)}>
                  Thu gọn <FiChevronUp />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}