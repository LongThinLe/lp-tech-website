import { useEffect } from "react";
import { useCompanySettings } from "../hooks/useCompanySettings";
import { applySeo } from "../utils/seo";

// Đặt tiêu đề, mô tả và từ khóa chung của cả web (khách nhập ở Admin → Thiết lập → "SEO trang chủ").
// Chỉ cần đặt một lần trong trang chủ. Không hiện gì ra màn hình.
export default function SiteSeo() {
  const { seoTitle, seoDescription, seoKeywords } = useCompanySettings();

  useEffect(() => {
    if (!seoTitle && !seoDescription && !seoKeywords) return;
    return applySeo({ title: seoTitle, description: seoDescription, keywords: seoKeywords });
  }, [seoTitle, seoDescription, seoKeywords]);

  return null;
}