import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { FiEye, FiEyeOff } from "react-icons/fi";

// "Chìa khóa phụ" — tài khoản kỹ thuật riêng, KHÔNG phải tài khoản Admin thật,
// chỉ để Firestore Rules nhận diện được "đây là Admin đã đăng nhập qua Clerk"
const FIREBASE_SERVICE_EMAIL = "admin-system@webbanvattu.internal";
const FIREBASE_SERVICE_PASSWORD = "@Dayladuandautienmetmoicuanhomchungtoi12345";

// Đăng nhập ngầm vào Firebase Auth — gọi ngay sau khi Clerk xác nhận đăng nhập thành công
const signInToFirebase = async () => {
  try {
    await signInWithEmailAndPassword(auth, FIREBASE_SERVICE_EMAIL, FIREBASE_SERVICE_PASSWORD);
  } catch (err) {
    console.error("Lỗi đăng nhập ngầm vào Firebase:", err);
  }
};

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // "login" = màn hình đăng nhập bình thường
  // "forgot-email" = bước 1 quên mật khẩu — nhập email nhận mã
  // "forgot-reset" = bước 2 quên mật khẩu — nhập mã + mật khẩu mới
  const [mode, setMode] = useState<"login" | "forgot-email" | "forgot-reset">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      signInToFirebase().then(() => navigate("/admin"));
    }
  }, [authLoaded, isSignedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: username,
        password: password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await signInToFirebase();
        navigate("/admin");
      } else {
        console.log("Clerk sign-in result:", result);
        setError(`Trạng thái trả về: "${result.status}" — xem Console (F12) để biết chi tiết.`);
      }
    } catch (err: any) {
      const code = err.errors?.[0]?.code;
      if (code === "session_exists") {
        await signInToFirebase();
        navigate("/admin");
      } else {
        setError(err.errors?.[0]?.message || "Sai tên đăng nhập hoặc mật khẩu.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Bước 1 — Gửi mã xác nhận qua email
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: resetEmail,
      });
      setMode("forgot-reset");
      setResetMessage(`Đã gửi mã xác nhận tới ${resetEmail} — kiểm tra email (kể cả mục Spam).`);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Không gửi được mã — kiểm tra lại email.");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2 — Nhập mã + đặt mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await signInToFirebase();
        navigate("/admin");
      } else {
        setError(`Trạng thái trả về: "${result.status}" — thử lại hoặc kiểm tra mã vừa nhập.`);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Mã không đúng hoặc đã hết hạn — thử lại nhé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center position-relative overflow-hidden admin-fade-in"
      style={{ minHeight: "100vh", width: "100%", background: "#F6F1E7" }}
    >
      <div className="position-absolute rounded-circle" style={{ width: 100, height: 100, background: "rgba(47,143,118,.06)", top: 60, left: 100 }} />
      <div className="position-absolute rounded-circle" style={{ width: 60, height: 60, background: "rgba(47,143,118,.06)", top: 300, left: 260 }} />
      <div className="position-absolute rounded-circle" style={{ width: 140, height: 140, background: "rgba(47,143,118,.06)", bottom: 60, left: 60 }} />

      <Link
        to="/"
        className="position-absolute text-decoration-none"
        style={{ top: 36, left: 60, fontSize: ".82rem", color: "#96A0A8", zIndex: 4 }}
      >
        ‹ Trang chủ
      </Link>

      <div className="position-relative" style={{ zIndex: 3, width: 380, marginLeft: "9vw" }}>
        {mode === "login" && (
          <form onSubmit={handleSubmit}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#223028", marginBottom: 32 }}>
              Đăng nhập
            </div>

            <div className="position-relative mb-4">
              <span
                className="position-absolute"
                style={{ top: -9, left: 14, background: "#F6F1E7", padding: "0 6px", fontSize: ".72rem", fontWeight: 600, color: "#22684F" }}
              >
                Tên đăng nhập
              </span>
              <input
                className="form-control"
                style={{ borderColor: "#D8D0BE", borderRadius: 10, padding: "14px 16px", fontSize: ".875rem" }}
                placeholder="admin@lptech.vn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="position-relative mb-3">
              <span
                className="position-absolute"
                style={{ top: -9, left: 14, background: "#F6F1E7", padding: "0 6px", fontSize: ".72rem", fontWeight: 600, color: "#22684F" }}
              >
                Mật khẩu
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                style={{ borderColor: "#D8D0BE", borderRadius: 10, padding: "14px 44px 14px 16px", fontSize: ".875rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="position-absolute border-0 bg-transparent p-0"
                style={{ right: 14, top: "50%", transform: "translateY(-50%)", color: "#96A0A8" }}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4" style={{ fontSize: ".78rem", color: "#5B6B76" }}>
              <label className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                <input type="checkbox" defaultChecked /> Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                onClick={() => { setMode("forgot-email"); setError(""); }}
                className="border-0 bg-transparent p-0"
                style={{ color: "#2F8F76", fontWeight: 500 }}
              >
                Quên mật khẩu?
              </button>
            </div>

            {error && (
              <div className="mb-3" style={{ fontSize: ".8rem", color: "#B93A31" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-100"
              style={{ background: "#2F8F76", color: "#fff", fontWeight: 600, fontSize: ".9rem", padding: 14, border: "none", borderRadius: 10, opacity: loading ? .7 : 1 }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        )}

        {mode === "forgot-email" && (
          <form onSubmit={handleSendResetCode}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#223028", marginBottom: 8 }}>
              Quên mật khẩu?
            </div>
            <div className="mb-4" style={{ fontSize: ".85rem", color: "#5B6B76" }}>
              Nhập email đăng nhập Admin — mã xác nhận sẽ được gửi tới đó.
            </div>

            <div className="position-relative mb-4">
              <span
                className="position-absolute"
                style={{ top: -9, left: 14, background: "#F6F1E7", padding: "0 6px", fontSize: ".72rem", fontWeight: 600, color: "#22684F" }}
              >
                Email
              </span>
              <input
                type="email"
                className="form-control"
                style={{ borderColor: "#D8D0BE", borderRadius: 10, padding: "14px 16px", fontSize: ".875rem" }}
                placeholder="admin@lptech.vn"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="mb-3" style={{ fontSize: ".8rem", color: "#B93A31" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 mb-3"
              style={{ background: "#2F8F76", color: "#fff", fontWeight: 600, fontSize: ".9rem", padding: 14, border: "none", borderRadius: 10, opacity: loading ? .7 : 1 }}
            >
              {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className="btn w-100"
              style={{ background: "transparent", color: "#5B6B76", fontWeight: 500, fontSize: ".85rem", border: "none" }}
            >
              ‹ Quay lại đăng nhập
            </button>
          </form>
        )}

        {mode === "forgot-reset" && (
          <form onSubmit={handleResetPassword}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#223028", marginBottom: 8 }}>
              Đặt mật khẩu mới
            </div>
            {resetMessage && (
              <div className="mb-4" style={{ fontSize: ".82rem", color: "#22684F" }}>
                {resetMessage}
              </div>
            )}

            <div className="position-relative mb-4">
              <span
                className="position-absolute"
                style={{ top: -9, left: 14, background: "#F6F1E7", padding: "0 6px", fontSize: ".72rem", fontWeight: 600, color: "#22684F" }}
              >
                Mã xác nhận
              </span>
              <input
                className="form-control"
                style={{ borderColor: "#D8D0BE", borderRadius: 10, padding: "14px 16px", fontSize: ".875rem" }}
                placeholder="Nhập mã 6 số từ email"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
            </div>

            <div className="position-relative mb-3">
              <span
                className="position-absolute"
                style={{ top: -9, left: 14, background: "#F6F1E7", padding: "0 6px", fontSize: ".72rem", fontWeight: 600, color: "#22684F" }}
              >
                Mật khẩu mới
              </span>
              <input
                type="password"
                className="form-control"
                style={{ borderColor: "#D8D0BE", borderRadius: 10, padding: "14px 16px", fontSize: ".875rem" }}
                placeholder="Tối thiểu 8 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="mb-3" style={{ fontSize: ".8rem", color: "#B93A31" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 mb-3"
              style={{ background: "#2F8F76", color: "#fff", fontWeight: 600, fontSize: ".9rem", padding: 14, border: "none", borderRadius: 10, opacity: loading ? .7 : 1 }}
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>

            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className="btn w-100"
              style={{ background: "transparent", color: "#5B6B76", fontWeight: 500, fontSize: ".85rem", border: "none" }}
            >
              ‹ Quay lại đăng nhập
            </button>
          </form>
        )}
      </div>

      <div
        className="position-absolute rounded-circle"
        style={{
          right: -180,
          top: "50%",
          transform: "translateY(-50%)",
          width: 780,
          height: 780,
          background: "linear-gradient(135deg, #2F8F76 0%, #1B2E27 100%)",
          zIndex: 1,
        }}
      />
      <div
        className="position-absolute text-end"
        style={{ right: 130, top: "50%", transform: "translateY(-50%)", zIndex: 2, maxWidth: 340 }}
      >
        <img src="/logo-icon-gold.png" alt="LP Tech" style={{ height: 52, marginBottom: 14 }} />
        <div style={{ fontSize: ".875rem", letterSpacing: ".1em", fontWeight: 700, color: "rgba(255,255,255,.65)", marginBottom: 12 }}>
          LP TECH ADMIN
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2.75rem", color: "#F5C563", margin: "0 0 16px", lineHeight: 1.15 }}>
          Chào mừng<br />trở lại!
        </h2>
        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,.82)", lineHeight: 1.65, margin: 0 }}>
          Đăng nhập để quản lý sản phẩm, danh mục và yêu cầu báo giá.
        </p>
      </div>
    </div>
  );
}