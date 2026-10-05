import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { FiCheck, FiPhone, FiShare2, FiCheckCircle, FiShield, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getBrands } from "../services/brandService";
import type { Brand } from "../services/brandService";
import { getProducts } from "../services/productService";
import type { Product } from "../types";
import ProductInfoTabs from "../components/ProductInfoTabs";

const galleryTones = ["#DCEBE2", "#CDE4D8", "#E4F1EA", "#EEF4F0"];

export default function ProductDetailPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);

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

  if (loading) {
    return (
      <section className="py-5 bg-white text-center" style={{ minHeight: "70vh", color: "#96A0A8" }}>
        Đang tải sản phẩm...
      </section>
    );
  }

  // Tìm theo tên trong link (slug); không thấy thì thử theo mã cũ để link cũ vẫn mở được
  const p = products.find((prod) => prod.slug === id) ?? products.find((prod) => prod.id === id);
  if (!p) return <Navigate to="/san-pham" replace />;
  // Link cũ dạng mã ngẫu nhiên: tự chuyển sang link theo tên
  if (p.slug && id !== p.slug) return <Navigate to={`/san-pham/${p.slug}`} replace />;

  const brand = brands.find((b) => b.id === p.brandId);
  // "Liên quan" đúng nghĩa — ưu tiên cùng danh mục trước, thiếu thì bù bằng cùng hãng,
  // vẫn thiếu nữa mới lấy bất kỳ sản phẩm khác (để luôn đủ 3 sản phẩm nếu database có đủ)
  const sameCategory = products.filter((prod) => prod.id !== p.id && prod.categoryId === p.categoryId);
  // Chỉ so sánh hãng khi sản phẩm này CÓ hãng (brandId rỗng = không có hãng)
  const sameBrandOnly = p.brandId
    ? products.filter(
      (prod) => prod.id !== p.id && prod.brandId === p.brandId && prod.categoryId !== p.categoryId
    )
    : [];
  const others = products.filter(
    (prod) =>
      prod.id !== p.id &&
      prod.categoryId !== p.categoryId &&
      !sameBrandOnly.some((s) => s.id === prod.id)
  );
  const related = [...sameCategory, ...sameBrandOnly, ...others].slice(0, 3);

  const allImages = [p.image, ...(p.images ?? [])].filter(Boolean) as string[];

  const prevImage = () => setActiveImg((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImage = () => setActiveImg((i) => (i + 1) % allImages.length);

  return (
    <section className="py-5 bg-white" style={{ minHeight: "70vh" }}>
      <div className="container">
        <div style={{ fontSize: ".82rem", color: "#96A0A8" }} className="mb-4" data-aos="fade-up">
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Trang chủ</Link> /{" "}
          <Link to="/san-pham" style={{ color: "inherit", textDecoration: "none" }}>Sản phẩm</Link> /{" "}
          <span style={{ color: "#223028" }}>{p.name}</span>
        </div>

        <div className="row g-5">
          <div className="col-lg-6" data-aos="fade-right">
            <div
              className="rounded-4 position-relative overflow-hidden"
              style={{ aspectRatio: "1/1", background: allImages.length ? undefined : galleryTones[0], border: "1.5px solid #E1E9E3" }}
            >
              {allImages.length > 0 && (
                <img src={allImages[activeImg] ?? allImages[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Ảnh trước"
                    className="position-absolute d-flex align-items-center justify-content-center border-0 rounded-circle"
                    style={{
                      left: 12, top: "50%", transform: "translateY(-50%)",
                      width: 38, height: 38, background: "rgba(255,255,255,.9)", color: "#223028",
                      boxShadow: "0 4px 12px rgba(0,0,0,.15)", cursor: "pointer",
                    }}
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    aria-label="Ảnh sau"
                    className="position-absolute d-flex align-items-center justify-content-center border-0 rounded-circle"
                    style={{
                      right: 12, top: "50%", transform: "translateY(-50%)",
                      width: 38, height: 38, background: "rgba(255,255,255,.9)", color: "#223028",
                      boxShadow: "0 4px 12px rgba(0,0,0,.15)", cursor: "pointer",
                    }}
                  >
                    <FiChevronRight size={18} />
                  </button>
                </>
              )}
              {brand && (
                <span
                  className="position-absolute top-0 start-0 m-3 fw-medium"
                  style={{
                    fontSize: ".75rem",
                    padding: ".3rem .75rem",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.92)",
                    color: "#22684F",
                  }}
                >
                  {brand.name}
                </span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="row g-2 mt-1">
                {allImages.map((img, i) => (
                  <div className="col-3" key={i}>
                    <button
                      onClick={() => setActiveImg(i)}
                      className="rounded-3 w-100 p-0 border-0 overflow-hidden"
                      style={{
                        aspectRatio: "1/1",
                        cursor: "pointer",
                        outline: activeImg === i ? "2.5px solid #2F8F76" : "1.5px solid #E1E9E3",
                        outlineOffset: -1,
                        transition: "outline .15s ease",
                      }}
                      aria-label={`Xem ảnh ${i + 1}`}
                    >
                      <img src={img} alt={`${p.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-lg-6" data-aos="fade-left" data-aos-delay="120">
            {brand && (
              <div style={{ fontSize: ".8rem", color: "#2F8F76", fontWeight: 500 }} className="mb-2">
                {brand.name}
              </div>
            )}
            <h1 className="h2 fw-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {p.name}
            </h1>

            <div className="d-flex flex-wrap gap-2 mb-4">
              {p.standards.map((s) => (
                <span key={s} className="spec-chip" style={{ fontSize: ".78rem", padding: ".3rem .65rem" }}>{s}</span>
              ))}
            </div>



            <div className="d-flex gap-3 mb-4 align-items-center">
              <Link to="/lien-he" className="btn btn-accent-solid d-inline-flex align-items-center gap-2">
                <FiPhone /> Yêu cầu báo giá
              </Link>
              <a href="tel:0989766715" className="btn btn-outline-secondary">
                0989 766 715
              </a>
              <button
                type="button"
                onClick={async () => {
                  const shareData = {
                    title: p.name,
                    text: `${p.name} — LP Tech`,
                    url: window.location.href,
                  };
                  if (navigator.share) {
                    try {
                      await navigator.share(shareData);
                    } catch {
                      // Người dùng bấm hủy — không cần làm gì
                    }
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                style={{ borderColor: copied ? "#2F8F76" : undefined, color: copied ? "#22684F" : undefined }}
                aria-label="Chia sẻ sản phẩm"
              >
                {copied ? <FiCheckCircle /> : <FiShare2 />}
                {copied ? "Đã sao chép" : "Chia sẻ"}
              </button>
            </div>

            <div className="rounded-4 p-3 mb-3" style={{ border: "1px solid #E1E9E3" }}>
              <div className="d-flex align-items-center gap-2 mb-2" style={{ fontWeight: 600, fontSize: ".9rem" }}>
                <span
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(47,143,118,.1)", color: "#22684F" }}
                >
                  <FiShield size={16} />
                </span>
                Cam kết sản phẩm
              </div>
              <ul className="list-unstyled mb-0">
                {[
                  "Hàng chính hãng, nguồn gốc rõ ràng",
                  "Đóng gói đúng quy cách, kiểm tra trước khi giao",
                  "Hỗ trợ xuất hoá đơn VAT đầy đủ",
                ].map((t, i) => (
                  <li
                    key={t}
                    className="d-flex align-items-start gap-2 py-2"
                    style={{ fontSize: ".85rem", color: "#5B6B76", borderTop: i > 0 ? "1px dashed #E1E9E3" : "none" }}
                  >
                    <FiCheck className="text-signal flex-shrink-0 mt-1" size={14} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border rounded-4 p-3" style={{ borderColor: "#E1E9E3", background: "#E4F1EA" }}>
              <div style={{ fontSize: ".85rem", color: "#3D4A44" }}>
                Đặt số lượng lớn được chiết khấu thêm — liên hệ để nhận báo giá theo nhu cầu thực tế.
              </div>
            </div>

            <ProductInfoTabs
              tabs={[
                {
                  label: "Thông số kỹ thuật",
                  content: (
                    <ul className="list-unstyled mb-0">
                      {p.specs.map((s) => <li key={s}>• {s}</li>)}
                    </ul>
                  ),
                },
                {
                  label: "Hướng dẫn sử dụng",
                  content: p.usageGuide?.trim()
                    ? p.usageGuide
                    : "Liên hệ đội ngũ kỹ thuật LP Tech để được hướng dẫn cụ thể theo điều kiện sử dụng thực tế của bạn.",
                },
                {
                  label: "Chứng nhận chất lượng",
                  content: p.certification?.trim()
                    ? p.certification
                    : "Liên hệ để nhận đầy đủ chứng từ CO/CQ kèm theo lô hàng khi đặt mua.",
                },
              ]}
            />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid #E1E9E3" }}>
            <h2 className="h4 fw-semibold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }} data-aos="fade-up">
              Sản phẩm liên quan
            </h2>
            <div className="row g-4">
              {related.map((rp, idx) => {
                const rBrand = brands.find((b) => b.id === rp.brandId);
                return (
                  <div className="col-6 col-lg-3" key={rp.id} data-aos="fade-up" data-aos-delay={idx * 80}>
                    <Link
                      to={`/san-pham/${rp.slug || rp.id}`}
                      className="bg-white rounded-4 p-3 h-100 product-card d-block text-decoration-none"
                      style={{ color: "inherit", border: "1.5px solid #E1E9E3" }}
                    >
                      <div
                        className="rounded-3 mb-3 position-relative overflow-hidden"
                        style={{ aspectRatio: "1/1", background: rp.image ? undefined : galleryTones[idx % galleryTones.length] }}
                      >
                        {rp.image && (
                          <img src={rp.image} alt={rp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}
                        {rBrand && (
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
                            {rBrand.name}
                          </span>
                        )}
                      </div>
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {rp.standards.map((s) => (
                          <span key={s} className="spec-chip">{s}</span>
                        ))}
                      </div>
                      <div className="fw-medium" style={{ fontSize: ".9rem", lineHeight: 1.35 }}>
                        {rp.name}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}