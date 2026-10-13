import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiPhone, FiClock, FiMail, FiX, FiChevronRight } from "react-icons/fi";
import { PiMagnifyingGlassBold } from "react-icons/pi";
import { useCategoryGroups } from "../services/categoryService";
import { useCompanySettings } from "../hooks/useCompanySettings";
import { getNews, formatNewsDate } from "../services/newsService";
import type { NewsPost } from "../services/newsService";

// Số bài tin tức mới nhất hiện trong menu thả xuống
const NEWS_MENU_COUNT = 6;

// Tải tin tức một lần cho cả phiên, các lần mở menu sau dùng lại — không tốn thêm lượt đọc Firebase
let newsPromise: Promise<NewsPost[]> | null = null;
const loadMenuNews = (): Promise<NewsPost[]> => {
  if (!newsPromise) {
    newsPromise = getNews()
      .then((list) => list.filter((p) => !p.hidden).slice(0, NEWS_MENU_COUNT))
      .catch(() => {
        newsPromise = null;
        return [];
      });
  }
  return newsPromise;
};

export default function Header() {
  const categoryGroups = useCategoryGroups();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [newsOpen, setNewsOpen] = useState(false);
  const [menuNews, setMenuNews] = useState<NewsPost[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const company = useCompanySettings();
  const phoneDigits = company.phone.replace(/\D/g, "");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/san-pham?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  useEffect(() => {
    let alive = true;
    loadMenuNews().then((list) => {
      if (alive) setMenuNews(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Thu gọn menu trên điện thoại (cái menu mở ra khi bấm 3 gạch)
  const collapseMobileNav = () => {
    const nav = document.getElementById("mainNav");
    if (nav && nav.classList.contains("show")) {
      nav.classList.remove("show");
      document.querySelector(".navbar-toggler")?.setAttribute("aria-expanded", "false");
    }
  };

  // Chuyển trang (kể cả sau khi tìm kiếm) thì tự đóng menu điện thoại
  useEffect(() => {
    collapseMobileNav();
  }, [location.pathname, location.search]);

  const closeMenu = () => {
    setMenuOpen(false);
    setHoveredCat(null);
  };

  // Đo chiều cao thật của nội dung menu 2 (danh mục con), để chuyển động mượt khi đổi nhóm —
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
      <style>{`
        .brand-wrap { gap: 12px; margin-right: 0; }
        .brand-logo { height: 52px; }

        .brand-name {
          font-weight: 800; color: #22684F; text-transform: uppercase;
          letter-spacing: .8px; line-height: 1.3; font-size: .82rem;
          border-left: 3px solid #2F8F76; padding-left: 10px; white-space: nowrap;
        }
        @media (min-width: 992px) and (max-width: 1199.98px) {
          .brand-name { font-size: .68rem; letter-spacing: .4px; padding-left: 8px; }
          .brand-logo { height: 46px; }
        }
        @media (max-width: 575.98px) {
          .brand-wrap { gap: 8px; }
          .brand-logo { height: 40px; }
          .brand-name { font-size: .62rem; letter-spacing: .4px; padding-left: 7px; border-left-width: 2px; }
        }
        .news-menu-item:hover { background: #E4F1EA; }
        @media (max-width: 359.98px) {
          .brand-name { font-size: .55rem; }
        }
      `}</style>

      <div className="top-bar py-2">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-none d-md-flex gap-4">
            <span className="d-flex align-items-center gap-2">
              <FiClock size={14} /> {company.workingHours}
            </span>
            <a href={`mailto:${company.email}`} className="d-flex align-items-center gap-2">
              <FiMail size={14} /> {company.email}
            </a>
          </div>
          <a href={`tel:${phoneDigits}`} className="d-flex align-items-center gap-2 fw-medium ms-auto ms-md-0">
            <FiPhone size={14} /> <span className="d-md-none">{company.phone}</span><span className="d-none d-md-inline">Hotline: {company.phone}</span>
          </a>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg bg-white border-bottom py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center brand-wrap">
            <img
              src={company.logoHeader || "/logo-icon.png"}
              alt="LP Tech"
              className="brand-logo"
            />

            <span className="brand-name">
              CÔNG TY TNHH<br />TM LP TECH
            </span>
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Mở menu">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse"
            id="mainNav"
            onClick={(e) => {
              // Bấm vào bất kỳ đường dẫn nào trong menu thì đóng menu luôn
              if ((e.target as HTMLElement).closest("a")) collapseMobileNav();
            }}
          >
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
                  <div className="position-absolute d-flex" style={{ top: "100%", left: 0, zIndex: 1000, alignItems: "flex-start" }}>
                    <div
                      className="bg-white rounded-3 p-2"
                      style={{ minWidth: 230, border: "1px solid #E1E9E3", boxShadow: "0 16px 40px rgba(0,0,0,.12)" }}
                    >
                      {categoryGroups.map((group) => (
                        <Link
                          key={group.id}
                          to={`/san-pham?nhom=${group.id}`}
                          onClick={closeMenu}
                          onMouseEnter={() => setHoveredCat(group.id)}
                          className="d-flex align-items-center justify-content-between px-3 py-2 rounded-2 text-decoration-none"
                          style={{
                            cursor: "pointer", fontSize: ".88rem",
                            background: hoveredCat === group.id ? "#E4F1EA" : "transparent",
                            color: hoveredCat === group.id ? "#22684F" : "#223028",
                            fontWeight: hoveredCat === group.id ? 600 : 400,
                          }}
                        >
                          <span className="flex-grow-1">{group.name}</span>
                          <FiChevronRight size={13} style={{ color: "#96A0A8", flexShrink: 0 }} />
                        </Link>
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
                          {categoryGroups.find((g) => g.id === hoveredCat)?.items.map((item) => (
                            <Link
                              key={item.id}
                              to={`/san-pham?cat=${item.id}`}
                              onClick={closeMenu}
                              className="d-block px-3 py-2 rounded-2 text-decoration-none"
                              style={{ fontSize: ".88rem", color: "#223028" }}
                            >
                              {item.name}
                            </Link>
                          ))}
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
              <li
                className="nav-item position-relative"
                onMouseEnter={() => setNewsOpen(true)}
                onMouseLeave={() => setNewsOpen(false)}
              >
                <Link
                  to="/tin-tuc"
                  className="nav-link px-3 position-relative"
                  style={{ color: newsOpen ? "#2F8F76" : undefined }}
                >
                  Tin tức
                  <span className="position-absolute" style={{ top: 0, right: -6, background: "#E1483D", color: "#fff", fontSize: ".55rem", fontWeight: 700, padding: "1px 5px", borderRadius: 20 }}>MỚI</span>
                </Link>

                {newsOpen && menuNews.length > 0 && (
                  <div
                    className="position-absolute d-none d-lg-block bg-white rounded-3 p-2"
                    style={{ top: "100%", left: 0, zIndex: 1000, width: 320, border: "1px solid #E1E9E3", boxShadow: "0 16px 40px rgba(0,0,0,.12)" }}
                  >
                    {menuNews.map((post) => (
                      <Link
                        key={post.id}
                        to={`/tin-tuc/${post.slug || post.id}`}
                        onClick={() => setNewsOpen(false)}
                        className="d-block px-3 py-2 rounded-2 text-decoration-none news-menu-item"
                        style={{ color: "#223028" }}
                      >
                        <span
                          style={{
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                            overflow: "hidden", fontSize: ".88rem", lineHeight: 1.35,
                          }}
                        >
                          {post.title}
                        </span>
                        <span style={{ fontSize: ".72rem", color: "#96A0A8" }}>{formatNewsDate(post.publishedAt)}</span>
                      </Link>
                    ))}
                    <div style={{ height: 1, background: "#E1E9E3", margin: "6px 8px" }} />
                    <Link
                      to="/tin-tuc"
                      onClick={() => setNewsOpen(false)}
                      className="d-block px-3 py-2 rounded-2 text-decoration-none fw-semibold"
                      style={{ fontSize: ".88rem", color: "#2F8F76" }}
                    >
                      Xem tất cả tin tức
                    </Link>
                  </div>
                )}
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