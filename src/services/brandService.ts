import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export interface Brand {
  id: string;
  name: string;
}

const COLLECTION_NAME = "brands";

// Thêm 1 hãng phân phối mới
export const addBrand = async (brand: Omit<Brand, "id">) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), brand);
  return docRef.id;
};

// Lấy toàn bộ hãng phân phối
export const getBrands = async (): Promise<Brand[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Brand, "id">) }));
};

// Sửa tên 1 hãng phân phối
export const updateBrand = async (id: string, data: Partial<Brand>) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
};

// Xóa 1 hãng phân phối
export const deleteBrand = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};