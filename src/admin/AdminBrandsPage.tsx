import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiBriefcase } from "react-icons/fi";
import { addBrand, getBrands, deleteBrand } from "../services/brandService";
import type { Brand } from "../services/brandService";

export default function AdminBrandsPage() {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getBrands()
      .then((data) => setItems(data))
      .catch((err) => console.error("Lỗi tải hãng phân phối từ Firebase:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const id = await addBrand({ name: newName.trim() });
      setItems((prev) => [...prev, { id, name: newName.trim() }]);
      setNewName("");
    } catch (err) {
      console.error("Lỗi khi thêm hãng phân phối:", err);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteBrand(id);
    } catch (err) {
      console.error("Lỗi khi xóa hãng phân phối:", err);
    }
  };

  return (
    <div>
      <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.35rem" }}>
        Quản lý hãng phân phối
      </h2>

      <div className="d-flex gap-2 mb-4" style={{ maxWidth: 480 }}>
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
                className="bg-white rounded-4 p-3 d-flex justify-content-between align-items-center"
                style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}
              >
                <span className="d-flex align-items-center gap-2" style={{ fontSize: ".9rem", fontWeight: 500 }}>
                  <FiBriefcase size={14} style={{ color: "#2563EB" }} />
                  {b.name}
                </span>
                <button onClick={() => remove(b.id)} className="btn btn-sm" style={{ background: "#F1F1EE" }}>
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}