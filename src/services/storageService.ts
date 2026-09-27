// Tải ảnh lên Cloudinary (dùng "Unsigned Upload") thay vì Firebase Storage —
// vì Firebase Storage giờ bắt buộc phải có tài khoản thanh toán (Blaze), Cloudinary thì không.
const CLOUD_NAME = "ohteg49h";
const UPLOAD_PRESET = "lptech_products";

export const uploadProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Tải ảnh lên Cloudinary thất bại");
  }

  const data = await response.json();
  return data.secure_url as string; // đường dẫn ảnh thật, HTTPS, để lưu vào Firestore
};