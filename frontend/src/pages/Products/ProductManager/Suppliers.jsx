import { useState, useEffect } from "react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Building2, X, Save } from "lucide-react";
import { useFetchSuppliers } from "../../../hooks/useSuppliers";

export function SuppliersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const { suppliers, loading, error, createSupplier, updateSupplier, deleteSupplier } = useFetchSuppliers();
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    status: "active",
  });

  useEffect(() => {
    if (editingSupplier && isModalOpen) {
      setFormData(editingSupplier);
    }
  }, [editingSupplier, isModalOpen]);

  const filteredSuppliers = (suppliers || []).filter((supplier) => {
    const matchesSearch =
      supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone?.includes(searchQuery) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && supplier.status === "active") ||
      (filterStatus === "inactive" && supplier.status === "inactive");

    return matchesSearch && matchesStatus;
  });


  const handleAdd = () => {
    setEditingSupplier(null);
    setFormData({ name: "", contact: "", phone: "", email: "", address: "", status: "active" });
    setIsModalOpen(true);
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, formData);
    } else {
      await createSupplier(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      await deleteSupplier(id);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p>Đang tải nhà cung cấp...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Nhà cung cấp</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Tổng số: {filteredSuppliers.length} nhà cung cấp đang hiển thị</p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all rounded-lg h-10 px-5">
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhà cung cấp
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 rounded-2xl bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo Tên, Email, SĐT..."
                className="pl-10 h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="w-full md:w-56">
              <select
                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium text-gray-700 appearance-none cursor-pointer outline-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hợp tác</option>
                <option value="inactive">Ngưng hợp tác</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-bold text-gray-900">Danh sách hiển thị</CardTitle>
        </CardHeader>
        <div className="p-0 overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-200 hover:bg-gray-50 cursor-default">
                <TableHead className="font-semibold text-gray-600 pl-6 h-12">Nhà cung cấp</TableHead>
                <TableHead className="font-semibold text-gray-600 h-12">Thông tin liên hệ</TableHead>
                <TableHead className="font-semibold text-gray-600 h-12">Địa chỉ</TableHead>
                <TableHead className="font-semibold text-gray-600 h-12">Trạng thái</TableHead>
                <TableHead className="font-semibold text-gray-600 text-center pr-6 h-12 w-36">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSuppliers.length > 0 ? filteredSuppliers.map((supplier, index) => {
                const isLast = index === filteredSuppliers.length - 1;
                return (
                  <TableRow key={supplier.id} className={`hover:bg-blue-50/30 transition-colors ${!isLast ? 'border-b border-gray-100' : 'border-none'}`}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-base">{supplier.name}</p>
                          <p className="text-sm font-medium text-gray-500 mt-0.5">{supplier.contact_person}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 flex justify-center"><Phone className="w-3.5 h-3.5 text-gray-400" /></div>
                          <span className="text-sm font-medium text-gray-700">{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 flex justify-center"><Mail className="w-3.5 h-3.5 text-gray-400" /></div>
                          <span className="text-sm text-gray-600">{supplier.email || <span className="text-gray-400 italic">Chưa cập nhật</span>}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 max-w-xs">
                      <div className="flex items-start gap-2">
                        <div className="w-5 mt-0.5 flex justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-gray-400" /></div>
                        <span className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{supplier.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {supplier.status === 'active' ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 font-medium shadow-sm">Đang hợp tác</Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 font-medium shadow-sm">Ngưng hợp tác</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center pr-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(supplier)}
                          className="h-10 w-10 p-0 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(supplier.id)}
                          className="h-10 w-10 p-0 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500 font-medium">
                    Không tìm thấy dữ liệu nhà cung cấp nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal Cập nhật nhà cung cấp */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-gray-50 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingSupplier ? "Cập nhật thông tin" : "Thêm mới nhà cung cấp"}</h2>
                <p className="text-gray-500 text-sm mt-1 font-medium">Vui lòng điền đầy đủ các thông tin bắt buộc</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <Card className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-5">
                  <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Thông tin chung</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Tên nhà cung cấp <span className="text-rose-500 ml-0.5">*</span></Label>
                      <Input
                        className="h-11 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 text-sm"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="VD: Công ty phân phối Vinamilk"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Tra trạng thái hợp tác <span className="text-rose-500 ml-0.5">*</span></Label>
                      <select
                        name="status"
                        className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium text-gray-700 outline-none"
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

              <Card className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4 px-5">
                  <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">Thông tin liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Người đại diện <span className="text-rose-500 ml-0.5">*</span></Label>
                      <Input
                        className="h-11 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 text-sm"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        placeholder="VD: Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Số điện thoại <span className="text-rose-500 ml-0.5">*</span></Label>
                      <Input
                        className="h-11 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 text-sm"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="VD: 0912345678"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Email</Label>
                      <Input
                        className="h-11 bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 text-sm"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="VD: contact@vinamilk.com.vn"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Địa chỉ <span className="text-rose-500 ml-0.5">*</span></Label>
                      <Textarea
                        className="bg-white border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 text-sm p-3 min-h-[4rem]"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="VD: 10 Tân Trào, Phường Tân Phú, Quận 7, TP.HCM"
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end border-t border-gray-200 pt-5 mt-2">
                <Button
                  type="button"
                  variant="danger"
                  className="min-w-[120px] bg-red text-gray-700 border border-red-300 hover:bg-red-50 h-11 font-semibold rounded-lg shadow-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold rounded-lg shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingSupplier ? "Lưu thay đổi" : "Lưu dữ liệu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuppliersScreen;
