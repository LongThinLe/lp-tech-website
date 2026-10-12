import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { looksLikeHtml } from "../utils/richText";

export type NewsBlock =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "image"; url: string };

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  cover: string;
  blocks: NewsBlock[];
  publishedAt: string; // YYYY-MM-DD
  hidden?: boolean;
}

const COL = "news";

export function sortNews(list: NewsPost[]): NewsPost[] {
  return [...list].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getNews(): Promise<NewsPost[]> {
  const snap = await getDocs(collection(db, COL));
  const list = snap.docs.map(
    (d) => ({ ...(d.data() as Omit<NewsPost, "id">), id: d.id }) as NewsPost
  );
  return sortNews(list);
}

export async function addNews(data: Omit<NewsPost, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COL), data);
  return ref.id;
}

export async function updateNews(
  id: string,
  data: Omit<NewsPost, "id">
): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteNews(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function formatNewsDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function newsCover(p: NewsPost): string {
  if (p.cover) return p.cover;
  const img = p.blocks.find((b) => b.type === "image");
  return img && img.type === "image" ? img.url : "";
}

// Đoạn văn có thể là HTML (do khung soạn thảo tạo) — đổi về chữ thuần để làm đoạn trích
function plainText(text: string): string {
  if (!looksLikeHtml(text)) return text;
  const doc = new DOMParser().parseFromString(text.replace(/<\/(p|div|li)>/gi, " </$1>"), "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function newsExcerpt(p: NewsPost): string {
  if (p.summary) return p.summary;
  const t = p.blocks.find((b) => b.type === "text");
  return t && t.type === "text" ? plainText(t.text).slice(0, 160) : "";
}