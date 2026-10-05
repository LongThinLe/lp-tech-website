import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { FiGrid, FiLayers, FiBriefcase, FiMessageSquare, FiSettings, FiFileText } from "react-icons/fi";
import { subscribeToLeads } from "../services/leadService";

const navItems = [
  { to: "/admin", label: "Tổng quan & Sản phẩm", icon: <FiGrid />, exact: true },
  { to: "/admin/danh-muc", label: "Danh mục", icon: <FiLayers /> },
  { to: "/admin/hang-phan-phoi", label: "Hãng phân phối", icon: <FiBriefcase /> },
  { to: "/admin/yeu-cau-bao-gia", label: "Yêu cầu báo giá", icon: <FiMessageSquare /> },
  { to: "/admin/tin-tuc", label: "Tin tức", icon: <FiFileText /> },
  { to: "/admin/thiet-lap", label: "Thiết lập thông tin", icon: <FiSettings /> },
];

export default function AdminLayout() {
  const location = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [unreadLeads, setUnreadLeads] = useState(0);

  // Đếm số yêu cầu báo giá chưa đọc — "luôn lắng nghe" giống Zalo/Messenger,
  // tự động cập nhật ngay khi có khách gửi form mới, không cần chuyển trang
  useEffect(() => {
    const unsubscribe = subscribeToLeads((leads) => {
      setUnreadLeads(leads.filter((l) => !l.read).length);
    });
    return () => unsubscribe(); // hủy lắng nghe khi rời trang, tránh rò rỉ bộ nhớ
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#FBFBF8" }}>
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          background: "linear-gradient(180deg, #1B2E27 0%, #14231D 100%)",
          color: "rgba(255,255,255,.7)",
          padding: "22px 14px",
          position: "relative",
        }}
      >
        <div className="d-flex align-items-center gap-2 px-2 pb-4">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, #4FBF9A, #2F8F76)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              color: "#fff",
              fontSize: ".9rem",
            }}
          >
            LP
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#fff" }}>
            Tech Admin
          </div>
        </div>

        {navItems.map((item) => {
          const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
          const isLeadsItem = item.to === "/admin/yeu-cau-bao-gia";
          return (
            <Link
              key={item.to}
              to={item.to}
              className="d-flex align-items-center gap-2 text-decoration-none mb-1"
              style={{
                padding: "11px 12px",
                borderRadius: 11,
                fontSize: ".85rem",
                fontWeight: 500,
                color: isActive ? "#fff" : "rgba(255,255,255,.7)",
                background: isActive ? "linear-gradient(135deg, #2F8F76, #22684F)" : "transparent",
                boxShadow: isActive ? "0 4px 14px rgba(47,143,118,.4)" : "none",
                transition: "background .15s ease, color .15s ease",
              }}
            >
              {item.icon} {item.label}
              {isLeadsItem && unreadLeads > 0 && (
                <span
                  className="d-flex align-items-center justify-content-center rounded-pill fw-bold ms-auto"
                  style={{
                    background: "#E1483D", color: "#fff", fontSize: ".68rem",
                    minWidth: 18, height: 18, padding: "0 5px",
                  }}
                >
                  {unreadLeads}
                </span>
              )}
            </Link>
          );
        })}

        <div
          onClick={() => signOut({ redirectUrl: "/admin/login" })}
          className="position-absolute d-flex align-items-center gap-2"
          style={{ bottom: 20, left: 14, right: 14, padding: 10, borderRadius: 12, background: "rgba(255,255,255,.06)", cursor: "pointer" }}
          title="Bấm để đăng xuất"
        >
          <div
            className="flex-shrink-0"
            style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #F5C563, #E1483D)" }}
          />
          <div>
            <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#fff" }}>
              {user?.primaryEmailAddress?.emailAddress ?? "Admin LP Tech"}
            </div>
            <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,.5)" }}>Bấm để đăng xuất</div>
          </div>
        </div>
      </aside>

      <main className="flex-fill" style={{ padding: "26px 30px" }}>
        <div key={location.pathname} className="admin-page-fade">
          <Outlet />
        </div>
      </main>
    </div>
  );
}