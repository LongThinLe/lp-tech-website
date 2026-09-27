// Cấu hình form liên hệ — dùng dịch vụ Formspree (miễn phí, không cần backend riêng)
//
// CÁCH KÍCH HOẠT THẬT (làm 1 lần):
// 1. Vào https://formspree.io, đăng ký bằng email công ty thật (hiện đang để tạm info@supplyco.vn)
// 2. Tạo 1 "Form mới", Formspree sẽ cho 1 đường dẫn dạng:
//    https://formspree.io/f/xxxxxxxx
// 3. Dán đường dẫn đó thay cho FORMSPREE_ENDPOINT bên dưới
// 4. Formspree sẽ gửi 1 email xác nhận — bấm xác nhận thì form mới hoạt động thật
//
// Trước khi hoàn tất bước trên, form vẫn hiển thị và validate bình thường,
// chỉ là request gửi đi sẽ không tới hộp thư thật nào.
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_ME";
export const CONTACT_EMAIL = "info@supplyco.vn";
