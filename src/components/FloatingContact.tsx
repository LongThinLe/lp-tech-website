import { SiZalo } from "react-icons/si";
import { FaPhoneAlt } from "react-icons/fa";
import { useCompanySettings } from "../hooks/useCompanySettings";

// Số điện thoại lấy từ mục "Thiết lập thông tin" trong admin — Zalo mở qua link zalo.me, gọi điện qua tel:
export default function FloatingContact() {
  const { phone } = useCompanySettings();
  const phoneTel = phone.replace(/\D/g, "");

  return (
    <div className="floating-contact">
      <a href={`https://zalo.me/${phoneTel}`} target="_blank" rel="noreferrer" className="contact-pill contact-pill--zalo">
        <span>{phone}</span>
        <span className="contact-pill__icon">
          <span className="pulse-ring" />
          <span className="pulse-ring" style={{ animationDelay: ".6s" }} />
          <SiZalo size={27} />
        </span>
      </a>

      <a href={`tel:${phoneTel}`} className="contact-pill contact-pill--call">
        <span>{phone}</span>
        <span className="contact-pill__icon">
          <span className="pulse-ring" />
          <span className="pulse-ring" style={{ animationDelay: ".6s" }} />
          <FaPhoneAlt size={16} />
        </span>
      </a>
    </div>
  );
}