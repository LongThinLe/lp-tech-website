import type { Brand, Product } from "../types";

export const categoryGroups = [
  {
    id: "dong-goi",
    name: "Vật tư đóng gói",
    tone: "sand" as const,
    items: [
      { id: "mang-co", name: "Màng co" },
      { id: "mang-pe", name: "Màng PE" },
      { id: "day-dai", name: "Dây đai" },
      { id: "bang-keo", name: "Băng keo" },
      { id: "pallet", name: "Pallet" },
      { id: "bao-bi", name: "Bao bì" },
    ],
  },
  {
    id: "phong-thi-nghiem",
    name: "Vật tư phòng thí nghiệm",
    tone: "mint" as const,
    items: [
      { id: "dung-cu", name: "Dụng cụ thí nghiệm" },
      { id: "tieu-hao", name: "Vật tư tiêu hao" },
      { id: "thiet-bi-do", name: "Thiết bị đo" },
    ],
  },
];

export const brands: Brand[] = [
  {
    id: "packone",
    name: "PackOne Vietnam",
    categories: [
      { id: "mang-co", name: "Màng co" },
      { id: "day-dai", name: "Dây đai" },
    ],
  },
  {
    id: "labware",
    name: "LabWare Supplies",
    categories: [
      { id: "dung-cu", name: "Dụng cụ thí nghiệm" },
      { id: "tieu-hao", name: "Vật tư tiêu hao" },
    ],
  },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Màng co PE cuộn công nghiệp",
    brandId: "packone",
    categoryId: "mang-co",
    image: "",
    standards: ["Khổ 500mm", "Dày 17mic"],
    specs: ["Độ co giãn cao", "Chống ẩm, chống rách", "Dùng cho pallet hàng hoá"],
  },
  {
    id: "p2",
    name: "Dây đai nhựa PP đóng kiện",
    brandId: "packone",
    categoryId: "day-dai",
    image: "",
    standards: ["Khổ 12mm", "Cuộn 3kg"],
    specs: ["Chịu lực kéo cao", "Dùng máy hoặc thủ công", "Bề mặt nhám chống trượt"],
  },
  {
    id: "p3",
    name: "Bình tam giác thủy tinh 250ml",
    brandId: "labware",
    categoryId: "dung-cu",
    image: "",
    standards: ["Borosilicate 3.3"],
    specs: ["Chịu nhiệt tốt", "Vạch chia rõ nét", "Đạt chuẩn phòng thí nghiệm"],
  },
  {
    id: "p4",
    name: "Găng tay nitrile không bột (hộp 100)",
    brandId: "labware",
    categoryId: "tieu-hao",
    image: "",
    standards: ["Size S–XL"],
    specs: ["Chống hoá chất nhẹ", "Độ bền kéo cao", "Không chứa bột tan"],
  },
];
