import { useState } from "react";
import { products as initialProducts, brands, categoryGroups } from "../data/mockData";
import type { Product } from "../types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const allCategories = categoryGroups.flatMap((g) => g.items);

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const openNew = () => {
    setEditing({
      id: `p${Date.now()}`,
      name: "",
      image: "",
      categoryId: allCategories[0]?.id ?? "",
      brandId: brands[0]?.id ?? "",
      standards: [],
      specs: [],
    });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setShowForm(true);
  };

  const save = () => {
    if (!editing) return;
    setItems((prev) => {
      const exists = prev.some((p) => p.id === editing.id);
      return exists ? prev.map((p) => (p.id === editing.id ? editing : p)) : [...prev, editing];
    });
    setShowForm(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirm("Xóa sản phẩm này? (chỉ mất tạm trong phiên làm việc)")) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.35rem", margin: 0 }}>
          Quản lý sản phẩm
        </h2>
        <button
          onClick={openNew}
          className="btn d-inline-flex align-items-center gap-2"
          style={{ background: "linear-gradient(135deg, #E1483D, #B93A31)", color: "#fff", fontWeight: 600, fontSize: ".85rem" }}
        >
          <FiPlus /> Thêm sản phẩm
        </button>
      </div>

      <div className="rounded-4 overflow-hidden bg-white" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
        <table className="w-100" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#E4F1EA" }}>
              {["Sản phẩm", "Danh mục", "Hãng", ""].map((h) => (
                <th key={h} className="text-start" style={{ padding: "13px 16px", fontSize: ".68rem", textTransform: "uppercase", color: "#22684F", fontWeight: 700 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const cat = allCategories.find((c) => c.id === p.categoryId);
              const brand = brands.find((b) => b.id === p.brandId);
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #F0F2EE" }}>
                  <td style={{ padding: "13px 16px", fontSize: ".85rem" }}>
                    <span className="d-inline-block me-2" style={{ width: 36, height: 36, borderRadius: 9, background: "#E4F1EA", verticalAlign: "middle" }} />
                    {p.name}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: ".85rem", color: "#5B6B76" }}>{cat?.name ?? "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: ".85rem", color: "#5B6B76" }}>{brand?.name ?? "—"}</td>
                  <td style={{ padding: "13px 16px", textAlign: "right" }}>
                    <button onClick={() => openEdit(p)} className="btn btn-sm me-1" style={{ background: "#F1F1EE" }}>
                      <FiEdit2 size={13} />
                    </button>
                    <button onClick={() => remove(p.id)} className="btn btn-sm" style={{ background: "#F1F1EE" }}>
                      <FiTrash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form thêm/sửa — dạng modal đơn giản */}
      {showForm && editing && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,.4)", zIndex: 1000 }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-4 p-4"
            style={{ width: 420, maxWidth: "90vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
                {items.some((p) => p.id === editing.id) ? "Sửa sản phẩm" : "Thêm sản phẩm"}
              </h5>
              <button onClick={() => setShowForm(false)} className="btn btn-sm border-0">
                <FiX />
              </button>
            </div>

            <label className="form-label" style={{ fontSize: ".8rem" }}>Tên sản phẩm</label>
            <input
              className="form-control mb-3"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />

            <label className="form-label" style={{ fontSize: ".8rem" }}>Danh mục</label>
            <select
              className="form-control mb-3"
              value={editing.categoryId}
              onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
            >
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label className="form-label" style={{ fontSize: ".8rem" }}>Hãng phân phối</label>
            <select
              className="form-control mb-4"
              value={editing.brandId}
              onChange={(e) => setEditing({ ...editing, brandId: e.target.value })}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <button onClick={save} className="btn w-100" style={{ background: "#2F8F76", color: "#fff", fontWeight: 600 }}>
              Lưu (tạm thời trong phiên này)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}