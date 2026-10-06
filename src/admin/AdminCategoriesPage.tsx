import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { getProducts } from "../services/productService";
import {
  fetchCategoryGroups,
  saveCategoryGroup,
  deleteCategoryGroup,
  invalidateCategories,
  DEFAULT_CATEGORY_GROUPS,
  type CategoryGroup,
} from "../services/categoryService";
import { toSlug } from "../utils/slug";

const inputStyle: React.CSSProperties = {
  border: "1px solid #E1E9E3",
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: ".85rem",
  flex: 1,
  minWidth: 0,
};
const btnGreen: React.CSSProperties = {
  background: "#2F8F76",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: ".85rem",
  fontWeight: 600,
};

function makeId(name: string, taken: Set<string>): string {
  const base = toSlug(name) || `dm-${Date.now()}`;
  let id = base;
  let n = 2;
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n++;
  }
  return id;
}

export default function AdminCategoriesPage() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [fromDefault, setFromDefault] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const [cat, products] = await Promise.all([fetchCategoryGroups(), getProducts()]);
      setGroups(cat.groups);
      setFromDefault(cat.fromDefault);
      const c: Record<string, number> = {};
      products.forEach((p) => {
        c[p.categoryId] = (c[p.categoryId] || 0) + 1;
      });
      setCounts(c);
    } catch {
      alert("Không tải được danh mục, kiểm tra lại kết nối Firebase");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const takenIds = () => {
    const s = new Set<string>();
    groups.forEach((g) => {
      s.add(g.id);
      g.items.forEach((i) => s.add(i.id));
    });
    return s;
  };

  const persist = async (g: CategoryGroup) => {
    setBusy(true);
    try {
      await saveCategoryGroup(g);
      invalidateCategories();
      setGroups((prev) => prev.map((x) => (x.id === g.id ? g : x)));
    } catch {
      alert("Có lỗi khi lưu — kiểm tra lại kết nối Firebase");
    } finally {
      setBusy(false);
    }
  };

  const seed = async () => {
    if (!window.confirm("Nạp các danh mục hiện tại của web vào hệ thống để quản lý?")) return;
    setBusy(true);
    try {
      for (const g of DEFAULT_CATEGORY_GROUPS) await saveCategoryGroup(g);
      invalidateCategories();
      await load();
    } catch {
      alert("Có lỗi khi nạp, kiểm tra lại kết nối Firebase");
    } finally {
      setBusy(false);
    }
  };

  const addGroup = async () => {
    const name = newGroup.trim();
    if (!name) return;
    const g: CategoryGroup = {
      id: makeId(name, takenIds()),
      name,
      tone: groups.length % 2 === 0 ? "sand" : "mint",
      order: groups.length ? Math.max(...groups.map((x) => x.order)) + 1 : 1,
      items: [],
    };
    setBusy(true);
    try {
      await saveCategoryGroup(g);
      invalidateCategories();
      setGroups((prev) => [...prev, g]);
      setNewGroup("");
    } catch {
      alert("Có lỗi khi lưu — kiểm tra lại kết nối Firebase");
    } finally {
      setBusy(false);
    }
  };

  const renameGroup = (g: CategoryGroup) => {
    const name = window.prompt("Tên mới của nhóm danh mục:", g.name);
    if (name && name.trim() && name.trim() !== g.name) persist({ ...g, name: name.trim() });
  };

  const removeGroup = async (g: CategoryGroup) => {
    const used = g.items.reduce((sum, i) => sum + (counts[i.id] || 0), 0);
    if (used > 0) {
      alert(
        `Không xóa được: nhóm "${g.name}" đang có ${used} sản phẩm. Hãy chuyển các sản phẩm sang danh mục khác trước.`
      );
      return;
    }
    const msg = g.items.length
      ? `Xóa nhóm "${g.name}" và ${g.items.length} danh mục con bên trong?`
      : `Xóa nhóm "${g.name}"?`;
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      await deleteCategoryGroup(g.id);
      invalidateCategories();
      setGroups((prev) => prev.filter((x) => x.id !== g.id));
    } catch {
      alert("Xóa không được, thử lại nhé");
    } finally {
      setBusy(false);
    }
  };

  const addItem = async (g: CategoryGroup) => {
    const name = (newItems[g.id] || "").trim();
    if (!name) return;
    const item = { id: makeId(name, takenIds()), name };
    await persist({ ...g, items: [...g.items, item] });
    setNewItems((prev) => ({ ...prev, [g.id]: "" }));
  };

  const renameItem = (g: CategoryGroup, itemId: string, oldName: string) => {
    const name = window.prompt("Tên mới của danh mục:", oldName);
    if (name && name.trim() && name.trim() !== oldName) {
      persist({
        ...g,
        items: g.items.map((i) => (i.id === itemId ? { ...i, name: name.trim() } : i)),
      });
    }
  };

  const removeItem = (g: CategoryGroup, itemId: string, itemName: string) => {
    const used = counts[itemId] || 0;
    if (used > 0) {
      alert(
        `Không xóa được: danh mục "${itemName}" đang có ${used} sản phẩm. Hãy chuyển các sản phẩm sang danh mục khác trước.`
      );
      return;
    }
    if (!window.confirm(`Xóa danh mục "${itemName}"?`)) return;
    persist({ ...g, items: g.items.filter((i) => i.id !== itemId) });
  };

  return (
    <div>
      <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.35rem" }}>
        Quản lý danh mục
      </h2>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          {fromDefault && (
            <div
              className="bg-white rounded-4 p-3 mb-3"
              style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}
            >
              <p className="mb-2" style={{ fontSize: ".88rem", color: "#5B6B76" }}>
                Danh mục hiện chưa được lưu trong hệ thống, web đang dùng danh mục mặc định. Bấm nút
                dưới để nạp danh mục hiện tại vào hệ thống, sau đó bạn có thể thêm, sửa, xóa.
              </p>
              <button style={btnGreen} onClick={seed} disabled={busy}>
                Nạp danh mục hiện tại vào hệ thống
              </button>
            </div>
          )}

          <div className="row g-3">
            {groups.map((group) => (
              <div className="col-md-6" key={group.id}>
                <div
                  className="bg-white rounded-4 p-3"
                  style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}
                >
                  <div className="d-flex align-items-center mb-2">
                    <div className="fw-semibold me-auto" style={{ fontSize: ".95rem", color: "#22684F" }}>
                      {group.name}
                    </div>
                    {!fromDefault && (
                      <>
                        <button
                          className="btn btn-sm border-0"
                          title="Đổi tên nhóm"
                          onClick={() => renameGroup(group)}
                          disabled={busy}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-sm border-0"
                          style={{ color: "#B93A31" }}
                          title="Xóa nhóm"
                          onClick={() => removeGroup(group)}
                          disabled={busy}
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </div>

                  <ul className="list-unstyled mb-2">
                    {group.items.map((item) => (
                      <li
                        key={item.id}
                        className="d-flex justify-content-between align-items-center py-2"
                        style={{ borderTop: "1px solid #F0F2EE", fontSize: ".85rem" }}
                      >
                        <span>
                          {item.name}
                          <span style={{ color: "#96A0A8", marginLeft: 8, fontSize: ".75rem" }}>
                            {counts[item.id] || 0} sản phẩm
                          </span>
                        </span>
                        {!fromDefault && (
                          <span>
                            <button
                              className="btn btn-sm border-0"
                              title="Đổi tên"
                              onClick={() => renameItem(group, item.id, item.name)}
                              disabled={busy}
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              className="btn btn-sm border-0"
                              style={{ color: "#B93A31" }}
                              onClick={() => removeItem(group, item.id, item.name)}
                              disabled={busy}
                            >
                              Xóa
                            </button>
                          </span>
                        )}
                      </li>
                    ))}
                    {group.items.length === 0 && (
                      <li style={{ borderTop: "1px solid #F0F2EE", padding: "10px 0", fontSize: ".82rem", color: "#96A0A8" }}>
                        Chưa có danh mục con.
                      </li>
                    )}
                  </ul>

                  {!fromDefault && (
                    <div className="d-flex gap-2" style={{ borderTop: "1px solid #F0F2EE", paddingTop: 10 }}>
                      <input
                        style={inputStyle}
                        placeholder="Tên danh mục con mới"
                        value={newItems[group.id] || ""}
                        onChange={(e) => setNewItems((prev) => ({ ...prev, [group.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addItem(group);
                        }}
                      />
                      <button style={btnGreen} onClick={() => addItem(group)} disabled={busy}>
                        <FiPlus /> Thêm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!fromDefault && (
            <div
              className="bg-white rounded-4 p-3 mt-3 d-flex gap-2"
              style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}
            >
              <input
                style={inputStyle}
                placeholder="Tên nhóm danh mục lớn mới (VD: Thiết bị bảo hộ)"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addGroup();
                }}
              />
              <button style={btnGreen} onClick={addGroup} disabled={busy}>
                <FiPlus /> Thêm nhóm lớn
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}