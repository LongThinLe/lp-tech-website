import { useState } from "react";
import { categoryGroups as initialGroups } from "../data/mockData";

export default function AdminCategoriesPage() {
  const [groups, setGroups] = useState(initialGroups);

  const removeItem = (groupId: string, itemId: string) => {
    if (!confirm("Xóa danh mục này? (chỉ mất tạm trong phiên làm việc)")) return;
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g))
    );
  };

  return (
    <div>
      <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.35rem" }}>
        Quản lý danh mục
      </h2>

      <div className="row g-3">
        {groups.map((group) => (
          <div className="col-md-6" key={group.id}>
            <div className="bg-white rounded-4 p-3" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
              <div className="fw-semibold mb-2" style={{ fontSize: ".9rem", color: "#22684F" }}>{group.name}</div>
              <ul className="list-unstyled mb-0">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="d-flex justify-content-between align-items-center py-2"
                    style={{ borderTop: "1px solid #F0F2EE", fontSize: ".85rem" }}
                  >
                    {item.name}
                    <button
                      onClick={() => removeItem(group.id, item.id)}
                      className="btn btn-sm border-0"
                      style={{ color: "#B93A31" }}
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}