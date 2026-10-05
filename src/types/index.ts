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
  featured?: boolean;       // sản phẩm nổi bật, hiện ở trang chủ
  hidden?: boolean;         // ← MỚI: sản phẩm bị ẩn, không hiện ở trang khách hàng
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