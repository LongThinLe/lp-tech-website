import { useEffect, useState } from "react";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { categoryGroups as defaultGroups } from "../data/mockData";

export interface CategoryItem {
  id: string;
  name: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  tone: "sand" | "mint";
  order: number;
  items: CategoryItem[];
}

const COL = "categories";

// Danh mục mặc định (lấy từ mockData) — dùng khi Firebase chưa có dữ liệu
export const DEFAULT_CATEGORY_GROUPS: CategoryGroup[] = defaultGroups.map((g, i) => ({
  id: g.id,
  name: g.name,
  tone: g.tone,
  order: i + 1,
  items: g.items.map((it) => ({ id: it.id, name: it.name })),
}));

export async function fetchCategoryGroups(): Promise<{
  groups: CategoryGroup[];
  fromDefault: boolean;
}> {
  const snap = await getDocs(collection(db, COL));
  if (snap.empty) return { groups: DEFAULT_CATEGORY_GROUPS, fromDefault: true };
  const groups = snap.docs
    .map((d) => {
      const data = d.data() as Partial<Omit<CategoryGroup, "id">>;
      return {
        id: d.id,
        name: data.name ?? "",
        tone: (data.tone === "mint" ? "mint" : "sand") as CategoryGroup["tone"],
        order: data.order ?? 0,
        items: data.items ?? [],
      };
    })
    .sort((a, b) => a.order - b.order);
  return { groups, fromDefault: false };
}

export async function saveCategoryGroup(g: CategoryGroup): Promise<void> {
  await setDoc(doc(db, COL, g.id), {
    name: g.name,
    tone: g.tone,
    order: g.order,
    items: g.items,
  });
}

export async function deleteCategoryGroup(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

/* ---------- Hook dùng chung cho Header, Hero, ProductsPage, form sản phẩm ---------- */

let cache: Promise<CategoryGroup[]> | null = null;
let lastGroups: CategoryGroup[] | null = null;

export function invalidateCategories(): void {
  cache = null;
}

function loadCategoryGroups(): Promise<CategoryGroup[]> {
  if (!cache) {
    cache = fetchCategoryGroups()
      .then((r) => {
        lastGroups = r.groups;
        return r.groups;
      })
      .catch(() => {
        cache = null;
        return DEFAULT_CATEGORY_GROUPS;
      });
  }
  return cache;
}

export function useCategoryGroups(): CategoryGroup[] {
  const [groups, setGroups] = useState<CategoryGroup[]>(lastGroups ?? []);
  useEffect(() => {
    let alive = true;
    loadCategoryGroups().then((g) => {
      if (alive) setGroups(g);
    });
    return () => {
      alive = false;
    };
  }, []);
  return groups;
}