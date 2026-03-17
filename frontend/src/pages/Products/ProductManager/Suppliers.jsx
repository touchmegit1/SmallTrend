import { useMemo, useState } from "react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  X,
  Save,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { useFetchSuppliers } from "../../../hooks/useSuppliers";
import { useAuth } from "../../../context/AuthContext";
import { canManageProducts } from "../../../utils/roleUtils";

const initialFormData = {
  name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
  status: "active",
};

const mapSupplierToFormData = (supplier) => ({
  name: supplier?.name || "",
  contact_person: supplier?.contact_person || supplier?.contact || "",
  phone: supplier?.phone || "",
  email: supplier?.email || "",
  address: supplier?.address || "",
  status: supplier?.status || "active",
});

export function SuppliersScreen() {
  const { user } = useAuth();
  const canEditProducts = canManageProducts(user);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [toast, setToast] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useFetchSuppliers();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter((supplier) => {
      const matchesSearch =
        supplier.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        supplier.contact_person?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        supplier.phone?.includes(searchQuery) ||
        supplier.email?.toLowerCase()?.includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && supplier.status === "active") ||
        (filterStatus === "inactive" && supplier.status === "inactive");

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, filterStatus]);

  const handleAdd = () => {
    if (!canEditProducts) return;
    setEditingSupplier(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier) => {
    if (!canEditProducts) return;
    setEditingSupplier(supplier);
    setFormData(mapSupplierToFormData(supplier));
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (!canEditProducts) return;
    e.preventDefault();
    if (isReadOnlyRole) return;

    const payload = {
      ...formData,
      contact_person: formData.contact_person?.trim(),
    };

    const result = editingSupplier
      ? await updateSupplier(editingSupplier.id, payload)
      : await createSupplier(payload);

    if (result?.success) {
      showToast(editingSupplier ? "Cập nhật nhà cung cấp thành công!" : "Thêm nhà cung cấp thành công!");
      setIsModalOpen(false);
      setEditingSupplier(null);
      setFormData(initialFormData);
      return;
    }

    showToast(result?.error || "Không thể lưu nhà cung cấp");
  };

  const handleDelete = async () => {
    if (!canEditProducts) return;
    if (!deleteTarget?.id) return;

    const result = await deleteSupplier(deleteTarget.id);
    if (result?.success) {
      showToast("Xóa nhà cung cấp thành công!");
      setDeleteTarget(null);
      return;
    }

    showToast(result?.error || "Không thể xóa nhà cung cấp");
    setDeleteTarget(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefresh = async () => {
    await fetchSuppliers();
    showToast("Đã làm mới danh sách nhà cung cấp");
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="space-y-5">
        {toast && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
            <div
              className={`flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl border-l-4 bg-white ${
                toast.startsWith("Không thể") || toast.startsWith("Lỗi")
                  ? "border-red-500"
                  : "border-green-500"
              }`}
            >
              {toast.startsWith("Không thể") || toast.startsWith("Lỗi") ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <span className="text-sm font-medium text-gray-800">{toast}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý nhà cung cấp</h1>
            <p className="text-gray-600 mt-2">
              Tổng số: <span className="font-semibold text-blue-600">{filteredSuppliers.length}</span> nhà cung cấp
              {searchQuery || filterStatus !== "all" ? <span className="text-gray-400"> (đang lọc)</span> : null}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            {canEditProducts && (
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm nhà cung cấp
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Lỗi tải nhà cung cấp: {error}</span>
            </div>
            <button onClick={fetchSuppliers} className="underline hover:text-red-900">
              Thử lại
            </button>
          </div>
        )}

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3">
            <h3 className="text-white font-bold text-sm">Tìm kiếm & bộ lọc</h3>
            <p className="text-blue-100 text-xs">Lọc danh sách nhà cung cấp theo từ khóa và trạng thái</p>
          </div>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên, người liên hệ, SĐT hoặc email..."
                  className="pl-12 h-11 text-base bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="w-full h-11 px-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hợp tác</option>
                <option value="inactive">Ngưng hợp tác</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-100 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800">Danh sách nhà cung cấp</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-gray-500">Đang tải danh sách nhà cung cấp...</div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium text-gray-600">Không tìm thấy nhà cung cấp</p>
                <p className="text-sm">Thử điều chỉnh bộ lọc hoặc thêm nhà cung cấp mới</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                    <TableHead className="font-bold text-gray-700">Nhà cung cấp</TableHead>
                    <TableHead className="font-bold text-gray-700">Liên hệ</TableHead>
                    <TableHead className="font-bold text-gray-700">Địa chỉ</TableHead>
                    <TableHead className="font-bold text-gray-700">Trạng thái</TableHead>
                    <TableHead className="text-center font-bold text-gray-700">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow className="hover:bg-blue-50 transition-colors border-b border-gray-100" key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{supplier.name}</p>
                            <p className="text-xs text-gray-500">{supplier.contact_person || "Chưa có người liên hệ"}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{supplier.phone || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-600">{supplier.email || "—"}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-start gap-2 text-sm text-gray-600 max-w-[320px]">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                          <span>{supplier.address || "—"}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {supplier.status === "active" ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200">Đang hợp tác</Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border border-red-200">Ngưng hợp tác</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {canEditProducts && (
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(supplier)}
                              title="Chỉnh sửa"
                              className="hover:bg-blue-100 text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Xóa"
                              onClick={() => setDeleteTarget(supplier)}
                              className="hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {canEditProducts && deleteTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
              <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Xác nhận xóa nhà cung cấp</h3>
                <p className="text-center text-gray-600">
                  Bạn có chắc muốn xóa <span className="font-bold text-gray-900">{deleteTarget?.name}</span>?
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl font-semibold"
                  onClick={() => setDeleteTarget(null)}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 h-11 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md"
                  onClick={handleDelete}
                >
                  Xóa ngay
                </Button>
              </div>
            </div>
          </div>
        )}

        {canEditProducts && isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingSupplier ? "Chỉnh sửa" : "Thêm"} nhà cung cấp
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Cập nhật thông tin nhà cung cấp</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6">
                <Card className="border border-gray-200 rounded-xl bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-800">Thông tin nhà cung cấp</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>
                          Tên nhà cung cấp <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          className="mt-2 h-11 text-base bg-gray-50 border border-gray-200 rounded-xl"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="VD: Vinamilk"
                          required
                        />
                      </div>
                      <div>
                        <Label>
                          Người liên hệ <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          className="mt-2 h-11 text-base bg-gray-50 border border-gray-200 rounded-xl"
                          name="contact_person"
                          value={formData.contact_person}
                          onChange={handleChange}
                          placeholder="VD: Nguyễn Văn A"
                          required
                        />
                      </div>
                      <div>
                        <Label>
                          Số điện thoại <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          className="mt-2 h-11 text-base bg-gray-50 border border-gray-200 rounded-xl"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="VD: 0912345678"
                          required
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          className="mt-2 h-11 text-base bg-gray-50 border border-gray-200 rounded-xl"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="VD: contact@example.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>
                          Địa chỉ <span className="text-red-600">*</span>
                        </Label>
                        <Textarea
                          className="mt-2 text-base bg-gray-50 border border-gray-200 rounded-xl"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="VD: 123 Đường ABC, Q.1, TP.HCM"
                          rows={3}
                          required
                        />
                      </div>
                      <div>
                        <Label>
                          Trạng thái <span className="text-red-600">*</span>
                        </Label>
                        <select
                          name="status"
                          className="w-full mt-2 h-11 px-4 border border-gray-200 rounded-xl bg-gray-50"
                          value={formData.status}
                          onChange={handleChange}
                          required
                        >
                          <option value="active">Đang hợp tác</option>
                          <option value="inactive">Ngưng hợp tác</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </Button>
                  <Button type="button" variant="danger" className="flex-1 h-11" onClick={() => setIsModalOpen(false)}>
                    Hủy
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuppliersScreen;
