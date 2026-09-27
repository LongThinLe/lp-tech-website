import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getProducts } from "../services/productService";
import { getBrands } from "../services/brandService";
import type { Product } from "../types";
import type { Brand } from "../services/brandService";

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts()
      .then((data) => setFeaturedProducts(data.filter((p) => p.featured && !p.hidden)))
      .catch((err) => console.error("Lỗi tải sản phẩm nổi bật:", err));
    getBrands()
      .then((data) => setBrands(data))
      .catch((err) => console.error("Lỗi tải hãng phân phối:", err));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.9;
    scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-5" style={{ background: "#F7FAF8" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-up">
          <h2 className="h3 fw-semibold mb-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Sản phẩm nổi bật
          </h2>
          {featuredProducts.length > 4 && (
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

        <div ref={scrollRef} className="d-flex gap-3" style={{ overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4, scrollbarWidth: "none" }}>
          {featuredProducts.map((p, idx) => {
            const brand = brands.find((b) => b.id === p.brandId);
            return (
              <Link
                key={p.id}
                to={`/san-pham/${p.id}`}
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