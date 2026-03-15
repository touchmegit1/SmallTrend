import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  MapPin,
  Edit2,
  ChevronDown,
  ChevronRight,
  Store,
  Warehouse,
  Package,
  Loader2,
  X,
  Box,
  Eye,
  ToggleLeft,
  ToggleRight,
  ArrowRightLeft,
  ArrowLeft,
} from "lucide-react";
import {
  getLocations,
  createLocation,
  updateLocation,
  toggleLocationStatus,
  transferStock,
} from "../../services/inventoryService";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../components/ui/Toast";
import CustomSelect from "../../components/common/CustomSelect";

function LocationManagement() {
  const toast = useToast();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [expandedLocationId, setExpandedLocationId] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalData, setStockModalData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    location: null,
  });
  const [toggling, setToggling] = useState(false);

  // Transfer modal state
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    location: null,
  });
  const [transferData, setTransferData] = useState({
    toLocationId: "",
    selectedItem: null, // { variantId, batchId, productName, quantity, batchCode, variantUnit }
    quantity: 1,
  });
  const [transferring, setTransferring] = useState(false);
  const [formData, setFormData] = useState({
    location_name: "",
    location_code: "",
    location_type: "SHELF",
    address: "",
    capacity: 0,
    description: "",
  });

  const locationTypes = [
    { value: "DISPLAY", label: "Khu vực trưng bày", icon: Store },
    { value: "STORAGE", label: "Kho lưu trữ", icon: Warehouse },
    { value: "SHELF", label: "Kệ hàng", icon: Package },
    { value: "COLD_STORAGE", label: "Kho lạnh", icon: MapPin },
    { value: "CASHIER", label: "Quầy thu ngân", icon: MapPin },
  ];

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error(error?.message || "Không thể tải danh sách vị trí", {
        title: "Lỗi tải dữ liệu",
      });
    } finally {
      setLoading(false);
    }
  };

  const classifyErrorTitle = (message = "") => {
    const text = message.toLowerCase();
    if (
      text.includes("không được") ||
      text.includes("thiếu") ||
      text.includes("lớn hơn 0")
    ) {
      return "Dữ liệu chưa hợp lệ";
    }
    if (
      text.includes("đã tồn tại") ||
      text.includes("không thể") ||
      text.includes("vượt quá") ||
      text.includes("tham chiếu")
    ) {
      return "Không thể thực hiện";
    }
    return "Lỗi hệ thống";
  };

  const getErrorMessage = (error, fallback) =>
    (error?.message || "").trim() || fallback;

  const validateLocationForm = () => {
    if (!formData.location_code?.trim()) {
      toast.error("Mã vị trí không được để trống", { title: "Dữ liệu chưa hợp lệ" });
      return false;
    }
    if (!formData.location_name?.trim()) {
      toast.error("Tên vị trí không được để trống", {
        title: "Dữ liệu chưa hợp lệ",
      });
      return false;
    }
    if ((Number(formData.capacity) || 0) < 0) {
      toast.error("Sức chứa không được nhỏ hơn 0", {
        title: "Dữ liệu chưa hợp lệ",
      });
      return false;
    }
    return true;
  };

  const validateTransferForm = () => {
    const { toLocationId, selectedItem, quantity } = transferData;
    if (!toLocationId || !selectedItem) {
      toast.error("Vui lòng chọn sản phẩm và vị trí đích", {
        title: "Thiếu thông tin",
      });
      return null;
    }

    const transferQty = Number(quantity);
    if (!Number.isInteger(transferQty) || transferQty <= 0) {
      toast.error("Số lượng chuyển phải lớn hơn 0", {
        title: "Dữ liệu chưa hợp lệ",
      });
      return null;
    }

    if (transferQty > Number(selectedItem.quantity || 0)) {
      toast.error("Số lượng chuyển vượt quá tồn kho hiện có", {
        title: "Dữ liệu chưa hợp lệ",
      });
      return null;
    }

    const destinationId = Number(toLocationId);
    if (destinationId === transferModal.location?.id) {
      toast.error("Vị trí nguồn và đích không được trùng nhau", {
        title: "Dữ liệu chưa hợp lệ",
      });
      return null;
    }

    const destination = locations.find((l) => l.id === destinationId);
    if (!destination || destination.status !== "ACTIVE") {
      toast.error("Vị trí đích phải ở trạng thái hoạt động", {
        title: "Dữ liệu chưa hợp lệ",
      });
      return null;
    }

    return { transferQty, destinationId, selectedItem };
  };

  const buildLocationPayload = () => ({
    ...formData,
    location_code: formData.location_code?.trim(),
    location_name: formData.location_name?.trim(),
    address: formData.address?.trim(),
    description: formData.description?.trim(),
    capacity: Number(formData.capacity) || 0,
  });

  const buildTransferPayload = ({ transferQty, destinationId, selectedItem }) => ({
    fromLocationId: transferModal.location.id,
    toLocationId: destinationId,
    variantId: Number(selectedItem.variantId),
    batchId: Number(selectedItem.batchId),
    quantity: transferQty,
  });

  const showApiErrorToast = (error, fallbackMessage) => {
    const message = getErrorMessage(error, fallbackMessage);
    toast.error(message, {
      title: classifyErrorTitle(message),
      duration: 5000,
    });
  };

  const handleLocationSaved = (savedMessage) => {
    toast.success(savedMessage);
    fetchLocations();
    setIsModalOpen(false);
  };

  const handleTransferSuccess = (transferQty, selectedItem) => {
    toast.success(
      `Đã chuyển ${transferQty} ${selectedItem.variantUnit || ""} "${selectedItem.productName}" thành công!`,
    );
    setTransferModal({ isOpen: false, location: null });
    fetchLocations();
  };

  const normalizeFormData = (location) => ({
    location_name: location.location_name,
    location_code: location.location_code,
    location_type: location.location_type,
    address: location.address,
    capacity: location.capacity,
    description: location.description,
  });

  const createInitialFormData = () => ({
    location_name: "",
    location_code: "",
    location_type: "SHELF",
    address: "",
    capacity: 0,
    description: "",
  });

  const createInitialTransferData = () => ({
    toLocationId: "",
    selectedItem: null,
    quantity: 1,
  });

  const parseDestinationName = (id) =>
    locations.find((l) => l.id === Number(id))?.location_name || "";

  const isTransferSubmitDisabled =
    transferring || !transferData.selectedItem || !transferData.toLocationId;

  const handleOpenModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData(normalizeFormData(location));
    } else {
      setEditingLocation(null);
      setFormData(createInitialFormData());
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateLocationForm()) return;

    const payload = buildLocationPayload();
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, payload);
        handleLocationSaved("Đã cập nhật vị trí thành công!");
      } else {
        await createLocation(payload);
        handleLocationSaved("Đã tạo vị trí mới thành công!");
      }
    } catch (error) {
      console.error("Error saving location:", error);
      showApiErrorToast(error, "Có lỗi xảy ra khi lưu vị trí");
    }
  };

  const handleToggleStatus = (loc) => {
    setConfirmModal({ isOpen: true, location: loc });
  };

  const confirmToggle = async () => {
    const loc = confirmModal.location;
    if (!loc) return;

    const isActive = loc.status === "ACTIVE";
    setToggling(true);
    try {
      await toggleLocationStatus(loc.id);
      fetchLocations();
      setConfirmModal({ isOpen: false, location: null });
      toast.success(
        isActive
          ? `Vị trí "${loc.location_name}" đã được chuyển sang Ngừng hoạt động.`
          : `Vị trí "${loc.location_name}" đã được kích hoạt lại.`,
      );
    } catch (error) {
      console.error("Error toggling location status:", error);
      setConfirmModal({ isOpen: false, location: null });
      showApiErrorToast(error, "Không thể chuyển trạng thái vị trí");
    } finally {
      setToggling(false);
    }
  };

  const toggleExpand = (locId) => {
    setExpandedLocationId(expandedLocationId === locId ? null : locId);
  };

  const openStockModal = (loc) => {
    setStockModalData(loc);
    setIsStockModalOpen(true);
  };

  const openTransferModal = (loc) => {
    setTransferModal({ isOpen: true, location: loc });
    setTransferData(createInitialTransferData());
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const validated = validateTransferForm();
    if (!validated) return;

    const { transferQty, selectedItem } = validated;
    setTransferring(true);
    try {
      await transferStock(buildTransferPayload(validated));
      handleTransferSuccess(transferQty, selectedItem);
    } catch (error) {
      showApiErrorToast(error, "Chuyển hàng thất bại");
    } finally {
      setTransferring(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      (loc.location_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (loc.location_code || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter && statusFilter !== "all"
        ? loc.status === statusFilter
        : true;
    const matchesType =
      typeFilter && typeFilter !== "all"
        ? loc.location_type === typeFilter
        : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getIcon = (type) => {
    const found = locationTypes.find((t) => t.value === type);
    return found ? found.icon : MapPin;
  };

  const getLabel = (type) => {
    const found = locationTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/inventory")}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition text-slate-500 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản lý khu vực & vị trí
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Sắp xếp không gian cửa hàng và vị trí trưng bày sản phẩm
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          Thêm vị trí mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <CustomSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "Tất cả loại hình" },
                ...locationTypes.map((t) => ({
                  value: t.value,
                  label: t.label,
                })),
              ]}
              className="min-w-[170px]"
            />
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              variant="status"
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "ACTIVE", label: "Đang hoạt động" },
                { value: "INACTIVE", label: "Ngừng hoạt động" },
              ]}
              className="min-w-[170px]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-3 py-4 w-10"></th>
                <th className="px-4 py-4">Tên & Mã vị trí</th>
                <th className="px-4 py-4">Loại hình</th>
                <th className="px-4 py-4">Địa chỉ / Vị trí</th>
                <th className="px-4 py-4 text-center">Sức chứa</th>
                <th className="px-4 py-4 text-center">Tồn kho</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLocations.map((loc) => {
                const Icon = getIcon(loc.location_type);
                const isExpanded = expandedLocationId === loc.id;
                const stockItems = loc.stock_items || [];
                const totalProducts = loc.total_products || 0;

                return (
                  <React.Fragment key={loc.id}>
                    <tr
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${
                        isExpanded ? "bg-indigo-50/30" : ""
                      }`}
                      onClick={() => toggleExpand(loc.id)}
                    >
                      <td className="px-3 py-4 text-center">
                        <button
                          className="p-1 rounded hover:bg-slate-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(loc.id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown
                              size={16}
                              className="text-indigo-600"
                            />
                          ) : (
                            <ChevronRight
                              size={16}
                              className="text-slate-400"
                            />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {loc.location_name}
                            </p>
                            <p className="text-xs text-slate-500 font-mono uppercase">
                              {loc.location_code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {getLabel(loc.location_type)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 max-w-xs truncate">
                        {loc.address}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm font-medium text-slate-700">
                          {loc.capacity}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {totalProducts > 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openStockModal(loc);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Xem chi tiết sản phẩm"
                          >
                            <Box size={14} />
                            {totalProducts}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-sm">
                            0
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            loc.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {loc.status === "ACTIVE"
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openStockModal(loc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Xem sản phẩm"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTransferModal(loc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                            title="Chuyển hàng sang vị trí khác"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(loc);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(loc);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                              loc.status === "ACTIVE"
                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={
                              loc.status === "ACTIVE"
                                ? "Chuyển sang Ngừng hoạt động"
                                : "Kích hoạt lại"
                            }
                          >
                            {loc.status === "ACTIVE" ? (
                              <ToggleRight size={18} />
                            ) : (
                              <ToggleLeft size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row - Inline Stock Preview */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="8" className="p-0">
                          <div className="bg-gradient-to-b from-indigo-50/50 to-slate-50/50 px-6 py-4 border-t border-indigo-100">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Box size={16} className="text-indigo-500" />
                                Sản phẩm tại vị trí "{loc.location_name}"
                                <span className="text-xs font-normal text-slate-400 ml-1">
                                  (Tổng: {totalProducts} sản phẩm)
                                </span>
                              </h4>
                              {stockItems.length > 0 && (
                                <button
                                  onClick={() => openStockModal(loc)}
                                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 hover:underline"
                                >
                                  Xem chi tiết
                                  <ChevronRight size={14} />
                                </button>
                              )}
                            </div>

                            {stockItems.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {stockItems.slice(0, 6).map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <Package
                                        size={18}
                                        className="text-indigo-600"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 truncate">
                                        {item.product_name || "N/A"}
                                      </p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-slate-400 font-mono">
                                          {item.sku || "—"}
                                        </span>
                                        {item.batch_code && (
                                          <>
                                            <span className="text-slate-300">
                                              •
                                            </span>
                                            <span className="text-xs text-slate-400">
                                              Lô: {item.batch_code}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-sm font-bold text-indigo-600">
                                        {item.quantity}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {item.variant_unit || "đơn vị"}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {stockItems.length > 6 && (
                                  <button
                                    onClick={() => openStockModal(loc)}
                                    className="flex items-center justify-center gap-2 bg-white/60 p-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all"
                                  >
                                    <span className="text-sm font-medium">
                                      +{stockItems.length - 6} sản phẩm khác
                                    </span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200">
                                <Package
                                  size={32}
                                  className="mx-auto text-slate-300 mb-2"
                                />
                                <p className="text-sm text-slate-400">
                                  Chưa có sản phẩm nào tại vị trí này
                                </p>
                                <p className="text-xs text-slate-300 mt-1">
                                  Tạo đơn nhập kho để thêm sản phẩm vào vị trí
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredLocations.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                <MapPin className="text-slate-300" size={40} />
              </div>
              <p className="text-slate-500 font-medium">
                Không tìm thấy vị trí nào khớp với từ khóa tìm kiếm
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Detail Modal */}
      {isStockModalOpen && stockModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Box size={20} className="text-indigo-600" />
                  Sản phẩm tại {stockModalData.location_name}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Mã: {stockModalData.location_code} •{" "}
                  {getLabel(stockModalData.location_type)} • Tổng:{" "}
                  <span className="font-semibold text-indigo-600">
                    {stockModalData.total_products || 0}
                  </span>{" "}
                  sản phẩm
                </p>
              </div>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {(stockModalData.stock_items || []).length > 0 ? (
                <div className="space-y-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-3 font-semibold">#</th>
                        <th className="py-3 px-3 font-semibold">Sản phẩm</th>
                        <th className="py-3 px-3 font-semibold">SKU</th>
                        <th className="py-3 px-3 font-semibold">Lô hàng</th>
                        <th className="py-3 px-3 font-semibold text-center">
                          Đơn vị
                        </th>
                        <th className="py-3 px-3 font-semibold text-right">
                          Số lượng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stockModalData.stock_items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-3 text-sm text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package
                                  size={14}
                                  className="text-indigo-600"
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                                {item.product_name || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {item.sku || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {item.batch_code ? (
                              <span className="text-xs text-slate-500 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                                {item.batch_code}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-xs text-slate-500">
                              {item.variant_unit || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                              {item.quantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                        <td
                          colSpan="5"
                          className="py-3 px-3 text-sm font-bold text-slate-700 text-right"
                        >
                          Tổng số lượng:
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-base font-bold text-indigo-700">
                            {stockModalData.total_products || 0}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                    <Package size={40} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-lg">
                    Chưa có sản phẩm nào
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Tạo đơn nhập kho để thêm sản phẩm vào vị trí này
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="w-full px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-white transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <h2 className="text-lg font-bold text-slate-900">
                {editingLocation ? "Chỉnh sửa vị trí" : "Thêm vị trí mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Mã vị trí *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location_code: e.target.value,
                      })
                    }
                    placeholder="VD: KE-A01"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Loại hình
                  </label>
                  <select
                    value={formData.location_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {locationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tên vị trí *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location_name}
                  onChange={(e) =>
                    setFormData({ ...formData, location_name: e.target.value })
                  }
                  placeholder="VD: Kệ hàng gia vị A"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Địa chỉ / Mô tả vị trí
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="VD: Dãy A, Tầng 1"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Sức chứa (số lượng sku tối đa)
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {editingLocation ? "Cập nhật" : "Lưu vị trí"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {transferModal.isOpen && transferModal.location && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft size={20} className="text-violet-600" />
                  Chuyển hàng hóa
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Từ:{" "}
                  <span className="font-semibold text-violet-700">
                    {transferModal.location.location_name}
                  </span>
                </p>
              </div>
              <button
                onClick={() =>
                  setTransferModal({ isOpen: false, location: null })
                }
                className="p-2 hover:bg-white/70 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-5">
              {/* Step 1: Chọn sản phẩm */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  1. Chọn sản phẩm cần chuyển *
                </label>
                {(transferModal.location.stock_items || []).length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Package
                      size={28}
                      className="mx-auto text-slate-300 mb-1"
                    />
                    <p className="text-sm text-slate-400">
                      Vị trí này chưa có sản phẩm nào
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(transferModal.location.stock_items || []).map(
                      (item, idx) => {
                        const isSelected =
                          transferData.selectedItem?.variantId ===
                            item.variant_id &&
                          transferData.selectedItem?.batchId === item.batch_id;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setTransferData((prev) => ({
                                ...prev,
                                selectedItem: {
                                  variantId: item.variant_id,
                                  batchId: item.batch_id,
                                  productName: item.product_name,
                                  quantity: item.quantity,
                                  batchCode: item.batch_code,
                                  variantUnit: item.variant_unit,
                                },
                                quantity: 1,
                              }))
                            }
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? "border-violet-500 bg-violet-50 shadow-sm"
                                : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "bg-violet-100" : "bg-slate-100"
                                }`}
                              >
                                <Package
                                  size={15}
                                  className={
                                    isSelected
                                      ? "text-violet-600"
                                      : "text-slate-400"
                                  }
                                />
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    isSelected
                                      ? "text-violet-900"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {item.product_name}
                                </p>
                                <p className="text-xs text-slate-400 font-mono">
                                  {item.sku}{" "}
                                  {item.batch_code
                                    ? `• Lô: ${item.batch_code}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                                isSelected
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.quantity} {item.variant_unit || ""}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Số lượng */}
              {transferData.selectedItem && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    2. Số lượng cần chuyển *
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      (Tối đa: {transferData.selectedItem.quantity}{" "}
                      {transferData.selectedItem.variantUnit})
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={transferData.selectedItem.quantity}
                    required
                    value={transferData.quantity}
                    onChange={(e) =>
                      setTransferData((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none font-mono text-lg"
                  />
                </div>
              )}

              {/* Step 3: Chọn vị trí đích */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  3. Chuyển đến vị trí *
                </label>
                <select
                  required
                  value={transferData.toLocationId}
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      toLocationId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                >
                  <option value="">-- Chọn vị trí đích --</option>
                  {locations
                    .filter(
                      (l) =>
                        l.id !== transferModal.location.id &&
                        l.status === "ACTIVE",
                    )
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.location_name} ({l.location_code})
                      </option>
                    ))}
                </select>
              </div>

              {/* Summary preview */}
              {transferData.selectedItem && transferData.toLocationId && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-violet-800 mb-1">
                    Xác nhận chuyển hàng:
                  </p>
                  <p className="text-violet-700">
                    <span className="font-bold">{transferData.quantity}</span>{" "}
                    {transferData.selectedItem.variantUnit} "
                    <span className="font-bold">
                      {transferData.selectedItem.productName}
                    </span>
                    "
                  </p>
                  <p className="text-violet-600 text-xs mt-1">
                    {transferModal.location.location_name} →{" "}
                    {locations.find(
                      (l) => l.id === parseInt(transferData.toLocationId),
                    )?.location_name || ""}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setTransferModal({ isOpen: false, location: null })
                  }
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    transferring ||
                    !transferData.selectedItem ||
                    !transferData.toLocationId
                  }
                  className="flex-1 px-4 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {transferring ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Đang
                      chuyển...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft size={16} /> Xác nhận chuyển hàng
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Toggle Status Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmToggle}
        onCancel={() => setConfirmModal({ isOpen: false, location: null })}
        title={
          confirmModal.location?.status === "ACTIVE"
            ? "Ngừng hoạt động vị trí"
            : "Kích hoạt lại vị trí"
        }
        message={
          confirmModal.location?.status === "ACTIVE"
            ? `Bạn có chắc chắn muốn ngừng hoạt động vị trí "${confirmModal.location?.location_name}"? Vị trí sẽ bị ẩn khỏi các danh sách chọn.`
            : `Bạn có chắc chắn muốn kích hoạt lại vị trí "${confirmModal.location?.location_name}"?`
        }
        confirmText={
          confirmModal.location?.status === "ACTIVE"
            ? "Ngừng hoạt động"
            : "Kích hoạt lại"
        }
        variant={
          confirmModal.location?.status === "ACTIVE" ? "danger" : "success"
        }
        loading={toggling}
      />
    </div>
  );
}

export default LocationManagement;
