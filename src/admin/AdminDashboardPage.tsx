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

// Số ảnh tối đa cho 1 sản phẩm (tính cả ảnh chính) — khách chưa chốt, đổi số này khi cần
const MAX_IMAGES = 10;

export default function AdminDashboardPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [specsText, setSpecsText] = useState("");
  // Số ảnh đang được tải lên (để hiện vòng xoay và khóa nút Lưu)
  const [uploadingCount, setUploadingCount] = useState(0);

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

  // Gộp ảnh chính + ảnh phụ thành 1 danh sách duy nhất (ảnh đầu tiên = ảnh chính)
  const allImages: string[] = editing
    ? ([editing.image, ...(editing.images ?? [])].filter(Boolean) as string[])
    : [];

  // Ghi ngược danh sách ảnh về dạng "image" (chính) + "images" (phụ)
  const setAllImages = (list: string[]) => {
    setEditing((prev) => (prev ? { ...prev, image: list[0] ?? "", images: list.slice(1) } : prev));
  };

  const openNew = () => {
    setEditing({
      id: `p${Date.now()}`,
      name: "",
      image: "",
      images: [],
      categoryId: allCategories[0]?.id ?? "",
      brandId: "", // Hãng không bắt buộc — mặc định để trống
      standards: [],
      specs: [],
      usageGuide: "",
      certification: "",
    });
    setSpecsText("");
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing({
      usageGuide: "",
      certification: "",
      ...p,
      images: (p.images ?? []).filter(Boolean),
    });
    setSpecsText((p.specs ?? []).join("\n"));
    setShowForm(true);
  };

  // Chọn NHIỀU ảnh cùng lúc: tải song song lên Firebase Storage, chỉ lưu đường dẫn (URL) vào Firestore.
  // Ảnh đầu tiên thành ảnh chính (nếu chưa có), các ảnh còn lại thành ảnh phụ.
  const addImages = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    const room = MAX_IMAGES - allImages.length - uploadingCount;
    if (room <= 0) {
      setToast({ message: `Mỗi sản phẩm tối đa ${MAX_IMAGES} ảnh.` });
      return;
    }
    const chosen = files.slice(0, room);
    if (files.length > room) {
      setToast({ message: `Chỉ nhận thêm ${room} ảnh (tối đa ${MAX_IMAGES} ảnh/sản phẩm).` });
    }

    setUploadingCount((c) => c + chosen.length);
    const urls = await Promise.all(
      chosen.map((f) =>
        uploadProductImage(f).catch((err) => {
          console.error("Lỗi tải ảnh lên Firebase Storage:", err);
          return null;
        })
      )
    );
    const okUrls = urls.filter((u): u is string => !!u);

    if (okUrls.length < chosen.length) {
      setToast({ message: `Có ${chosen.length - okUrls.length} ảnh tải lên thất bại — thử lại nhé.` });
    }

    setEditing((prev) => {
      if (!prev) return prev;
      const list = [prev.image, ...(prev.images ?? [])].filter(Boolean) as string[];
      const next = [...list, ...okUrls];
      return { ...prev, image: next[0] ?? "", images: next.slice(1) };
    });
    setUploadingCount((c) => c - chosen.length);
  };

  const removeImage = (index: number) => {
    setAllImages(allImages.filter((_, i) => i !== index));
  };

  const makeMainImage = (index: number) => {
    const picked = allImages[index];
    setAllImages([picked, ...allImages.filter((_, i) => i !== index)]);
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

  const labelStyle = { fontSize: ".78rem", fontWeight: 600, color: "#3D4A44" } as const;

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

      {/* Form thêm/sửa — TOÀN MÀN HÌNH, chia 2 cột */}
      {showForm && editing && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column bg-white"
          style={{ zIndex: 1000 }}
        >
          {/* Header xanh đậm */}
          <div
            className="d-flex align-items-center gap-3"
            style={{ padding: "18px 28px", background: "linear-gradient(135deg, #22684F 0%, #1B2E27 100%)", flexShrink: 0 }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,.15)", color: "#fff" }}
            >
              <FiTag size={18} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                {items.some((p) => p.id === editing.id) ? "Sửa sản phẩm" : "Thêm sản phẩm"}
              </div>
              <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.6)" }}>Điền thông tin sản phẩm</div>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="btn btn-sm border-0 ms-auto d-inline-flex align-items-center gap-1"
              style={{ color: "rgba(255,255,255,.85)" }}
            >
              <FiX /> Đóng
            </button>
          </div>

          {/* Nội dung — cuộn được, căn giữa, tối đa 1100px */}
          <div style={{ flex: 1, overflowY: "auto", background: "#F7FAF8" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
              <div className="row g-4">
                {/* Cột trái: tên + hình ảnh */}
                <div className="col-lg-6">
                  <div className="bg-white rounded-4 p-4 h-100" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
                    <label className="d-flex align-items-center gap-2 form-label" style={labelStyle}>
                      <FiEdit3 size={13} style={{ color: "#2F8F76" }} /> Tên sản phẩm
                    </label>
                    <input
                      className="form-control mb-4"
                      style={{ borderColor: "#E1E9E3", borderRadius: 10 }}
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    />

                    <label className="d-flex align-items-center gap-2 form-label" style={labelStyle}>
                      <FiImage size={13} style={{ color: "#2F8F76" }} /> Hình ảnh sản phẩm
                    </label>

                    {/* Ô chọn file ẩn — có "multiple" để chọn nhiều ảnh cùng lúc */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="d-none"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) addImages(e.target.files);
                        e.target.value = ""; // cho phép chọn lại đúng ảnh vừa chọn
                      }}
                    />

                    {allImages.length === 0 && uploadingCount === 0 ? (
                      /* Chưa có ảnh nào: vùng kéo-thả lớn */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
                        }}
                        className="rounded-3 text-center mb-2"
                        style={{
                          border: `1.5px dashed ${isDragging ? "#2F8F76" : "#B8CFC3"}`,
                          background: isDragging ? "#EEF4F0" : "#F7FAF8",
                          padding: "44px 20px",
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
                          Kéo nhiều ảnh vào đây hoặc <span style={{ color: "#2F8F76", textDecoration: "underline" }}>chọn từ máy</span>
                        </div>
                        <div style={{ fontSize: ".72rem", color: "#96A0A8", marginTop: 4 }}>
                          PNG, JPG — chọn được nhiều ảnh cùng lúc, tối đa {MAX_IMAGES} ảnh
                        </div>
                      </div>
                    ) : (
                      /* Đã có ảnh: lưới ảnh + ô "+" để thêm tiếp */
                      <div className="row g-2 mb-2">
                        {allImages.map((img, i) => (
                          <div className="col-4 col-md-3" key={`${img}-${i}`}>
                            <div
                              className="position-relative rounded-3 overflow-hidden"
                              style={{ aspectRatio: "1/1", border: "1.5px solid #E1E9E3" }}
                            >
                              <img
                                src={img}
                                alt={i === 0 ? "Ảnh chính" : `Ảnh phụ ${i}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              {i === 0 && (
                                <span
                                  className="position-absolute top-0 start-0 m-1 fw-semibold rounded-pill"
                                  style={{ background: "rgba(255,255,255,.92)", color: "#22684F", fontSize: ".6rem", padding: "2px 7px" }}
                                >
                                  Ảnh chính
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                aria-label="Xóa ảnh"
                                className="position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center border-0 rounded-circle"
                                style={{ width: 22, height: 22, background: "rgba(255,255,255,.92)", color: "#B93A31", cursor: "pointer" }}
                              >
                                <FiX size={12} />
                              </button>
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => makeMainImage(i)}
                                  className="position-absolute bottom-0 start-0 end-0 border-0"
                                  style={{ background: "rgba(0,0,0,.5)", color: "#fff", fontSize: ".6rem", padding: "3px 0", cursor: "pointer" }}
                                >
                                  Đặt làm chính
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Ô đang tải ảnh lên */}
                        {Array.from({ length: uploadingCount }).map((_, i) => (
                          <div className="col-4 col-md-3" key={`uploading-${i}`}>
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center"
                              style={{ aspectRatio: "1/1", background: "#F7FAF8", border: "1.5px dashed #B8CFC3" }}
                            >
                              <div className="spinner-border spinner-border-sm" style={{ color: "#2F8F76" }} role="status" />
                            </div>
                          </div>
                        ))}

                        {/* Ô "+" thêm ảnh — ẩn khi đã đủ số ảnh tối đa */}
                        {allImages.length + uploadingCount < MAX_IMAGES && (
                          <div className="col-4 col-md-3">
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                              onDragLeave={() => setIsDragging(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
                              }}
                              className="rounded-3 d-flex flex-column align-items-center justify-content-center"
                              style={{
                                aspectRatio: "1/1",
                                cursor: "pointer",
                                border: `1.5px dashed ${isDragging ? "#2F8F76" : "#B8CFC3"}`,
                                background: isDragging ? "#EEF4F0" : "#F7FAF8",
                                color: "#96A0A8",
                              }}
                            >
                              <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>+</span>
                              <span style={{ fontSize: ".62rem", marginTop: 2 }}>Thêm ảnh</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ fontSize: ".72rem", color: "#96A0A8" }}>
                      Ảnh đầu tiên là ảnh chính (hiện lớn ở trang sản phẩm), các ảnh sau là ảnh phụ.
                      Đã có {allImages.length}/{MAX_IMAGES} ảnh.
                    </div>
                  </div>
                </div>

                {/* Cột phải: danh mục, hãng, thông tin chi tiết */}
                <div className="col-lg-6">
                  <div className="bg-white rounded-4 p-4 h-100" style={{ boxShadow: "0 4px 16px rgba(34,48,40,.06)" }}>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="d-flex align-items-center gap-2 form-label" style={labelStyle}>
                          <FiLayers size={13} style={{ color: "#2F8F76" }} /> Danh mục
                        </label>
                        <select
                          className="form-control"
                          style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".85rem" }}
                          value={editing.categoryId}
                          onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                        >
                          {/* Gom theo tiêu đề cấp 1 — tiêu đề chỉ để nhìn, chọn mục nhỏ bên dưới */}
                          {categoryGroups.map((g) => (
                            <optgroup key={g.id} label={g.name}>
                              {g.items.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="d-flex align-items-center gap-2 form-label" style={labelStyle}>
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
                      className="mb-3"
                      style={{ fontSize: ".72rem", fontWeight: 700, color: "#22684F", textTransform: "uppercase", letterSpacing: ".02em" }}
                    >
                      Thông tin chi tiết (hiện ở trang sản phẩm)
                    </div>

                    <label className="form-label" style={labelStyle}>Thông số kỹ thuật</label>
                    <textarea
                      className="form-control mb-1"
                      style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".82rem", minHeight: 110 }}
                      placeholder={"Độ co giãn cao\nChống ẩm, chống rách\nDùng cho pallet hàng hoá"}
                      value={specsText}
                      onChange={(e) => setSpecsText(e.target.value)}
                    />
                    <div className="mb-3" style={{ fontSize: ".7rem", color: "#96A0A8" }}>
                      Mỗi dòng là 1 gạch đầu dòng, xuống dòng để thêm ý mới.
                    </div>

                    <label className="form-label" style={labelStyle}>Hướng dẫn sử dụng</label>
                    <textarea
                      className="form-control mb-3"
                      style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".82rem", minHeight: 100 }}
                      placeholder="VD: Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp..."
                      value={editing.usageGuide ?? ""}
                      onChange={(e) => setEditing({ ...editing, usageGuide: e.target.value })}
                    />

                    <label className="form-label" style={labelStyle}>Chứng nhận chất lượng</label>
                    <textarea
                      className="form-control"
                      style={{ borderColor: "#E1E9E3", borderRadius: 10, fontSize: ".82rem", minHeight: 100 }}
                      placeholder="VD: Đạt chuẩn ISO 9001, có đầy đủ CO/CQ kèm lô hàng"
                      value={editing.certification ?? ""}
                      onChange={(e) => setEditing({ ...editing, certification: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thanh dưới cố định: Hủy + Lưu */}
          <div
            className="d-flex justify-content-end gap-2"
            style={{ padding: "14px 28px", borderTop: "1px solid #E1E9E3", background: "#fff", flexShrink: 0 }}
          >
            <button
              onClick={() => setShowForm(false)}
              className="btn"
              style={{ background: "#F1F1EE", fontWeight: 600, fontSize: ".9rem", padding: "11px 24px", borderRadius: 11 }}
            >
              Hủy
            </button>
            <button
              onClick={save}
              disabled={uploadingCount > 0}
              className="btn"
              style={{
                background: "linear-gradient(135deg, #2F8F76, #22684F)", color: "#fff", fontWeight: 700,
                fontSize: ".9rem", padding: "11px 36px", border: "none", borderRadius: 11,
                boxShadow: "0 6px 16px rgba(47,143,118,.3)",
                opacity: uploadingCount > 0 ? .6 : 1,
              }}
            >
              {uploadingCount > 0 ? "Đang tải ảnh lên..." : "Lưu sản phẩm"}
            </button>
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