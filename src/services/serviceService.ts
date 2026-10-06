import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export interface ServiceItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  featured: boolean;
  order: number;
  hidden: boolean;
}

export type ServiceInput = Omit<ServiceItem, "id">;

const COL = "services";

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "packaging",
    badge: "Industrial Supply",
    title: "Vật Tư Đóng Gói Chuẩn Công Nghiệp",
    subtitle: "Tối ưu hóa chuỗi vận hành nhà kho & xuất khẩu",
    desc: "Giải pháp bảo vệ hàng hóa toàn diện với màng PE cao cấp, băng keo chịu lực và vật liệu chống sốc tiêu chuẩn quốc tế.",
    features: [
      "Đạt tiêu chuẩn xuất khẩu EU/US",
      "Độ giãn cao, tiết kiệm vật tư sử dụng",
      "Giao hàng nhanh trong khu vực Đồng Nai",
    ],
    featured: false,
    order: 1,
    hidden: false,
  },
  {
    id: "lab-supplies",
    badge: "Lab & Science",
    title: "Thiết Bị & Vật Tư Phòng Lab Chuyên Sâu",
    subtitle: "Chính xác tuyệt đối cho R&D và Kiểm định QC",
    desc: "Cung cấp dụng cụ thủy tinh, hóa chất tinh khiết và thiết bị đo lường chính xác cao với đầy đủ chứng nhận CO/CQ nguồn gốc.",
    features: [
      "Chứng nhận CO/CQ đầy đủ theo lô hàng",
      "Hàng chính hãng, nguồn gốc rõ ràng",
      "Tư vấn kỹ thuật bởi đội ngũ chuyên môn",
    ],
    featured: true,
    order: 2,
    hidden: false,
  },
  {
    id: "consulting",
    badge: "Enterprise Solution",
    title: "Tư Vấn Giải Pháp Cung Ứng Định Kỳ",
    subtitle: "Tối ưu chi phí & đảm bảo không đứt gãy chuỗi cung ứng",
    desc: "Khảo sát quy trình thực tế tại nhà máy, đề xuất vật tư thay thế tối ưu và lập kế hoạch giao hàng định kỳ theo nhu cầu sản xuất.",
    features: [
      "Khảo sát nhu cầu thực tế miễn phí",
      "Chiết khấu theo sản lượng hợp tác dài hạn",
      "Hỗ trợ kỹ thuật xuyên suốt quá trình dùng",
    ],
    featured: false,
    order: 3,
    hidden: false,
  },
];

export async function getServices(): Promise<ServiceItem[]> {
  const snap = await getDocs(collection(db, COL));
  const list = snap.docs.map((d) => {
    const data = d.data() as Partial<ServiceInput>;
    return {
      id: d.id,
      badge: data.badge ?? "",
      title: data.title ?? "",
      subtitle: data.subtitle ?? "",
      desc: data.desc ?? "",
      features: data.features ?? [],
      featured: !!data.featured,
      order: data.order ?? 0,
      hidden: !!data.hidden,
    } as ServiceItem;
  });
  return list.sort((a, b) => a.order - b.order);
}

export async function addService(data: ServiceInput): Promise<string> {
  const ref = await addDoc(collection(db, COL), data);
  return ref.id;
}

export async function updateService(id: string, data: ServiceInput): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}