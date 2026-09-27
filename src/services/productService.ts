import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Product } from "../types";

const COLLECTION_NAME = "products";

export const addProduct = async (product: Omit<Product, "id">) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...product,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, "id">),
  }));
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};