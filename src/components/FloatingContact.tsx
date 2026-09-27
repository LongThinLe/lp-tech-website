import { SiZalo } from "react-icons/si";
import { FaPhoneAlt } from "react-icons/fa";

// Số điện thoại thật của LP Tech — Zalo mở qua link zalo.me, gọi điện qua tel:
const PHONE_DISPLAY = "0989.766.715";
const PHONE_TEL = "0989766715";
const ZALO_LINK = `https://zalo.me/${PHONE_TEL}`;

export default function FloatingContact() {
  return (
    <div className="floating-contact">
      <a href={ZALO_LINK} target="_blank" rel="noreferrer" className="contact-pill contact-pill--zalo">
        <span>{PHONE_DISPLAY}</span>
        <span className="contact-pill__icon">
          <span className="pulse-ring" />
          <span className="pulse-ring" style={{ animationDelay: ".6s" }} />
          <SiZalo size={27} />
        </span>
      </a>

      <a href={`tel:${PHONE_TEL}`} className="contact-pill contact-pill--call">
        <span>{PHONE_DISPLAY}</span>
        <span className="contact-pill__icon">
          <span className="pulse-ring" />
          <span className="pulse-ring" style={{ animationDelay: ".6s" }} />
          <FaPhoneAlt size={16} />
        </span>
      </a>
    </div>
  );
}