import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getNews,
  formatNewsDate,
  newsCover,
  newsExcerpt,
  type NewsPost,
} from "../services/newsService";

const PAGE_SIZE = 9;

// Tạo dãy số trang, tự rút gọn bằng "…" khi có nhiều trang
function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export default function NewsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    getNews()
      .then((l) => setPosts(l.filter((p) => !p.hidden)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const requested = parseInt(searchParams.get("trang") || "1", 10);
  const page = Math.min(
    Math.max(Number.isNaN(requested) ? 1 : requested, 1),
    totalPages
  );
  const visible = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (n: number) => {
    setSearchParams(n === 1 ? {} : { trang: String(n) });
    window.scrollTo({ top: 0 });
  };

  const pageBtn = (active: boolean, disabled = false): React.CSSProperties => ({
    minWidth: 40,
    height: 40,
    padding: "0 12px",
    borderRadius: 10,
    border: active ? "1px solid #2F8F76" : "1px solid #E1E9E3",
    background: active ? "#2F8F76" : "#fff",
    color: active ? "#fff" : "#223028",
    fontWeight: active ? 700 : 500,
    fontSize: 14,
    opacity: disabled ? 0.45 : 1,
    cursor: disabled ? "default" : "pointer",
  });

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
          <>
            <div className="row g-4">
              {visible.map((p) => {
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

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 36,
                }}
              >
                <button
                  style={pageBtn(false, page === 1)}
                  disabled={page === 1}
                  onClick={() => goTo(page - 1)}
                >
                  ‹ Trước
                </button>
                {buildPages(page, totalPages).map((n, i) =>
                  n === "…" ? (
                    <span key={`dots-${i}`} style={{ color: "#96A0A8", padding: "0 4px" }}>
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      style={pageBtn(n === page)}
                      onClick={() => goTo(n)}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  style={pageBtn(false, page === totalPages)}
                  disabled={page === totalPages}
                  onClick={() => goTo(page + 1)}
                >
                  Sau ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}