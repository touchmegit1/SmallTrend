import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Edit2,
  Warehouse,
  Package,
  Loader2,
  X,
  Box,
  Eye,
  ArrowRightLeft,
  ArrowLeft,
  Snowflake,
  DoorOpen,
} from "lucide-react";
import {
  getLocations,
  updateLocation,
  transferStock,
} from "../../services/inventoryService";
import { useToast } from "../../components/ui/Toast";
import CustomSelect from "../../components/common/CustomSelect";
import { useAuth } from "../../context/AuthContext";
import { canPerform } from "../../utils/rolePermissions";

function LocationManagement() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewLocationProducts = canPerform(user, "inventory.location.viewStock");
  const canTransferLocationStock = canPerform(user, "inventory.location.transfer");
  const canEditLocation = canPerform(user, "inventory.location.edit");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalData, setStockModalData] = useState(null);

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
    location_type: "DISPLAY",
    address: "",
    capacity: 0,
    description: "",
  });

  const normalizeLocationType = (type) =>
    (type || "").toUpperCase() === "SHELF" ? "DISPLAY" : type;

  const locationTypes = [
    { value: "STORAGE", label: "Kho lưu trữ", icon: Warehouse },
    { value: "DISPLAY", label: "Kệ hàng", icon: Package },
    { value: "COLD_STORAGE", label: "Kho lạnh", icon: MapPin },
    { value: "CASHIER", label: "Quầy thu ngân", icon: MapPin },
  ];

  const transferDestinationOptions = (sourceLocationId) => [
    { value: "", label: "-- Chọn vị trí đích --" },
    ...locations
      .filter((l) => l.id !== sourceLocationId)
      .map((l) => ({
        value: String(l.id),
        label: `${l.location_name} (${l.location_code})`,
      })),
  ];

  const formatTransferLocationLabel = (locationId) =>
    locations.find((l) => l.id === parseInt(locationId))?.location_name || "";

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length === 0) {
      setSelectedLocationId(null);
      return;
    }

    if (!locations.some((loc) => loc.id === selectedLocationId)) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

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
    if (!destination) {
      toast.error("Vị trí đích không hợp lệ", {
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
    location_type: normalizeLocationType(location.location_type),
    address: location.address,
    capacity: location.capacity,
    description: location.description,
  });

  const createInitialTransferData = () => ({
    toLocationId: "",
    selectedItem: null,
    quantity: 1,
  });

  const handleOpenModal = (location) => {
    if (!canEditLocation) return;
    setEditingLocation(location);
    setFormData(normalizeFormData(location));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEditLocation) return;
    if (!validateLocationForm() || !editingLocation) return;

    const payload = buildLocationPayload();
    try {
      await updateLocation(editingLocation.id, payload);
      handleLocationSaved("Đã cập nhật vị trí thành công!");
    } catch (error) {
      console.error("Error saving location:", error);
      showApiErrorToast(error, "Có lỗi xảy ra khi lưu vị trí");
    }
  };


  const handleSelectLocation = (locId) => {
    setSelectedLocationId(locId);
  };

  const openStockModal = (loc) => {
    if (!canViewLocationProducts) return;
    setStockModalData(loc);
    setIsStockModalOpen(true);
  };

  const openTransferModal = (loc) => {
    if (!canTransferLocationStock) return;
    setTransferModal({ isOpen: true, location: loc });
    setTransferData(createInitialTransferData());
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!canTransferLocationStock) return;
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

  const filteredLocations = locations;

  const groupedLocations = locationTypes
    .map((type) => ({
      ...type,
      locations: filteredLocations.filter(
        (loc) => normalizeLocationType(loc.location_type) === type.value,
      ),
    }))
    .filter((group) => group.locations.length > 0);

  const ungroupedLocations = filteredLocations.filter(
    (loc) =>
      !locationTypes.some(
        (type) => type.value === normalizeLocationType(loc.location_type),
      ),
  );

  if (ungroupedLocations.length > 0) {
    groupedLocations.push({
      value: "OTHER",
      label: "Khu vực khác",
      icon: MapPin,
      locations: ungroupedLocations,
    });
  }

  const groupedLocationMap = groupedLocations.reduce((acc, group) => {
    acc[group.value] = group;
    return acc;
  }, {});

  const hasAnyZone = filteredLocations.length > 0;

  const coldStorageLocations = groupedLocationMap.COLD_STORAGE?.locations || [];
  const storageLocations = groupedLocationMap.STORAGE?.locations || [];
  const displayLocations = groupedLocationMap.DISPLAY?.locations || [];

  const featuredColdStorage = coldStorageLocations[0] || null;
  const featuredStorage = storageLocations[0] || null;
  const featuredDisplayLocations = Array.from(
    { length: 3 },
    (_, index) => displayLocations[index] || null,
  );

  const featuredLocationIds = new Set(
    [featuredColdStorage, featuredStorage, ...featuredDisplayLocations]
      .filter(Boolean)
      .map((loc) => loc.id),
  );

  const remainingMapLocations = filteredLocations.filter(
    (loc) => !featuredLocationIds.has(loc.id),
  );

  const selectedLocation =
    filteredLocations.find((loc) => loc.id === selectedLocationId) || null;

  const calcFillPercent = (loc) => {
    const capacity = Number(loc?.capacity || 0);
    const qty = Number(loc?.total_products || 0);
    if (capacity <= 0) return qty > 0 ? 100 : 0;
    return Math.min(100, Math.round((qty / capacity) * 100));
  };

  const resolveWarningMeta = (item) => {
    const rawStatus = item.warning_status;
    const rawDays = item.days_until_expiry;

    if (rawStatus) {
      return {
        status: rawStatus,
        days: Number(rawDays ?? 99999),
      };
    }

    if (!item.expiry_date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(item.expiry_date);
    if (Number.isNaN(expiry.getTime())) return null;
    expiry.setHours(0, 0, 0, 0);

    const days = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { status: "EXPIRED", days };
    if (days <= 7) return { status: "EXPIRING_CRITICAL", days };
    if (days <= 30) return { status: "EXPIRING_WARNING", days };
    return null;
  };

  const getUrgentStockItems = (loc) => {
    const items = loc?.stock_items || [];

    const priorityRank = {
      EXPIRED: 0,
      EXPIRING_CRITICAL: 1,
      EXPIRING_WARNING: 2,
    };

    return items
      .map((item) => {
        const warningMeta = resolveWarningMeta(item);
        return warningMeta ? { ...item, __warningMeta: warningMeta } : null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        const rankA = priorityRank[a.__warningMeta.status] ?? 99;
        const rankB = priorityRank[b.__warningMeta.status] ?? 99;
        if (rankA !== rankB) return rankA - rankB;
        return a.__warningMeta.days - b.__warningMeta.days;
      })
      .slice(0, 6);
  };

  const formatWarningLabel = (item) => {
    const warningMeta = item.__warningMeta || resolveWarningMeta(item);
    if (!warningMeta) return "Cần xử lý";

    if (warningMeta.status === "EXPIRED") return "Đã hết hạn";
    return `${warningMeta.days} ngày nữa hết hạn`;
  };

  const getWarningBadgeClass = (status) => {
    if (status === "EXPIRED") return "bg-red-100 text-red-700";
    if (status === "EXPIRING_CRITICAL") return "bg-orange-100 text-orange-700";
    return "bg-amber-100 text-amber-700";
  };

  const getWarningBadgeText = (status) => {
    if (status === "EXPIRED") return "Hết hạn";
    if (status === "EXPIRING_CRITICAL") return "Nguy cơ cao";
    return "Cảnh báo";
  };

  const getItemWarningStatus = (item) => item.__warningMeta?.status || item.warning_status;

  const urgentItemsForSelected = selectedLocation ? getUrgentStockItems(selectedLocation) : [];

  const hasAnyStockItems = (selectedLocation?.stock_items || []).length > 0;

  const getFillColor = (percent) => {
    if (percent >= 80) return "bg-red-400";
    if (percent >= 50) return "bg-amber-400";
    return "bg-emerald-400";
  };

  const renderMapLocationCard = (loc, options = {}) => {
    if (!loc) return null;

    const {
      icon: IconOverride,
      title,
      className = "",
      tone = "amber",
      compact = false,
    } = options;

    const Icon = IconOverride || getIcon(loc.location_type);
    const isSelected = selectedLocationId === loc.id;
    const totalProducts = loc.total_products || 0;
    const fill = calcFillPercent(loc);

    const tones = {
      blue: "bg-blue-100 border-blue-400 text-blue-800",
      green: "bg-emerald-100 border-emerald-400 text-emerald-800",
      amber: "bg-amber-100 border-amber-400 text-amber-800",
      rose: "bg-rose-100 border-rose-400 text-rose-800",
      indigo: "bg-indigo-100 border-indigo-400 text-indigo-800",
    };

    return (
      <div
        key={loc.id}
        className={`rounded-[22px] border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${tones[tone] || tones.amber} ${isSelected ? "ring-2 ring-indigo-500 ring-offset-1" : ""} ${className}`}
        onClick={() => handleSelectLocation(loc.id)}
      >
        <div className={`p-3.5 ${compact ? "min-h-[118px]" : "min-h-[138px]"}`}>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-center mb-2">
              <Icon size={compact ? 17 : 21} />
            </div>
            <p className={`${compact ? "text-sm" : "text-lg"} font-bold text-center truncate leading-tight`}>
              {title || loc.location_name}
            </p>
          </div>

          <p className="w-full mt-2 text-center text-[10.5px] font-medium opacity-75">
            {loc.location_code} • {totalProducts} SKU
          </p>
        </div>

        <div className="px-3 pb-3">
          <div className="h-2.5 bg-white/75 rounded-full overflow-hidden">
            <div className={`h-full ${getFillColor(fill)}`} style={{ width: `${fill}%` }} />
          </div>
        </div>
      </div>
    );
  };

  const getIcon = (type) => {
    const normalizedType = normalizeLocationType(type);
    const found = locationTypes.find((t) => t.value === normalizedType);
    return found ? found.icon : MapPin;
  };

  const getLabel = (type) => {
    const normalizedType = normalizeLocationType(type);
    const found = locationTypes.find((t) => t.value === normalizedType);
    return found ? found.label : normalizedType;
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
              Sắp xếp không gian kho và khu khách hàng có thể mua hàng
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-5">
          {hasAnyZone ? (
            <>
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">Sơ đồ kho 2D</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bố cục trực quan gồm kho chính, kệ trưng bày, quầy thu ngân và cửa ra vào.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] gap-4 md:gap-5 items-start">
                <div>
                  <div className="rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-4 md:p-6 shadow-inner">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                        {featuredColdStorage ? (
                          renderMapLocationCard(featuredColdStorage, {
                            icon: Snowflake,
                            title: featuredColdStorage.location_name,
                            tone: "blue",
                            className: "min-h-[210px]",
                          })
                        ) : (
                          <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 min-h-[210px] flex items-center justify-center text-sm text-blue-500">
                            Chưa có kho lạnh
                          </div>
                        )}

                        {featuredStorage ? (
                          renderMapLocationCard(featuredStorage, {
                            icon: Package,
                            title: featuredStorage.location_name,
                            tone: "amber",
                            className: "min-h-[210px]",
                          })
                        ) : (
                          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 min-h-[210px] flex items-center justify-center text-sm text-amber-600">
                            Chưa có kho để đồ
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 justify-items-center pt-1">
                        {featuredDisplayLocations.map((loc, index) =>
                          loc ? (
                            <div key={loc.id} className="w-full max-w-[260px]">
                              {renderMapLocationCard(loc, {
                                tone: "indigo",
                                className: "min-h-[220px]",
                              })}
                            </div>
                          ) : (
                            <div
                              key={`display-placeholder-${index}`}
                              className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 min-h-[220px] w-full max-w-[260px] flex items-center justify-center text-sm text-indigo-600"
                            >
                              Chưa có khu vực kệ hàng
                            </div>
                          ),
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end pt-1.5">
                        <div className="md:col-span-2 w-full flex justify-center md:justify-start md:pl-1">
                          <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/70 h-[112px] w-full max-w-[390px] flex items-center justify-center text-rose-700 shadow-sm">
                            <div className="text-center px-4">
                              <p className="text-xl leading-none mb-1.5">▭</p>
                              <p className="text-sm font-semibold tracking-wide">Quầy thu ngân</p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full flex justify-center md:justify-end">
                          <div className="rounded-2xl border-2 border-dashed border-slate-400 bg-slate-100/80 h-[112px] w-full max-w-[210px] flex items-center justify-center text-slate-600 shadow-sm">
                            <div className="flex flex-col items-center gap-1.5 text-center px-3">
                              <DoorOpen size={17} />
                              <span className="text-sm font-semibold tracking-wide">Cửa chính ra vào</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {remainingMapLocations.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Vị trí khác</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {remainingMapLocations.map((loc) =>
                          renderMapLocationCard(loc, { tone: "amber", compact: true }),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="xl:sticky xl:top-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 md:p-5">
                  {selectedLocation ? (
                    <>
                      <div className="flex flex-col gap-4">
                        <div>
                          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                            Chi tiết khu vực đã chọn
                          </p>
                          <h3 className="text-xl font-bold text-slate-900">{selectedLocation.location_name}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {selectedLocation.location_code} • {getLabel(selectedLocation.location_type)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {canViewLocationProducts && (
                            <button
                              onClick={() => openStockModal(selectedLocation)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                            >
                              <Eye size={15} /> Xem sản phẩm
                            </button>
                          )}
                          {canTransferLocationStock && (
                            <button
                              onClick={() => openTransferModal(selectedLocation)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                            >
                              <ArrowRightLeft size={15} /> Chuyển hàng
                            </button>
                          )}
                          {canEditLocation && (
                            <button
                              onClick={() => handleOpenModal(selectedLocation)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                            >
                              <Edit2 size={15} /> Chỉnh sửa
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2.5">
                          <p className="text-xs text-slate-500">Tổng số lượng</p>
                          <p className="text-lg font-bold text-indigo-700">{selectedLocation.total_products || 0}</p>
                        </div>
                        <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2.5">
                          <p className="text-xs text-slate-500">Sức chứa</p>
                          <p className="text-lg font-bold text-slate-800">{selectedLocation.capacity || 0}</p>
                        </div>
                        <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2.5">
                          <p className="text-xs text-slate-500">Mức đầy</p>
                          <p className="text-lg font-bold text-slate-800">{calcFillPercent(selectedLocation)}%</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-sm font-semibold text-slate-800 mb-2">Sản phẩm cảnh báo cần xử lý ngay</p>
                        {urgentItemsForSelected.length > 0 ? (
                          <div className="space-y-1.5 text-sm text-slate-600">
                            {urgentItemsForSelected.map((item, idx) => (
                              <div key={`${item.variant_id || idx}-${item.batch_id || idx}`} className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate">
                                    {item.product_name || "N/A"}
                                    {item.batch_code ? ` • Lô ${item.batch_code}` : ""}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatWarningLabel(item)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getWarningBadgeClass(getItemWarningStatus(item))}`}>
                                    {getWarningBadgeText(getItemWarningStatus(item))}
                                  </span>
                                  <span className="font-semibold text-indigo-700 whitespace-nowrap">
                                    {item.quantity} {item.variant_unit || "đv"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : hasAnyStockItems ? (
                          <p className="text-sm text-slate-500">Khu vực này hiện chưa có sản phẩm cần cảnh báo.</p>
                        ) : (
                          <p className="text-sm text-slate-500">Khu vực này chưa có sản phẩm.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-indigo-300 bg-white/80 p-4 text-sm text-slate-500">
                      Chọn một khu vực ở bên trái để xem chi tiết.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                <MapPin className="text-slate-300" size={40} />
              </div>
              <p className="text-slate-500 font-medium">Chưa có dữ liệu vị trí</p>
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
                Chỉnh sửa vị trí
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

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
                  Cập nhật
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
                <CustomSelect
                  value={transferData.toLocationId}
                  onChange={(value) =>
                    setTransferData((prev) => ({
                      ...prev,
                      toLocationId: value,
                    }))
                  }
                  options={transferDestinationOptions(transferModal.location.id)}
                  dropdownPosition="inline"
                  className="w-full"
                />
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
                    {formatTransferLocationLabel(transferData.toLocationId)}
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

    </div>
  );
}

export default LocationManagement;
