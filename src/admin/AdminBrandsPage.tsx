import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiBriefcase, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { addBrand, getBrands, updateBrand, deleteBrand } from "../services/brandService";
import type { Brand } from "../services/brandService";
import { getProducts } from "../services/productService";
import type { Product } from "../types";

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export default function AdminBrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getBrands()
      .then((data) => setItems(data))
      .catch((err) => console.error("Lỗi tải hãng phân phối từ Firebase:", err))
      .finally(() => setLoading(false));
    getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi tải sản phẩm từ Firebase:", err));
  }, []);

  const countProducts = (id: string) => products.filter((p) => p.brandId === id).length;

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    if (items.some((b) => sameName(b.name, name))) {
      setMessage(`Hãng “${name}” đã có trong danh sách.`);
      return;
    }
    setAdding(true);
    setMessage(null);
    try {
      const id = await addBrand({ name });
      setItems((prev) => [...prev, { id, name }]);
      setNewName("");
    } catch (err) {
      console.error("Lỗi khi thêm hãng phân phối:", err);
      setMessage("Không thêm được hãng. Vui lòng thử lại hoặc báo cho người hỗ trợ.");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (b: Brand) => {
    setEditingId(b.id);
    setEditName(b.name);
    setMessage(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    if (items.some((b) => b.id !== editingId && sameName(b.name, name))) {
      setMessage(`Đã có hãng khác tên “${name}”.`);
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updateBrand(editingId, { name });
      setItems((prev) => prev.map((b) => (b.id === editingId ? { ...b, name } : b)));
      setEditingId(null);
    } catch (err) {
      console.error("Lỗi khi sửa hãng phân phối:", err);
      setMessage("Không sửa được hãng. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b: Brand) => {
    const used = countProducts(b.id);
    const ask =
      used > 0
        ? `Hãng “${b.name}” đang được ${used} sản phẩm sử dụng. Nếu xóa, các sản phẩm đó sẽ không còn thuộc hãng nào. Vẫn xóa?`
        : `Xóa hãng “${b.name}”?`;
    if (!window.confirm(ask)) return;
    setMessage(null);
    try {
      await deleteBrand(b.id);
      setItems((prev) => prev.filter((x) => x.id !== b.id));
    } catch (err) {
      console.error("Lỗi khi xóa hãng phân phối:", err);
      setMessage("Không xóa được hãng. Vui lòng thử lại.");
    }
  };

  return (
    <div>
      <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.35rem" }}>
        Quản lý hãng phân phối
      </h2>

      <div className="d-flex gap-2 mb-2" style={{ maxWidth: 480 }}>
        <input
          className="form-control"
          style={{ borderColor: "#E1E9E3", borderRadius: 10 }}
          placeholder="Tên hãng phân phối (VD: 3M)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="btn d-inline-flex align-items-center gap-2 flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #E1483D, #B93A31)", color: "#fff", fontWeight: 600,
            fontSize: ".85rem", opacity: adding || !newName.trim() ? .6 : 1,
          }}
        >
          <FiPlus /> {adding ? "Đang thêm..." : "Thêm"}
        </button>
      </div>

      <div className="mb-4" style={{ minHeight: 22, color: "#B93A31", fontSize: ".85rem" }}>
        {message}
      </div>

      {loading ? (
        <div className="text-center py-4" style={{ color: "#96A0A8", fontSize: ".85rem" }}>
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-4" style={{ color: "#96A0A8", fontSize: ".85rem" }}>
          Chưa có hãng phân phối nào — thêm hãng đầu tiên ở ô phía trên.
        </div>
      ) : (
        <div className="row g-3">
          {items.map((b) => (
            <div className="col-md-4" key={b.id}>
              <div
                className="bg-white rounded-4 p-3 d-flex justify-content-between align-items-center gap-2"
                style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}
              >
                {editingId === b.id ? (
                  <>
                    <input
                      className="form-control form-control-sm"
                      style={{ borderColor: "#E1E9E3", borderRadius: 8 }}
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <div className="d-flex gap-1 flex-shrink-0">
                      <button
                        onClick={saveEdit}
                        disabled={saving || !editName.trim()}
                        className="btn btn-sm"
                        style={{ background: "#E4F1EA", color: "#22684F" }}
                        aria-label="Lưu"
                      >
                        <FiCheck size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn btn-sm"
                        style={{ background: "#F1F1EE" }}
                        aria-label="Hủy"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="d-flex align-items-center gap-2" style={{ fontSize: ".9rem", fontWeight: 500 }}>
                      <FiBriefcase size={14} style={{ color: "#2563EB" }} />
                      <span>
                        {b.name}
                        {products.length > 0 && (
                          <span style={{ color: "#96A0A8", fontWeight: 400, fontSize: ".78rem" }}>
                            {" "}· {countProducts(b.id)} sản phẩm
                          </span>
                        )}
                      </span>
                    </span>
                    <div className="d-flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(b)}
                        className="btn btn-sm"
                        style={{ background: "#F1F1EE" }}
                        aria-label="Sửa tên"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => remove(b)}
                        className="btn btn-sm"
                        style={{ background: "#F1F1EE" }}
                        aria-label="Xóa"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}