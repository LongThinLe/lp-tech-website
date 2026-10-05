import { useState, useEffect, useMemo, useRef } from "react";
import { categoryGroups } from "../data/mockData";
import { getBrands } from "../services/brandService";
import type { Brand } from "../services/brandService";
import { addProduct, getProducts, updateProduct, deleteProduct } from "../services/productService";
import { getLeads } from "../services/leadService";
import { uploadProductImage } from "../services/storageService";
import type { Product } from "../types";
import {
  FiTag, FiLayers, FiBriefcase, FiMessageSquare,
  FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiChevronDown, FiCheckCircle,
  FiUploadCloud, FiImage, FiEdit3,
} from "react-icons/fi";

const allCategories = categoryGroups.flatMap((g) => g.items);

export default function AdminDashboardPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [isDragging, setIsDragging] = useState(false);
  const [imageFileInfo, setImageFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [specsText, setSpecsText] = useState("");
  const [uploadingSlots, setUploadingSlots] = useState<Set<string>>(new Set());

  // Lấy dữ liệu sản phẩm THẬT từ Firebase ngay khi trang vừa tải
  useEffect(() => {
    getProducts()
      .then((data) => setItems(data))
      .catch((err) => console.error("Lỗi tải sản phẩm từ Firebase:", err))
      .finally(() => setLoading(false));
  }, []);

  // Đếm số Yêu cầu báo giá thật — thay cho dấu "—" cố định trước đó
  const [leadsCount, setLeadsCount] = useState<number | null>(null);
  useEffect(() => {
    getLeads()
      .then((leads) => setLeadsCount(leads.length))
      .catch((err) => console.error("Lỗi đếm yêu cầu báo giá:", err));
  }, []);

  // Lấy dữ liệu hãng phân phối THẬT từ Firebase — thay cho danh sách viết cứng trước đó
  const [brands, setBrands] = useState<Brand[]>([]);
  useEffect(() => {
    getBrands()
      .then((data) => setBrands(data))
      .catch((err) => console.error("Lỗi tải hãng phân phối từ Firebase:", err));
  }, []);

  // Tìm kiếm + sắp xếp trong bảng
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Toast thông báo — thay cho alert()/confirm() của trình duyệt
  const [toast, setToast] = useState<{ message: string; undo?: () => void | Promise<void> } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const totalCategories = allCategories.length;

  const stats = [
    { icon: <FiTag />, num: items.length, label: "Sản phẩm", bg: "#E4F1EA", color: "#22684F" },
    { icon: <FiLayers />, num: totalCategories, label: "Danh mục", bg: "#FEF3E2", color: "#C9821E" },
    { icon: <FiBriefcase />, num: brands.length, label: "Hãng phân phối", bg: "#EAF1FD", color: "#2563EB" },
    { icon: <FiMessageSquare />, num: leadsCount ?? "—", label: "Yêu cầu báo giá", bg: "#FDEDEC", color: "#E1483D" },
  ];

  // Lọc theo tìm kiếm + sắp xếp — tính lại mỗi khi items/search/sortAsc đổi
  const displayedItems = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    return result;
  }, [items, search, sortAsc]);

  const openNew = () => {
    setEditing({
      id: `p${Date.now()}`,
      name: "",
      image: "",
      images: ["", "", ""],
      categoryId: allCategories[0]?.id ?? "",
      brandId: "", // Hãng không bắt buộc — mặc định để trống
      standards: [],
      specs: [],
      usageGuide: "",
      certification: "",
    });
    setImageFileInfo(null);
    setSpecsText("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ images: ["", "", ""], usageGuide: "", certification: "", ...p });
    setImageFileInfo(null);
    setSpecsText((p.specs ?? []).join("\n"));
    setShowForm(true);
  };

  // Tải ảnh THẬT lên Firebase Storage — chỉ lưu đường dẫn (URL) ngắn gọn vào Firestore,
  // tránh lỗi "vượt quá 1MB" khi nhồi thẳng ảnh mã hóa (base64) vào database
  const setMainImage = async (file: File) => {
    setImageFileInfo({ name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)}MB` });
    setUploadingSlots((prev) => new Set(prev).add("main"));
    try {
      const url = await uploadProductImage(file);
      setEditing((prev) => (prev ? { ...prev, image: url } : prev));
    } catch (err) {
      console.error("Lỗi tải ảnh lên Firebase Storage:", err);
      setToast({ message: "Tải ảnh lên thất bại — thử lại nhé." });
    } finally {
      setUploadingSlots((prev) => {
        const next = new Set(prev);
        next.delete("main");
        return next;
      });
    }
  };

  const setSecondaryImage = async (index: number, file: File) => {
    const slotKey = `secondary-${index}`;
    setUploadingSlots((prev) => new Set(prev).add(slotKey));
    try {
      const url = await uploadProductImage(file);
      setEditing((prev) => {
        if (!prev) return prev;
        const imgs = [...(prev.images ?? ["", "", ""])];
        imgs[index] = url;
        return { ...prev, images: imgs };
      });
    } catch (err) {
      console.error("Lỗi tải ảnh lên Firebase Storage:", err);
      setToast({ message: "Tải ảnh lên thất bại — thử lại nhé." });
    } finally {
      setUploadingSlots((prev) => {
        const next = new Set(prev);
        next.delete(slotKey);
        return next;
      });
    }
  };

  const save = async () => {
    if (!editing) return;

    // Chuyển ô "Thông số kỹ thuật" (nhiều dòng) thành mảng, mỗi dòng 1 phần tử
    const finalEditing: Product = {
      ...editing,
      specs: specsText.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    const isNew = !items.some((p) => p.id === finalEditing.id);

    try {
      if (isNew) {
        // editing.id hiện tại chỉ là id tạm (p + thời gian) — Firebase sẽ tự cấp id thật riêng
        const { id: _tempId, ...dataWithoutId } = finalEditing;
        const realId = await addProduct(dataWithoutId);
        setItems((prev) => [...prev, { ...finalEditing, id: realId }]);
      } else {
        const { id, ...dataWithoutId } = finalEditing;
        await updateProduct(id, dataWithoutId);
        setItems((prev) => prev.map((p) => (p.id === finalEditing.id ? finalEditing : p)));
      }
      setShowForm(false);
      setEditing(null);
      setToast({ message: isNew ? `Đã thêm sản phẩm "${finalEditing.name}"` : `Đã lưu thay đổi cho "${finalEditing.name}"` });
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      setToast({ message: "Có lỗi khi lưu — kiểm tra lại kết nối Firebase." });
    }
  };

  // Xóa thật trên Firebase, kèm nút "Hoàn tác" trong toast — thay cho hộp confirm() gây gián đoạn
  const remove = async (p: Product) => {
    setItems((prev) => prev.filter((item) => item.id !== p.id));
    try {
      await deleteProduct(p.id);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
    }
    setToast({
      message: `Đã xóa "${p.name}"`,
      undo: async () => {
        const { id: _oldId, ...dataWithoutId } = p;
        const newId = await addProduct(dataWithoutId);
        setItems((prev) => [...prev, { ...p, id: newId }]);
      },
    });
  };

  // Gạt "Hiện/Ẩn" — LƯU THẬT vào Firebase, để trang khách hàng tự động
  // ẩn/hiện đúng theo lựa chọn của Admin, không cần tải lại gì thêm
  const toggleVisibility = async (p: Product) => {
    const newValue = !p.hidden;
    setItems((prev) => prev.map((item) => (item.id === p.id ? { ...item, hidden: newValue } : item)));
    try {
      await updateProduct(p.id, { hidden: newValue });
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái ẩn/hiện:", err);
      setItems((prev) => prev.map((item) => (item.id === p.id ? { ...item, hidden: p.hidden } : item)));
    }
  };

  // Gạt "Nổi bật" — LƯU THẬT vào Firebase, vì trang chủ cần đọc đúng dữ liệu này từ phiên khác
  const toggleFeatured = async (p: Product) => {
    const newValue = !p.featured;
    setItems((prev) => prev.map((item) => (item.id === p.id ? { ...item, featured: newValue } : item)));
    try {
      await updateProduct(p.id, { featured: newValue });
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái nổi bật:", err);
      // Nếu lưu thất bại, trả lại trạng thái cũ trên giao diện
      setItems((prev) => prev.map((item) => (item.id === p.id ? { ...item, featured: p.featured } : item)));
    }
  };

  return (
    <div>
      {/* Phần Tổng quan — thống kê nhanh */}
      <div style={{ fontSize: ".78rem", color: "#96A0A8" }}>Chào buổi sáng 👋</div>
      <h2 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.35rem" }}>
        Tổng quan
      </h2>

      <div className="row g-3 mb-5">
        {stats.map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="p-3 rounded-4 bg-white h-100" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
              <div
                className="d-flex align-items-center justify-content-center mb-2"
                style={{ width: 38, height: 38, borderRadius: 11, background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#223028" }}>
                {s.num}
              </div>
              <div style={{ fontSize: ".78rem", color: "#96A0A8" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Phần Sản phẩm */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.2rem", margin: 0 }}>
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

      {/* Thanh tìm kiếm */}
      <div className="position-relative mb-3" style={{ width: 260 }}>
        <FiSearch className="position-absolute" style={{ left: 12, top: 11, color: "#96A0A8" }} size={14} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="form-control"
          style={{ paddingLeft: 34, fontSize: ".85rem", borderColor: "#E1E9E3", borderRadius: 10 }}
        />
      </div>

      <div className="rounded-4 overflow-hidden bg-white" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
        <table className="w-100" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#E4F1EA" }}>
              <th
                onClick={() => setSortAsc((v) => !v)}
                className="text-start d-flex align-items-center gap-1"
                style={{ padding: "13px 16px", fontSize: ".68rem", textTransform: "uppercase", color: "#22684F", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
              >
                Sản phẩm
                <FiChevronDown size={12} style={{ transform: sortAsc ? "none" : "rotate(180deg)", transition: "transform .15s" }} />
              </th>
              {["Danh mục", "Hãng", "Trạng thái", "Nổi bật", ""].map((h) => (
                <th key={h} className="text-start" style={{ padding: "13px 16px", fontSize: ".68rem", textTransform: "uppercase", color: "#22684F", fontWeight: 700 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center" style={{ padding: "30px 16px", fontSize: ".85rem", color: "#96A0A8" }}>
                  Đang tải dữ liệu sản phẩm...
                </td>
              </tr>
            ) : displayedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center" style={{ padding: "30px 16px", fontSize: ".85rem", color: "#96A0A8" }}>
                  Không tìm thấy sản phẩm nào khớp với "{search}".
                </td>
              </tr>
            ) : (
              displayedItems.map((p) => {
                const cat = allCategories.find((c) => c.id === p.categoryId);
                const brand = brands.find((b) => b.id === p.brandId);
                const isHidden = !!p.hidden;
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid #F0F2EE" }}>
                    <td style={{ padding: "13px 16px", fontSize: ".85rem" }}>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="d-inline-block me-2"
                          style={{ width: 36, height: 36, borderRadius: 9, objectFit: "cover", verticalAlign: "middle" }}
                        />
                      ) : (
                        <span className="d-inline-block me-2" style={{ width: 36, height: 36, borderRadius: 9, background: "#CDE4D8", verticalAlign: "middle" }} />
                      )}
                      {p.name}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: ".85rem", color: "#5B6B76" }}>{cat?.name ?? "—"}</td>
                    <td style={{ padding: "13px 16px", fontSize: ".85rem", color: "#5B6B76" }}>{brand?.name ?? "—"}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        onClick={() => toggleVisibility(p)}
                        className="d-inline-flex align-items-center gap-2 border-0 bg-transparent p-0"
                        style={{ cursor: "pointer" }}
                      >
                        <span
                          className="position-relative"
                          style={{
                            width: 34, height: 19, borderRadius: 20,
                            background: isHidden ? "#D8D8D3" : "#2F8F76",
                            transition: "background .2s",
                          }}
                        >
                          <span
                            className="position-absolute rounded-circle bg-white"
                            style={{ width: 15, height: 15, top: 2, left: isHidden ? 2 : 17, transition: "left .2s" }}
                          />
                        </span>
                        <span style={{ fontSize: ".75rem", fontWeight: 600, color: isHidden ? "#96A0A8" : "#22684F" }}>
                          {isHidden ? "Đang ẩn" : "Đang hiện"}
                        </span>
                      </button>
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "center" }}>
                      <button
                        onClick={() => toggleFeatured(p)}
                        className="border-0 bg-transparent p-0"
                        style={{ cursor: "pointer", fontSize: "1.1rem", color: p.featured ? "#F5C563" : "#D8D8D3" }}
                        title={p.featured ? "Bấm để bỏ nổi bật" : "Bấm để đặt làm nổi bật"}
                      >
                        {p.featured ? "★" : "☆"}
                      </button>
                    </td>
                    <td style={{ padding: "13px 16px", textAlign: "right" }}>
                      <button onClick={() => openEdit(p)} className="btn btn-sm me-1" style={{ background: "#F1F1EE" }}>
                        <FiEdit2 size={13} />
                      </button>
                      <button onClick={() => remove(p)} className="btn btn-sm" style={{ background: "#F1F1EE" }}>
                        <FiTrash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-4 mt-4" style={{ background: "#E4F1EA", fontSize: ".85rem", color: "#3D4A44" }}>
        <b>Đã kết nối Firebase:</b> Các thay đổi (thêm/sửa/xóa) giờ được lưu thật vào database,
        không còn mất khi tải lại trang. Ảnh sản phẩm hiện lưu tạm dưới dạng mã hóa trực tiếp —
        nếu dùng nhiều ảnh dung lượng lớn nên tải qua Firebase Storage.
      </div>

      {/* Form thêm/sửa — thiết kế mới, có kéo-thả ảnh thật */}
      {showForm && editing && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,.4)", zIndex: 1000 }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white overflow-hidden"
            style={{ width: 460, maxWidth: "90vw", maxHeight: "88vh", borderRadius: 22, boxShadow: "0 24px 60px rgba(27,46,39,.2)", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header xanh đậm */}
            <div
              className="d-flex align-items-center gap-3"
              style={{ padding: "22px 26px", background: "linear-gradient(135deg, #22684F 0%, #1B2E27 100%)", flexShrink: 0 }}
            >
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,.15)", color: "#fff" }}
              >
                <FiTag size={18} />
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                  {items.some((p) => p.id === editing.id) ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                </div>
                <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.6)" }}>Điền thông tin sản phẩm</div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="btn btn-sm border-0 ms-auto"
                style={{ color: "rgba(255,255,255,.7)" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ padding: "24px 26px 26px", overflowY: "auto" }}>
              <label className="d-flex align-items-center gap-2 form-label" style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" }}>
                <FiEdit3 size={13} style={{ color: "#2F8F76" }} /> Tên sản phẩm
              </label>
              <input
                className="form-control mb-3"
                style={{ borderColor: "#E1E9E3", borderRadius: 10 }}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />

              <label className="d-flex align-items-center gap-2 form-label" style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" }}>
                <FiImage size={13} style={{ color: "#2F8F76" }} /> Hình ảnh sản phẩm
              </label>

              {/* Vùng kéo-thả / bấm chọn ảnh */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setMainImage(file);
                }}
              />

              {uploadingSlots.has("main") ? (
                <div
                  className="rounded-3 d-flex flex-column align-items-center justify-content-center mb-3"
                  style={{ height: 140, background: "#F7FAF8", border: "1.5px dashed #B8CFC3", color: "#5B6B76", fontSize: ".8rem" }}
                >
                  <div className="spinner-border spinner-border-sm mb-2" style={{ color: "#2F8F76" }} role="status" />
                  Đang tải ảnh lên...
                </div>
              ) : editing.image ? (
                <div className="position-relative rounded-3 overflow-hidden mb-3" style={{ height: 140 }}>
                  <img src={editing.image} alt="Xem trước" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span
                    className="position-absolute top-0 start-0 m-2 fw-semibold rounded-pill"
                    style={{ background: "rgba(255,255,255,.92)", color: "#22684F", fontSize: ".62rem", padding: "3px 8px" }}
                  >
                    Ảnh chính
                  </span>
                  <div
                    className="position-absolute bottom-0 start-0 end-0 d-flex align-items-center justify-content-between"
                    style={{ padding: "10px 12px", background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.55) 100%)" }}
                  >
                    <span style={{ color: "#fff", fontSize: ".68rem" }}>
                      {imageFileInfo ? `${imageFileInfo.name} · ${imageFileInfo.size}` : "Ảnh hiện tại"}
                    </span>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-sm rounded-pill"
                        style={{ background: "rgba(255,255,255,.92)", color: "#223028", fontSize: ".68rem", fontWeight: 600 }}
                      >
                        Đổi ảnh
                      </button>
                      <button
                        onClick={() => { setEditing({ ...editing, image: "" }); setImageFileInfo(null); }}
                        className="btn btn-sm rounded-pill"
                        style={{ background: "rgba(255,255,255,.92)", color: "#B93A31", fontSize: ".68rem", fontWeight: 600 }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) setMainImage(file);
                  }}
                  className="rounded-3 text-center mb-3"
                  style={{
                    border: `1.5px dashed ${isDragging ? "#2F8F76" : "#B8CFC3"}`,
                    background: isDragging ? "#EEF4F0" : "#F7FAF8",
                    padding: "28px 20px",
                    cursor: "pointer",
                    transition: "border-color .15s, background .15s",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2"
                    style={{ width: 46, height: 46, background: "#E4F1EA", color: "#22684F" }}
                  >
                    <FiUploadCloud size={20} />
                  </div>
                  <div style={{ fontSize: ".85rem", fontWeight: 600, color: "#223028" }}>
                    Kéo ảnh vào đây hoặc <span style={{ color: "#2F8F76", textDecoration: "underline" }}>chọn từ máy</span>
                  </div>
                  <div style={{ fontSize: ".72rem", color: "#96A0A8", marginTop: 4 }}>PNG, JPG — tối đa 5MB</div>
                </div>
              )}

              {/* 3 ô ảnh phụ */}
              <div className="row g-2 mb-2">
                {[0, 1, 2].map((i) => (
                  <div className="col-4" key={i}>
                    <input
                      ref={secondaryFileRefs[i]}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSecondaryImage(i, file);
                      }}
                    />
                    <div
                      onClick={() => secondaryFileRefs[i].current?.click()}
                      className="rounded-3 d-flex align-items-center justify-content-center overflow-hidden"
                      style={{
                        aspectRatio: "1/1",
                        cursor: "pointer",
                        border: editing.images?.[i] ? "1.5px solid #E1E9E3" : "1.5px dashed #B8CFC3",
                        background: editing.images?.[i] ? "transparent" : "#F7FAF8",
                      }}
                    >
                      {uploadingSlots.has(`secondary-${i}`) ? (
                        <div className="spinner-border spinner-border-sm" style={{ color: "#2F8F76" }} role="status" />
                      ) : editing.images?.[i] ? (
                        <img src={editing.images[i]} alt={`Ảnh phụ ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "1.2rem", color: "#96A0A8" }}>+</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-3" style={{ fontSize: ".72rem", color: "#96A0A8" }}>
                Ảnh chính hiện lớn ở trang sản phẩm — 3 ô nhỏ là ảnh phụ, không bắt buộc.
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="d-flex align-items-center gap-2 form-label" style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" }}>
                    <FiLayers size={13} style={{ color: "#2F8F76" }} /> Danh mục
                  </label>
                  <select
                    className="form-control"
                    style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".85rem" }}
                    value={editing.categoryId}
                    onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="d-flex align-items-center gap-2 form-label" style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" }}>
                    <FiBriefcase size={13} style={{ color: "#2F8F76" }} /> Hãng phân phối (không bắt buộc)
                  </label>
                  <select
                    className="form-control"
                    style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".85rem" }}
                    value={editing.brandId ?? ""}
                    onChange={(e) => setEditing({ ...editing, brandId: e.target.value })}
                  >
                    <option value="">— Không có hãng —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="mb-3 mt-1"
                style={{ fontSize: ".72rem", fontWeight: 700, color: "#22684F", textTransform: "uppercase", letterSpacing: ".02em" }}
              >
                Thông tin chi tiết (hiện ở trang sản phẩm)
              </div>

              <label className="form-label" style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" }}>Thông số kỹ thuật</label>
              <textarea
                className="form-control mb-1"
                style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".82rem", minHeight: 70 }}
                placeholder={"Độ co giãn cao\nChống ẩm, chống rách\nDùng cho pallet hàng hoá"}
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
              />
              <div className="mb-3" style={{ fontSize: ".7rem", color: "#96A0A8" }}>
                Mỗi dòng là 1 gạch đầu dòng, xuống dòng để thêm ý mới.
              </div>

              <label className="form-label" style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" }}>Hướng dẫn sử dụng</label>
              <textarea
                className="form-control mb-3"
                style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".82rem", minHeight: 60 }}
                placeholder="VD: Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp..."
                value={editing.usageGuide ?? ""}
                onChange={(e) => setEditing({ ...editing, usageGuide: e.target.value })}
              />

              <label className="form-label" style={{ fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" }}>Chứng nhận chất lượng</label>
              <textarea
                className="form-control mb-4"
                style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".82rem", minHeight: 60 }}
                placeholder="VD: Đạt chuẩn ISO 9001, có đầy đủ CO/CQ kèm lô hàng"
                value={editing.certification ?? ""}
                onChange={(e) => setEditing({ ...editing, certification: e.target.value })}
              />

              <button
                onClick={save}
                disabled={uploadingSlots.size > 0}
                className="btn w-100"
                style={{
                  background: "linear-gradient(135deg, #2F8F76, #22684F)", color: "#fff", fontWeight: 700,
                  fontSize: ".9rem", padding: 13, border: "none", borderRadius: 11,
                  boxShadow: "0 6px 16px rgba(47,143,118,.3)",
                  opacity: uploadingSlots.size > 0 ? .6 : 1,
                }}
              >
                {uploadingSlots.size > 0 ? "Đang tải ảnh lên..." : "Lưu sản phẩm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast thông báo — góc dưới phải, tự biến mất sau 5 giây */}
      {toast && (
        <div
          className="position-fixed d-flex align-items-center gap-3"
          style={{
            bottom: 24, right: 24, zIndex: 1100,
            background: "#223028", color: "#fff", padding: "14px 20px", borderRadius: 14,
            boxShadow: "0 12px 30px rgba(0,0,0,.25)", fontSize: ".85rem", maxWidth: 380,
          }}
        >
          <span
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{ width: 32, height: 32, background: "rgba(47,143,118,.25)", color: "#4FBF9A" }}
          >
            <FiCheckCircle size={16} />
          </span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          {toast.undo && (
            <button
              onClick={() => { toast.undo?.(); setToast(null); }}
              className="border-0 bg-transparent fw-semibold flex-shrink-0"
              style={{ color: "#4FBF9A", fontSize: ".82rem" }}
            >
              Hoàn tác
            </button>
          )}
        </div>
      )}
    </div>
  );
}