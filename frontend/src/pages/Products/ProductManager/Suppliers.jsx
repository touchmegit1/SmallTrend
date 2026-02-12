import { useState, useEffect } from "react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Label } from "../ProductComponents/label";
import { Textarea } from "../ProductComponents/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Building2, X, Save } from "lucide-react";
import { useFetchSuppliers } from "../../../hooks/suppliers";

export function SuppliersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const { suppliers, loading, error } = useFetchSuppliers();
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
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery);

    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && supplier.is_active) ||
      (filterStatus === "inactive" && !supplier.is_active);

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

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saving:", formData);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p>Đang tải nhà cung cấp...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quản lý nhà cung cấp</h1>
          <p className="text-gray-500 mt-1">Tổng số: {filteredSuppliers.length} nhà cung cấp</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhà cung cấp
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm nhà cung cấp..."
                className="pl-9 h-10 text-md bg-gray-200 border border-gray-200 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
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

      {/* Table */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Danh sách nhà cung cấp</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow className="hover:bg-gray-200" key={supplier.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                        <p className="text-xs text-gray-500">{supplier.contact}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs">{supplier.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 text-gray-400 mt-1" />
                      <span className="text-sm text-gray-600">{supplier.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700">
                      {supplier.products_count} sản phẩm
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {supplier.status === "active" ? (
                      <Badge className="bg-green-100 text-green-700">Đang hợp tác</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">Ngưng hợp tác</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(supplier)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" title="Xóa">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{editingSupplier ? "Chỉnh sửa" : "Thêm"} nhà cung cấp</h2>
                <p className="text-gray-500 text-sm mt-1">Cập nhật thông tin nhà cung cấp</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <Card className="border border-gray-300 rounded-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Thông tin nhà cung cấp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tên nhà cung cấp <span className="text-red-600">*</span></Label>
                      <Input
                        className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="VD: Vinamilk"
                        required
                      />
                    </div>
                    <div>
                      <Label>Người liên hệ <span className="text-red-600">*</span></Label>
                      <Input
                        className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        placeholder="VD: Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div>
                      <Label>Số điện thoại <span className="text-red-600">*</span></Label>
                      <Input
                        className="text-md bg-gray-200 border border-gray-200 rounded-lg"
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
                        className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="VD: contact@example.com"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Địa chỉ <span className="text-red-600">*</span></Label>
                      <Textarea
                        className="text-md bg-gray-200 border border-gray-200 rounded-lg"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="VD: 123 Đường ABC, Q.1, TP.HCM"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <Label>Trạng thái <span className="text-red-600">*</span></Label>
                      <select
                        name="status"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
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

              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </Button>
                <Button type="button" variant="danger" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Hủy
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
