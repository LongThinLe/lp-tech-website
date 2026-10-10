import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  getNews,
  formatNewsDate,
  newsCover,
  newsExcerpt,
  type NewsPost,
} from "../services/newsService";

// Khu Tin tức ở trang chủ: 1 bài mới nhất to + 2 bài nhỏ bên cạnh. Chưa có bài nào thì ẩn cả khu.
export default function HomeNews() {
  const [posts, setPosts] = useState<NewsPost[]>([]);

  useEffect(() => {
    getNews()
      .then((l) => setPosts(l.filter((p) => !p.hidden).slice(0, 3)))
      .catch(() => setPosts([]));
  }, []);

  if (posts.length === 0) return null;

  const [main, ...rest] = posts;
  const mainCover = newsCover(main);

  return (
    <section className="py-5" style={{ background: "#fff" }}>
      <style>{`
        .home-news-card { transition: transform .2s ease, box-shadow .2s ease; }
        .home-news-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(34,48,40,.1); }
        .home-news-all {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 20px; border-radius: 999px;
          border: 1.5px solid #2F8F76; background: #fff; color: #22684F;
          font-weight: 600; font-size: .9rem; text-decoration: none;
          transition: background .2s ease, color .2s ease;
        }
        .home-news-all:hover { background: #2F8F76; color: #fff; }
        .home-news-clamp3 {
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .home-news-clamp2 {
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
      `}</style>

      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-up">
          <h2 className="h3 fw-semibold mb-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Tin tức mới nhất
          </h2>
          <Link to="/tin-tuc" className="home-news-all">
            Xem tất cả <FiArrowRight />
          </Link>
        </div>

        <div className="row g-4">
          {/* Bài mới nhất — thẻ lớn */}
          <div className="col-lg-7" data-aos="fade-up">
            <Link
              to={`/tin-tuc/${main.slug || main.id}`}
              className="home-news-card d-block bg-white rounded-4 p-3 h-100 text-decoration-none"
              style={{ color: "inherit", border: "1.5px solid #E1E9E3" }}
            >
              <div
                className="rounded-3 mb-3 position-relative overflow-hidden"
                style={{ aspectRatio: "16 / 9", background: "#E4F1EA" }}
              >
                {mainCover && (
                  <img src={mainCover} alt={main.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                )}
                <span
                  className="position-absolute top-0 start-0 m-3 fw-bold"
                  style={{ fontSize: ".72rem", padding: ".25rem .75rem", borderRadius: 999, background: "rgba(255,255,255,.92)", color: "#22684F" }}
                >
                  Mới nhất
                </span>
              </div>
              <div style={{ fontSize: ".78rem", color: "#96A0A8", marginBottom: 6 }}>{formatNewsDate(main.publishedAt)}</div>
              <h3
                className="fw-semibold"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.3rem", lineHeight: 1.35, color: "#223028", marginBottom: 8 }}
              >
                {main.title}
              </h3>
              <p className="home-news-clamp3" style={{ fontSize: ".9rem", color: "#5B6B76", lineHeight: 1.6, marginBottom: 12 }}>
                {newsExcerpt(main)}
              </p>
              <span style={{ color: "#2F8F76", fontWeight: 600, fontSize: ".88rem" }}>Đọc tiếp →</span>
            </Link>
          </div>

          {/* 2 bài nhỏ xếp dọc */}
          <div className="col-lg-5 d-flex flex-column gap-3">
            {rest.map((p, i) => {
              const cover = newsCover(p);
              return (
                <div key={p.id} className="flex-fill" data-aos="fade-up" data-aos-delay={(i + 1) * 100}>
                  <Link
                    to={`/tin-tuc/${p.slug || p.id}`}
                    className="home-news-card d-flex gap-3 bg-white rounded-4 p-3 h-100 text-decoration-none"
                    style={{ color: "inherit", border: "1.5px solid #E1E9E3" }}
                  >
                    <div
                      className="rounded-3 overflow-hidden flex-shrink-0"
                      style={{ width: 130, aspectRatio: "1 / 1", background: "#E4F1EA" }}
                    >
                      {cover && (
                        <img src={cover} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      )}
                    </div>
                    <div className="d-flex flex-column justify-content-center" style={{ minWidth: 0 }}>
                      <div style={{ fontSize: ".75rem", color: "#96A0A8", marginBottom: 4 }}>{formatNewsDate(p.publishedAt)}</div>
                      <h3
                        className="home-news-clamp2 fw-semibold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1rem", lineHeight: 1.35, color: "#223028", marginBottom: 8 }}
                      >
                        {p.title}
                      </h3>
                      <span style={{ color: "#2F8F76", fontWeight: 600, fontSize: ".85rem" }}>Đọc tiếp →</span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}