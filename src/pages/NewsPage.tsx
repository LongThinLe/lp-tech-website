import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getNews,
  formatNewsDate,
  newsCover,
  newsExcerpt,
  type NewsPost,
} from "../services/newsService";

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then((l) => setPosts(l.filter((p) => !p.hidden)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#F7FAF8", minHeight: "60vh" }}>
      <div className="container py-5">
        <div style={{ fontSize: 13, color: "#96A0A8", marginBottom: 12 }}>
          <Link to="/" style={{ color: "#96A0A8", textDecoration: "none" }}>
            Trang chủ
          </Link>{" "}
          › Tin tức
        </div>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 34,
            color: "#223028",
            marginBottom: 6,
          }}
        >
          Tin tức
        </h1>
        <p style={{ color: "#5B6B76", marginBottom: 28 }}>
          Cập nhật mới nhất từ LP Tech
        </p>

        {loading ? (
          <p style={{ color: "#5B6B76" }}>Đang tải...</p>
        ) : posts.length === 0 ? (
          <p style={{ color: "#5B6B76" }}>Chưa có bài viết nào.</p>
        ) : (
          <div className="row g-4">
            {posts.map((p) => {
              const cover = newsCover(p);
              return (
                <div key={p.id} className="col-12 col-sm-6 col-lg-4">
                  <Link
                    to={`/tin-tuc/${p.slug || p.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #E1E9E3",
                        borderRadius: 14,
                        overflow: "hidden",
                        height: "100%",
                      }}
                    >
                      <div
                        style={{
                          aspectRatio: "16 / 10",
                          background: "#E4F1EA",
                        }}
                      >
                        {cover && (
                          <img
                            src={cover}
                            alt={p.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ padding: "16px 18px 18px" }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#96A0A8",
                            marginBottom: 6,
                          }}
                        >
                          {formatNewsDate(p.publishedAt)}
                        </div>
                        <h3
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 17,
                            lineHeight: 1.35,
                            color: "#223028",
                            marginBottom: 8,
                          }}
                        >
                          {p.title}
                        </h3>
                        <p
                          style={{
                            fontSize: 14,
                            color: "#5B6B76",
                            lineHeight: 1.55,
                            marginBottom: 12,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {newsExcerpt(p)}
                        </p>
                        <span
                          style={{
                            color: "#2F8F76",
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Xem thêm →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}