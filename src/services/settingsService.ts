import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface CompanySettings {
    companyName: string;
    taxCode: string;
    address: string;
    phone: string;
    email: string;
    facebook: string;
    instagram: string;
    supportLine: string; // dòng giới thiệu người tư vấn ở chân trang
    mapEmbed: string; // link nhúng Google Map (để trống = tự tìm theo địa chỉ)
    workingHours: string; // giờ làm việc ở thanh trên cùng
    logoHeader: string; // link ảnh logo đầu trang (để trống = dùng logo mặc định)
    logoFooter: string; // link ảnh logo chân trang (để trống = dùng logo mặc định)
}

// Thông tin hiện tại của LP Tech — dùng làm mặc định khi chưa có dữ liệu trên Firebase
export const defaultSettings: CompanySettings = {
    companyName: "Công ty TNHH TM LP Tech",
    taxCode: "3604118169",
    address: "92, Tổ 17C, Khu phố 3, Phường Tam Hiệp, Thành phố Đồng Nai, Việt Nam",
    phone: "0989 766 715",
    email: "lptechco.ltd@gmail.com",
    facebook: "https://www.facebook.com/linh.tau.503",
    instagram: "",
    supportLine: "Ms. Khánh Linh — Phụ trách kinh doanh · phản hồi trong 15 phút",
    mapEmbed: "",
    workingHours: "Thứ 2 – 7: 07:00–11:30 & 13:00–16:30",
    logoHeader: "",
    logoFooter: "",
};

const settingsRef = () => doc(db, "settings", "company");

// Nhớ kết quả trong bộ nhớ để Footer, Liên hệ, nút nổi không phải tải lại nhiều lần
let cache: Promise<CompanySettings> | null = null;

export const getCompanySettings = (): Promise<CompanySettings> => {
    if (!cache) {
        cache = getDoc(settingsRef())
            .then((snap) => ({
                ...defaultSettings,
                ...(snap.exists() ? (snap.data() as Partial<CompanySettings>) : {}),
            }))
            .catch((err) => {
                console.error("Lỗi tải thông tin công ty từ Firebase:", err);
                cache = null;
                return defaultSettings;
            });
    }
    return cache;
};

export const saveCompanySettings = async (data: CompanySettings) => {
    await setDoc(settingsRef(), data);
    cache = Promise.resolve(data);
};

// Khách có thể dán cả đoạn <iframe ...> của Google Map hoặc chỉ link — lấy ra link nhúng
// và chỉ chấp nhận link của Google Maps (tránh dán nhầm trang lạ vào web)
export const extractMapSrc = (input: string): string => {
    const match = input.match(/src="([^"]+)"/);
    const url = (match ? match[1] : input).trim();
    return url.startsWith("https://www.google.com/maps") ? url : "";
};

export const mapEmbedSrc = (s: CompanySettings): string =>
    extractMapSrc(s.mapEmbed) ||
    `https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`;

export const mapOpenLink = (s: CompanySettings): string =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`;