import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  read: boolean;
  createdAt?: any;
}

const COLLECTION_NAME = "leads";

// Lưu 1 yêu cầu liên hệ mới — gọi từ ContactPage.tsx khi khách bấm "Gửi yêu cầu"
export const addLead = async (lead: Omit<Lead, "id" | "read">) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...lead,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Lấy toàn bộ yêu cầu, mới nhất lên đầu — dùng cho trang Admin
export const getLeads = async (): Promise<Lead[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, "id">) }));
};

// "Luôn lắng nghe" — tự động gọi lại callback mỗi khi có yêu cầu mới/thay đổi,
// không cần chuyển trang hay bấm gì cả. Trả về hàm "hủy lắng nghe" để dọn dẹp khi rời trang.
export const subscribeToLeads = (callback: (leads: Lead[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const leads = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, "id">) }));
    callback(leads);
  });
  return unsubscribe;
};

// Đánh dấu 1 yêu cầu đã đọc — dùng khi Admin bấm xem chi tiết
export const markLeadAsRead = async (id: string) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), { read: true });
};

// Xóa 1 yêu cầu (nếu Admin muốn dọn dẹp)
export const deleteLead = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};