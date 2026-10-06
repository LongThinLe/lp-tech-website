import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCategoryGroups } from "../services/categoryService";
import { getBrands } from "../services/brandService";
import type { Brand } from "../services/brandService";
import { getProducts } from "../services/productService";
import type { Product } from "../types";

const thumbTones = ["#CDE4D8", "#DCEBE2", "#E4F1EA", "#EEF4F0"];

export default function ProductsPage() {
  const categoryGroups = useCategoryGroups();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get("cat");
  const activeBrand = searchParams.get("brand");
  const query = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data.filter((p) => !p.hidden)))
      .catch((err) => console.error("Lỗi tải sản phẩm từ Firebase:", err))
      .finally(() => setLoading(false));
  }, []);

  const [brands, setBrands] = useState<Brand[]>([]);
  useEffect(() => {
    getBrands()
      .then((data) => setBrands(data))
      .catch((err) => console.error("Lỗi tải hãng phân phối từ Firebase:", err));
  }, []);

  let filtered = activeCat ? products.filter((p) => p.categoryId === activeCat) : products;
  if (activeBrand) {
    filtered = filtered.filter((p) => p.brandId === activeBrand);
  }
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  const activeCatName = activeCat
    ? categoryGroups.flatMap((g) => g.items).find((i) => i.id === activeCat)?.name
    : null;

  const heading = query.trim() ? `Kết quả cho "${query.trim()}"` : activeCatName ?? "Tất cả sản phẩm";

  const selectCategory = (id: string | null) => {
    const next: Record<string, string> = {};
    if (id) next.cat = id;
    if (activeBrand) next.brand = activeBrand;
    if (query.trim()) next.q = query.trim();
    setSearchParams(next);
  };

  return (
    <section className="py-5 bg-white" style={{ minHeight: "70vh" }}>
      <div className="container">
        <div style={{ fontSize: ".82rem", color: "#96A0A8" }} className="mb-3" data-aos="fade-up">
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Trang chủ</Link> / <span style={{ color: "#223028" }}>Sản phẩm</span>
        </div>

        <div className="mb-4" data-aos="fade-up">
          <h1 className="h3 fw-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {heading}
          </h1>
          <p className="mb-0" style={{ color: "#5B6B76" }}>{filtered.length} sản phẩm</p>
        </div>

        <div className="d-lg-none mb-4" data-aos="fade-up">
          <div className="d-flex gap-2 overflow-auto pb-2" style={{ WebkitOverflowScrolling: "touch" }}>
            <button
              onClick={() => selectCategory(null)}
              className="flex-shrink-0 border-0 rounded-pill px-3 py-2"
              style={{
                fontSize: ".82rem",
                whiteSpace: "nowrap",
                color: !activeCat ? "#22684F" : "#5B6B76",
                background: !activeCat ? "#E4F1EA" : "#F1F1EE",
                fontWeight: !activeCat ? 600 : 400,
              }}
            >
              Tất cả
            </button>
            {categoryGroups.flatMap((g) => g.items).map((item) => {
              const isActive = activeCat === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => selectCategory(item.id)}
                  className="flex-shrink-0 border-0 rounded-pill px-3 py-2"
                  style={{
                    fontSize: ".82rem",
                    whiteSpace: "nowrap",
                    color: isActive ? "#22684F" : "#5B6B76",
                    background: isActive ? "#E4F1EA" : "#F1F1EE",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-3 d-none d-lg-block">
            <div className="bg-white border rounded-4 p-3" style={{ borderColor: "#E1E9E3" }}>
              <button
                onClick={() => selectCategory(null)}
                className="d-block w-100 text-start border-0 bg-transparent text-decoration-none py-1 px-2 rounded-2 mb-3 fw-semibold"
                style={{
                  fontSize: ".85rem",
                  color: !activeCat ? "#22684F" : "#223028",
                  background: !activeCat ? "#E4F1EA" : "transparent",
                }}
              >
                Tất cả sản phẩm
              </button>

              {categoryGroups.map((group) => (
                <div key={group.id} className="mb-3">
                  <div className="fw-semibold mb-2" style={{ fontSize: ".85rem", color: "#223028" }}>
                    {group.name}
                  </div>
                  <ul className="list-unstyled d-flex flex-column gap-1 mb-0">
                    {group.items.map((item) => {
                      const isActive = activeCat === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => selectCategory(item.id)}
                            className="d-block w-100 text-start border-0 text-decoration-none py-1 px-2 rounded-2"
                            style={{
                              fontSize: ".85rem",
                              color: isActive ? "#22684F" : "#5B6B76",
                              background: isActive ? "#E4F1EA" : "transparent",
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {item.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-9">
            {loading ? (
              <div className="text-center py-5" style={{ color: "#96A0A8" }}>Đang tải sản phẩm...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-5" style={{ color: "#96A0A8" }} data-aos="fade-up">
                {query.trim()
                  ? `Không tìm thấy sản phẩm nào khớp với "${query.trim()}".`
                  : "Chưa có sản phẩm nào trong danh mục này."}
              </div>
            ) : (
              <div className="row g-4">
                {filtered.map((p, idx) => {
                  const brand = brands.find((b) => b.id === p.brandId);
                  return (
                    <div className="col-6 col-md-4" key={p.id} data-aos="fade-up" data-aos-delay={(idx % 4) * 80}>
                      <Link
                        to={`/san-pham/${p.slug || p.id}`}
                        className="bg-white rounded-4 p-3 h-100 product-card d-block text-decoration-none"
                        style={{ color: "inherit", border: "1.5px solid #E1E9E3" }}
                      >
                        <div
                          className="rounded-3 mb-3 position-relative overflow-hidden"
                          style={{ aspectRatio: "1/1", background: p.image ? undefined : thumbTones[idx % thumbTones.length] }}
                        >
                          {p.image ? (
                            <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : null}
                          {brand && (
                            <span
                              className="position-absolute top-0 start-0 m-2 fw-medium"
                              style={{
                                fontSize: ".68rem",
                                padding: ".2rem .55rem",
                                borderRadius: 999,
                                background: "rgba(255,255,255,.92)",
                                color: "#22684F",
                              }}
                            >
                              {brand.name}
                            </span>
                          )}
                        </div>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {p.standards?.map((s) => (
                            <span key={s} className="spec-chip">{s}</span>
                          ))}
                        </div>
                        <div className="fw-medium" style={{ fontSize: ".9rem", lineHeight: 1.35 }}>
                          {p.name}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}