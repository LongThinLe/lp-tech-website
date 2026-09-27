import { Link } from "react-router-dom";
import { FiFileText, FiArrowLeft } from "react-icons/fi";

export default function NewsPage() {
  return (
    <section className="py-5 bg-white d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
      <div className="container text-center" style={{ maxWidth: 480 }}>
        <div
          className="d-flex align-items-center justify-content-center mx-auto mb-4 rounded-circle"
          style={{ width: 72, height: 72, background: "#E4F1EA", color: "#22684F" }}
        >
          <FiFileText size={30} />
        </div>
        <h1 className="h3 fw-semibold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Trang Tin tức đang được hoàn thiện
        </h1>
        <p className="mb-4" style={{ color: "#5B6B76" }}>
          LP Tech sẽ sớm cập nhật tin tức ngành, thông báo sản phẩm mới và các bài viết hữu ích tại đây.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/san-pham" className="btn btn-accent-solid">Xem sản phẩm</Link>
          <Link to="/" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
            <FiArrowLeft /> Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}