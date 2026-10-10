export interface CertFile {
  name: string;             // tên file hiện cho khách xem, vd: COA-Makita.pdf
  url: string;              // đường dẫn file trên Cloudinary
  type: "pdf" | "image";
}

export interface Product {
  id: string;
  slug?: string;            // phần tên trong link, vd: mang-co-pe-cuon-cong-nghiep
  name: string;
  brandId: string;
  categoryId: string;
  image: string;
  standards: string[];      // mã chuẩn kỹ thuật, vd: "ASTM D2272"
  specs: string[];          // 3 gạch đầu dòng thông số nổi bật
  images?: string[];        // tối đa 3 ảnh phụ
  usageGuide?: string;      // hướng dẫn sử dụng riêng từng sản phẩm
  certification?: string;   // chứng nhận chất lượng riêng từng sản phẩm
  certFiles?: CertFile[];   // file chứng nhận (PDF hoặc hình) khách tải lên
  seoKeywords?: string;     // từ khóa SEO, cách nhau bằng dấu ; vd: "máy khoan; máy khoan điện"
  featured?: boolean;       // sản phẩm nổi bật, hiện ở trang chủ
  hidden?: boolean;         // sản phẩm bị ẩn, không hiện ở trang khách hàng
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  categories: Category[];
}