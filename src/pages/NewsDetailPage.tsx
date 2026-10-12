import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getNews, formatNewsDate, newsExcerpt, type NewsPost } from "../services/newsService";
import { applySeo } from "../utils/seo";
import RichContent from "../components/RichContent";

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then((l) => setPosts(l.filter((p) => !p.hidden)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const post = posts.find((p) => p.slug === slug) || posts.find((p) => p.id === slug);
  const others = posts.filter((p) => p !== post).slice(0, 3);

  // SEO: tiêu đề, mô tả và từ khóa riêng cho từng bài (đặt TRƯỚC các return sớm)
  useEffect(() => {
    const cur = posts.find((p) => p.slug === slug) || posts.find((p) => p.id === slug);
    if (!cur) return;
    return applySeo({
      title: `${cur.title} | LP Tech`,
      description: newsExcerpt(cur),
      keywords: cur.seoKeywords,
    });
  }, [posts, slug]);

  if (loading) {
    return (
      <div className="container py-5" style={{ color: "#5B6B76" }}>
        Đang tải...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5">
        <p style={{ color: "#5B6B76" }}>Không tìm thấy bài viết.</p>
        <Link to="/tin-tuc" style={{ color: "#2F8F76", fontWeight: 600 }}>
          ← Quay lại Tin tức
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#F7FAF8" }}>
      <div className="container py-5" style={{ maxWidth: 860 }}>
        <div style={{ fontSize: 13, color: "#96A0A8", marginBottom: 14 }}>
          <Link to="/" style={{ color: "#96A0A8", textDecoration: "none" }}>
            Trang chủ
          </Link>{" "}
          ›{" "}
          <Link to="/tin-tuc" style={{ color: "#96A0A8", textDecoration: "none" }}>
            Tin tức
          </Link>{" "}
          › {post.title}
        </div>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 34,
            lineHeight: 1.25,
            color: "#223028",
            marginBottom: 10,
          }}
        >
          {post.title}
        </h1>
        <div style={{ fontSize: 13, color: "#96A0A8", marginBottom: 24 }}>
          Ngày đăng: {formatNewsDate(post.publishedAt)}
        </div>

        {post.blocks.map((b) =>
          b.type === "text" ? (
            <div
              key={b.id}
              style={{
                lineHeight: 1.75,
                fontSize: 16,
                color: "#223028",
                marginBottom: 18,
              }}
            >
              <RichContent text={b.text} />
            </div>
          ) : (
            <img
              key={b.id}
              src={b.url}
              alt=""
              style={{
                width: "100%",
                borderRadius: 14,
                display: "block",
                marginBottom: 18,
              }}
            />
          )
        )}

        {others.length > 0 && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E1E9E3",
              borderRadius: 14,
              padding: "20px 22px",
              marginTop: 28,
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                marginBottom: 12,
              }}
            >
              Bài viết khác
            </h3>
            {others.map((o) => (
              <div key={o.id} style={{ padding: "6px 0" }}>
                <Link
                  to={`/tin-tuc/${o.slug || o.id}`}
                  style={{ color: "#2F8F76", textDecoration: "none" }}
                >
                  • {o.title}
                </Link>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <Link
            to="/tin-tuc"
            style={{ color: "#2F8F76", fontWeight: 600, textDecoration: "none" }}
          >
            ← Quay lại Tin tức
          </Link>
        </div>
      </div>
    </div>
  );
}