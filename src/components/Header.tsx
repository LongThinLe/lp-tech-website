import { useState, useMemo, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FiPhone, FiClock, FiMail, FiX, FiChevronRight } from "react-icons/fi";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { categoryGroups } from "../data/mockData";
import { getProducts } from "../services/productService";
import { getBrands } from "../services/brandService";
import type { Brand } from "../services/brandService";

const allCategories = categoryGroups.flatMap((g) => g.items);

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const navigate = useNavigate();

  // Lấy dữ liệu sản phẩm + hãng phân phối THẬT từ Firebase — dùng để tính đúng
  // hãng nào thật sự có sản phẩm trong từng danh mục (cho menu lồng "Sản phẩm")
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi tải sản phẩm từ Firebase:", err));
    getBrands()
      .then((data) => setBrands(data))
      .catch((err) => console.error("Lỗi tải hãng phân phối từ Firebase:", err));
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/san-pham?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  const brandsForCategory = useMemo(() => {
    const map: Record<string, Brand[]> = {};
    allCategories.forEach((cat) => {
      const brandIdsInCat = new Set(
        products.filter((p) => p.categoryId === cat.id).map((p) => p.brandId)
      );
      map[cat.id] = brands.filter((b) => brandIdsInCat.has(b.id));
    });
    return map;
  }, [products, brands]);

  const closeMenu = () => {
    setMenuOpen(false);
    setHoveredCat(null);
  };

  // Đo chiều cao thật của nội dung menu 2 (thương hiệu), để chuyển động mượt khi đổi danh mục —
  // đúng kỹ thuật đã dùng cho tab "Thông số kỹ thuật" ở trang Chi tiết sản phẩm
  const panel2ContentRef = useRef<HTMLDivElement>(null);
  const [panel2Height, setPanel2Height] = useState(0);

  useLayoutEffect(() => {
    if (hoveredCat && panel2ContentRef.current) {
      setPanel2Height(panel2ContentRef.current.scrollHeight);
    } else {
      setPanel2Height(0);
    }
  }, [hoveredCat]);

  return (
    <header className="sticky-top">
      <div className="top-bar py-2">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-none d-md-flex gap-4">
            <span className="d-flex align-items-center gap-2">
              <FiClock size={14} /> Thứ 2 – 7: 07:00–11:30 &amp; 13:00–16:30
            </span>
            <a href="mailto:lptechco.ltd@gmail.com" className="d-flex align-items-center gap-2">
              <FiMail size={14} /> lptechco.ltd@gmail.com
            </a>
          </div>
          <a href="tel:0989766715" className="d-flex align-items-center gap-2 fw-medium ms-auto ms-md-0">
            <FiPhone size={14} /> <span className="d-md-none">0989 766 715</span><span className="d-none d-md-inline">Hotline: 0989 766 715</span>
          </a>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg bg-white border-bottom py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img src="/logo-icon.png" alt="LP Tech" height={52} />
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <li className="nav-item">
                <Link to="/" className="nav-link px-3">Trang chủ</Link>
              </li>
              <li className="nav-item">
                <Link to="/gioi-thieu" className="nav-link px-3">Giới thiệu</Link>
              </li>

              <li
                className="nav-item position-relative"
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={closeMenu}
              >
                <Link to="/san-pham" className="nav-link px-3" style={{ color: menuOpen ? "#2F8F76" : undefined }}>
                  Sản phẩm
                </Link>

                {menuOpen && (
                  <div className="position-absolute d-flex" style={{ top: "100%", left: 0, zIndex: 1000 }}>
                    <div
                      className="bg-white rounded-3 p-2"
                      style={{ minWidth: 230, border: "1px solid #E1E9E3", boxShadow: "0 16px 40px rgba(0,0,0,.12)" }}
                    >
                      {allCategories.map((cat) => (
                        <div
                          key={cat.id}
                          onMouseEnter={() => setHoveredCat(cat.id)}
                          className="d-flex align-items-center justify-content-between px-3 py-2 rounded-2"
                          style={{
                            cursor: "pointer", fontSize: ".88rem",
                            background: hoveredCat === cat.id ? "#E4F1EA" : "transparent",
                            color: hoveredCat === cat.id ? "#22684F" : "#223028",
                            fontWeight: hoveredCat === cat.id ? 600 : 400,
                          }}
                        >
                          <Link to={`/san-pham?cat=${cat.id}`} className="text-decoration-none flex-grow-1" style={{ color: "inherit" }} onClick={closeMenu}>
                            {cat.name}
                          </Link>
                          <FiChevronRight size={13} style={{ color: "#96A0A8", flexShrink: 0 }} />
                        </div>
                      ))}
                      <div style={{ height: 1, background: "#E1E9E3", margin: "6px 8px" }} />
                      <Link
                        to="/san-pham"
                        onClick={closeMenu}
                        className="d-block px-3 py-2 rounded-2 text-decoration-none fw-semibold"
                        style={{ fontSize: ".88rem", color: "#2F8F76" }}
                      >
                        Tất cả sản phẩm
                      </Link>
                    </div>

                    {hoveredCat && (
                      <div
                        className="bg-white rounded-3 ms-2 overflow-hidden"
                        style={{
                          minWidth: 200, border: "1px solid #E1E9E3", boxShadow: "0 16px 40px rgba(0,0,0,.12)",
                          height: panel2Height, transition: "height .22s ease",
                        }}
                      >
                        <div ref={panel2ContentRef} className="p-2">
                          {brandsForCategory[hoveredCat]?.length > 0 ? (
                            brandsForCategory[hoveredCat].map((b) => (
                              <Link
                                key={b.id}
                                to={`/san-pham?cat=${hoveredCat}&brand=${b.id}`}
                                onClick={closeMenu}
                                className="d-block px-3 py-2 rounded-2 text-decoration-none"
                                style={{ fontSize: ".88rem", color: "#223028" }}
                              >
                                {b.name}
                              </Link>
                            ))
                          ) : (
                            <div className="px-3 py-2" style={{ fontSize: ".82rem", color: "#96A0A8" }}>
                              Chưa có hãng cụ thể
                            </div>
                          )}
                          <div style={{ height: 1, background: "#E1E9E3", margin: "6px 8px" }} />
                          <Link
                            to={`/san-pham?cat=${hoveredCat}`}
                            onClick={closeMenu}
                            className="d-block px-3 py-2 rounded-2 text-decoration-none fst-italic"
                            style={{ fontSize: ".85rem", color: "#5B6B76" }}
                          >
                            Thương hiệu khác
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>

              <li className="nav-item">
                <Link to="/dich-vu" className="nav-link px-3">
                  Dịch vụ
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/tin-tuc" className="nav-link px-3 position-relative">
                  Tin tức
                  <span className="position-absolute" style={{ top: 0, right: -6, background: "#E1483D", color: "#fff", fontSize: ".55rem", fontWeight: 700, padding: "1px 5px", borderRadius: 20 }}>MỚI</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/lien-he" className="nav-link px-3">Liên hệ</Link>
              </li>
            </ul>

            <form onSubmit={submitSearch} className="d-flex align-items-center ms-lg-3 mt-3 mt-lg-0 search-box">
              <div className={`search-box__inner ${searchOpen ? "search-box__inner--open" : ""}`}>
                <PiMagnifyingGlassBold size={17} className="search-box__icon flex-shrink-0" onClick={() => setSearchOpen(true)} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Tìm sản phẩm..."
                  className="search-box__input"
                />
                {searchOpen && (
                  <button type="button" className="search-box__close" onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Đóng tìm kiếm">
                    <FiX size={16} />
                  </button>
                )}
              </div>
            </form>

            <Link to="/lien-he" className="btn btn-accent-solid ms-lg-3 mt-3 mt-lg-0">
              Yêu cầu báo giá
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}