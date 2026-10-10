import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getProducts } from "../services/productService";
import { getBrands } from "../services/brandService";
import { useCategoryGroups } from "../services/categoryService";
import type { Product } from "../types";
import type { Brand } from "../services/brandService";

// Thời gian giữa 2 lần tự trượt (mili giây)
const AUTO_SLIDE_MS = 3000;
const ALL_TAB = "all";

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const groups = useCategoryGroups();
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [paused, setPaused] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts()
      .then((data) => setFeaturedProducts(data.filter((p) => p.featured && !p.hidden)))
      .catch((err) => console.error("Lỗi tải sản phẩm nổi bật:", err));
    getBrands()
      .then((data) => setBrands(data))
      .catch((err) => console.error("Lỗi tải hãng phân phối:", err));
  }, []);

  // Chỉ hiện những nhóm lớn (cấp 1) thật sự có sản phẩm nổi bật
  const tabs = useMemo(() => {
    return groups
      .map((g) => {
        const ids = new Set(g.items.map((i) => i.id));
        return { id: g.id, name: g.name, count: featuredProducts.filter((p) => ids.has(p.categoryId)).length, ids };
      })
      .filter((t) => t.count > 0);
  }, [groups, featuredProducts]);

  // Nếu nhóm đang chọn không còn sản phẩm nào thì quay về "Tất cả"
  useEffect(() => {
    if (activeTab !== ALL_TAB && !tabs.some((t) => t.id === activeTab)) setActiveTab(ALL_TAB);
  }, [tabs, activeTab]);

  const shown = useMemo(() => {
    if (activeTab === ALL_TAB) return featuredProducts;
    const tab = tabs.find((t) => t.id === activeTab);
    return tab ? featuredProducts.filter((p) => tab.ids.has(p.categoryId)) : featuredProducts;
  }, [activeTab, tabs, featuredProducts]);

  // Đổi nhóm thì quay về đầu danh sách
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [activeTab]);

  // Kiểm tra danh sách có dài hơn khung nhìn không (để hiện nút mũi tên và tự trượt)
  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll(el.scrollWidth > el.clientWidth + 4);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, shown]);

  const step = () => {
    const el = scrollRef.current;
    if (!el) return 0;
    const first = el.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 16 : el.clientWidth * 0.9;
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = step();
    if (direction === "right" && el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction === "left" && el.scrollLeft <= 4) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      return;
    }
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  // Tự trượt mỗi 3 giây; tạm dừng khi khách rê chuột / chạm vào, hoặc khi máy bật "giảm chuyển động"
  useEffect(() => {
    if (!canScroll || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => scroll("right"), AUTO_SLIDE_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canScroll, paused, shown]);

  if (featuredProducts.length === 0) return null;

  const pillStyle = (active: boolean): CSSProperties => ({
    padding: "7px 16px",
    borderRadius: 999,
    border: `1.5px solid ${active ? "#2F8F76" : "#E1E9E3"}`,
    background: active ? "#2F8F76" : "#fff",
    color: active ? "#fff" : "#22684F",
    fontSize: ".85rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
    transition: "all .2s ease",
  });

  return (
    <section className="py-5" style={{ background: "#F7FAF8" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3" data-aos="fade-up">
          <h2 className="h3 fw-semibold mb-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Sản phẩm nổi bật
          </h2>
          {canScroll && (
            <div className="d-flex gap-2">
              <button onClick={() => scroll("left")} className="d-flex align-items-center justify-content-center rounded-circle border-0" style={{ width: 38, height: 38, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.1)", color: "#22684F" }} aria-label="Xem sản phẩm trước">
                <FiChevronLeft size={18} />
              </button>
              <button onClick={() => scroll("right")} className="d-flex align-items-center justify-content-center rounded-circle border-0" style={{ width: 38, height: 38, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.1)", color: "#22684F" }} aria-label="Xem sản phẩm tiếp theo">
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {tabs.length > 0 && (
          <div
            className="d-flex gap-2 mb-4"
            style={{ overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}
            data-aos="fade-up"
          >
            <button type="button" style={pillStyle(activeTab === ALL_TAB)} onClick={() => setActiveTab(ALL_TAB)}>
              Tất cả
            </button>
            {tabs.map((t) => (
              <button key={t.id} type="button" style={pillStyle(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
                {t.name}
              </button>
            ))}
          </div>
        )}

        <div
          ref={scrollRef}
          className="d-flex gap-3"
          style={{ overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4, scrollbarWidth: "none" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => window.setTimeout(() => setPaused(false), 4000)}
        >
          {shown.map((p, idx) => {
            const brand = brands.find((b) => b.id === p.brandId);
            return (
              <Link
                key={p.id}
                to={`/san-pham/${p.slug || p.id}`}
                className="bg-white rounded-4 p-3 product-card d-block text-decoration-none flex-shrink-0"
                style={{ color: "inherit", border: "1.5px solid #E1E9E3", width: 220, scrollSnapAlign: "start" }}
                data-aos="fade-up"
                data-aos-delay={Math.min(idx, 4) * 80}
              >
                <div className="rounded-3 mb-3 position-relative overflow-hidden" style={{ aspectRatio: "1/1", background: p.image ? undefined : "#CDE4D8" }}>
                  {p.image && (
                    <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  <span className="position-absolute top-0 start-0 m-2 fw-bold" style={{ fontSize: "1rem", color: "#F5C563", textShadow: "0 1px 3px rgba(0,0,0,.4)" }}>
                    ★
                  </span>
                  {brand && (
                    <span className="position-absolute top-0 end-0 m-2 fw-medium" style={{ fontSize: ".68rem", padding: ".2rem .55rem", borderRadius: 999, background: "rgba(255,255,255,.92)", color: "#22684F" }}>
                      {brand.name}
                    </span>
                  )}
                </div>
                <div className="fw-medium" style={{ fontSize: ".9rem", lineHeight: 1.35 }}>
                  {p.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}