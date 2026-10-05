import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTopButton from "./components/ScrollToTopButton";
import FloatingContact from "./components/FloatingContact";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ServicesPage from "./pages/ServicesPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboardPage from "./admin/AdminDashboardPage";

import AdminCategoriesPage from "./admin/AdminCategoriesPage";
import AdminBrandsPage from "./admin/AdminBrandsPage";
import AdminLeadsPage from "./admin/AdminLeadsPage";
import AdminNewsPage from "./admin/AdminNewsPage";
import AdminSettingsPage from "./admin/AdminSettingsPage";
import AdminLoginPage from "./admin/AdminLoginPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    AOS.init({ duration: 600, easing: "ease-out-cubic", once: true, offset: 40 });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refreshHard();
    window.dispatchEvent(new Event("scroll"));
  }, [location.pathname]);

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="danh-muc" element={<AdminCategoriesPage />} />
          <Route path="hang-phan-phoi" element={<AdminBrandsPage />} />
          <Route path="yeu-cau-bao-gia" element={<AdminLeadsPage />} />
          <Route path="tin-tuc" element={<AdminNewsPage />} />
          <Route path="thiet-lap" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/san-pham" element={<ProductsPage />} />
        <Route path="/san-pham/:id" element={<ProductDetailPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} />
        <Route path="/dich-vu" element={<ServicesPage />} />
        <Route path="/tin-tuc" element={<NewsPage />} />
        <Route path="/tin-tuc/:slug" element={<NewsDetailPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
      <ScrollToTopButton />
      <FloatingContact />
    </>
  );
}
export default App;