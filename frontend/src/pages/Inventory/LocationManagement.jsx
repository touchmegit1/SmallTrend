import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MapPin,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronRight,
  Store,
  Warehouse,
  Package,
  Loader2,
  X,
} from "lucide-react";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../services/inventoryService";

function LocationManagement() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    location_name: "",
    location_code: "",
    location_type: "SHELF",
    address: "",
    capacity: 0,
    description: "",
  });

  const locationTypes = [
    { value: "DISPLAY_AREA", label: "Khu vực trưng bày", icon: Store },
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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        location_name: location.location_name,
        location_code: location.location_code,
        location_type: location.location_type,
        address: location.address,
        capacity: location.capacity,
        description: location.description,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        location_name: "",
        location_code: "",
        location_type: "SHELF",
        address: "",
        capacity: 0,
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
      } else {
        await createLocation(formData);
      }
      fetchLocations();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Có lỗi xảy ra khi lưu vị trí!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vị trí này?")) {
      try {
        await deleteLocation(id);
        fetchLocations();
      } catch (error) {
        console.error("Error deleting location:", error);
        alert("Không thể xóa vị trí này!");
      }
    }
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.location_code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý khu vực & vị trí
          </h1>
          <p className="text-slate-500 mt-1">
            Sắp xếp không gian cửa hàng và vị trí trưng bày sản phẩm
          </p>
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
            <select className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Tất cả loại hình</option>
              {locationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Tên & Mã vị trí</th>
                <th className="px-6 py-4">Loại hình</th>
                <th className="px-6 py-4">Địa chỉ / Vị trí</th>
                <th className="px-6 py-4 text-center">Sức chứa</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLocations.map((loc) => {
                const Icon = getIcon(loc.location_type);
                return (
                  <tr
                    key={loc.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {getLabel(loc.location_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {loc.address}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm font-medium text-slate-700">
                        {loc.capacity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          loc.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {loc.status === "ACTIVE"
                          ? "Đang hoạt động"
                          : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(loc)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(loc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
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

      {/* Modal Tool */}
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
    </div>
  );
}

export default LocationManagement;
