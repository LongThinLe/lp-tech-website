import { useState, useEffect } from "react";
import { FiMail, FiPhone, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { getLeads, markLeadAsRead, deleteLead } from "../services/leadService";
import type { Lead } from "../services/leadService";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    getLeads()
      .then((data) => setLeads(data))
      .catch((err) => console.error("Lỗi tải yêu cầu báo giá:", err))
      .finally(() => setLoading(false));
  }, []);

  const openLead = async (lead: Lead) => {
    setSelected(lead);
    if (!lead.read) {
      await markLeadAsRead(lead.id);
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, read: true } : l)));
    }
  };

  const removeLead = async (id: string) => {
    await deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const unreadCount = leads.filter((l) => !l.read).length;

  const formatDate = (createdAt: any) => {
    if (!createdAt?.seconds) return "—";
    return new Date(createdAt.seconds * 1000).toLocaleString("vi-VN");
  };

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.35rem", margin: 0 }}>
          Yêu cầu báo giá
        </h2>
        {unreadCount > 0 && (
          <span
            className="d-flex align-items-center justify-content-center rounded-pill fw-semibold"
            style={{ background: "#E1483D", color: "#fff", fontSize: ".72rem", padding: "2px 10px" }}
          >
            {unreadCount} mới
          </span>
        )}
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="rounded-4 overflow-hidden bg-white" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
            {loading ? (
              <div className="text-center p-4" style={{ color: "#96A0A8", fontSize: ".85rem" }}>
                Đang tải...
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center p-4" style={{ color: "#96A0A8", fontSize: ".85rem" }}>
                Chưa có yêu cầu nào.
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => openLead(lead)}
                  className="p-3 d-flex align-items-start gap-3"
                  style={{
                    borderTop: "1px solid #F0F2EE",
                    cursor: "pointer",
                    background: selected?.id === lead.id ? "#E4F1EA" : lead.read ? "transparent" : "#FBFBF8",
                  }}
                >
                  <span
                    className="rounded-circle flex-shrink-0 mt-1"
                    style={{ width: 8, height: 8, background: lead.read ? "transparent" : "#E1483D" }}
                  />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold" style={{ fontSize: ".88rem" }}>{lead.name}</span>
                      <span style={{ fontSize: ".72rem", color: "#96A0A8" }}>{formatDate(lead.createdAt)}</span>
                    </div>
                    <div
                      style={{
                        fontSize: ".8rem", color: "#5B6B76", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                    >
                      {lead.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-lg-7">
          {selected ? (
            <div className="rounded-4 bg-white p-4" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h3 className="h5 fw-semibold mb-1">{selected.name}</h3>
                  <div style={{ fontSize: ".78rem", color: "#96A0A8" }}>{formatDate(selected.createdAt)}</div>
                </div>
                <button
                  onClick={() => removeLead(selected.id)}
                  className="btn btn-sm"
                  style={{ background: "#FDEDEC", color: "#B93A31", fontSize: ".78rem" }}
                >
                  Xóa
                </button>
              </div>

              <div className="d-flex flex-column gap-2 mb-4">
                <a href={`tel:${selected.phone}`} className="d-flex align-items-center gap-2 text-decoration-none" style={{ color: "#223028", fontSize: ".9rem" }}>
                  <FiPhone size={14} style={{ color: "#22684F" }} /> {selected.phone}
                </a>
                <a href={`mailto:${selected.email}`} className="d-flex align-items-center gap-2 text-decoration-none" style={{ color: "#223028", fontSize: ".9rem" }}>
                  <FiMail size={14} style={{ color: "#22684F" }} /> {selected.email}
                </a>
              </div>

              <div className="rounded-3 p-3" style={{ background: "#F7FAF8" }}>
                <div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".78rem", fontWeight: 600, color: "#5B6B76" }}>
                  <FiMessageSquare size={13} /> Nội dung yêu cầu
                </div>
                <div style={{ fontSize: ".88rem", color: "#3D4A44", lineHeight: 1.6 }}>{selected.message}</div>
              </div>

              {selected.read && (
                <div className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: ".78rem", color: "#22684F" }}>
                  <FiCheckCircle size={13} /> Đã xem
                </div>
              )}
            </div>
          ) : (
            <div
              className="rounded-4 bg-white d-flex align-items-center justify-content-center p-5"
              style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)", minHeight: 240, color: "#96A0A8", fontSize: ".85rem" }}
            >
              Chọn 1 yêu cầu bên trái để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </div>
  );
}