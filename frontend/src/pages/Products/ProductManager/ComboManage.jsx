import { useEffect, useState } from "react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import { Plus, Search, Edit, Package2, Eye, CheckCircle, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import EditComboModal from "./EditComboModal";

import { useProductCombos } from "../../../hooks/product_combos";

// Component quản lý danh sách các Combo Sản phẩm
// Nơi hiển thị, lọc, tìm kiếm và thao tác các combo như xoá, sửa
const ComboManage = () => {
  const { combos, loading, error, deleteCombo, updateCombo } = useProductCombos();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);

  // Hàm xử lý việc sắp xếp các cột trong bảng (Tên, Giá, etc.)
  // Đảo chiều sắp xếp (asc/desc) khi bấm vào tiêu đề cột
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredCombos = combos
    .filter((combo) => {
      const matchesSearch =
        combo.comboName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        combo.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const isActiveStr = combo.isActive ? "active" : "inactive";
      const matchesStatus =
        filterStatus === "all" || isActiveStr === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === "originalPrice" || sortField === "comboPrice") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Hàm xử lý xoá một Combo Sản phẩm từ danh sách
  // Cập nhật lại UI thông qua mutate để đồng bộ dữ liệu sau khi API gọi thành công
  const handleDeleteCombo = async (comboId) => {
    if (confirm("Bạn có chắc muốn xóa combo này?")) {
      try {
        await deleteCombo(comboId);
        setToastMessage("Xóa combo thành công!");
        setTimeout(() => setToastMessage(""), 3000);
      } catch (err) {
        setToastMessage("Lỗi khi xóa: " + err.message);
        setTimeout(() => setToastMessage(""), 3000);
      }
    }
  };

  // Bật Modal sửa thông tin khi người dùng nhấn Sửa trên một dòng
  const handleEditCombo = (combo) => {
    setSelectedCombo(combo);
    setIsEditModalOpen(true);
  };

  // Hàm xử lý sau khi lưu thay đổi Combo qua Edit Modal thành công
  // Gọi API cập nhật và fetch lại danh sách Combo để hiển thị bản ghi mới
  const handleSaveCombo = async (updatedCombo) => {
    try {
      await updateCombo(updatedCombo.id, updatedCombo);
      setToastMessage("Cập nhật combo thành công!");
      setIsEditModalOpen(false);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setToastMessage("Lỗi khi cập nhật: " + err.message);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 bg-white border-l-4 border-green-500 rounded-xl px-6 py-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-600 w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-800">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý Combo
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Package2 className="w-4 h-4" />
              Tổng số: <span className="font-semibold text-blue-600">{filteredCombos.length}</span> combo
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white shadow-lg shadow-green-500/30">
              Xuất dữ liệu
            </Button>
            <Button
              onClick={() => navigate("/products/create_combo")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo combo mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm combo..."
                  className="pl-12 h-12 text-sm border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="h-12 px-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang bán</option>
                <option value="inactive">Ngưng bán</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800">Danh sách Combo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                    <TableHead
                      className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                      onClick={() => handleSort("comboName")}
                    >
                      Tên Combo {sortField === "comboName" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="font-semibold">Sản phẩm trong combo</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                      onClick={() => handleSort("originalPrice")}
                    >
                      Giá gốc {sortField === "originalPrice" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                      onClick={() => handleSort("comboPrice")}
                    >
                      Giá combo {sortField === "comboPrice" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-blue-50 select-none transition-colors font-semibold"
                      onClick={() => handleSort("createdAt")}
                    >
                      Thời gian tạo {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-center font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && <TableRow><TableCell colSpan={6} className="text-center py-4">Đang tải...</TableCell></TableRow>}
                  {error && <TableRow><TableCell colSpan={6} className="text-center py-4 text-red-500">{error}</TableCell></TableRow>}
                  {!loading && !error && filteredCombos.map((combo) => (
                    <TableRow className="hover:bg-blue-50/50 transition-colors border-b border-gray-100" key={combo.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                            <Package2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{combo.comboName}</p>
                            <p className="text-xs text-gray-500">
                              {combo.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {combo.items?.slice(0, 2).map((item) => (
                            <p key={item.id} className="text-xs text-gray-600">
                              • {item.productVariantName} <span className="font-semibold text-blue-600">x{item.quantity}</span>
                            </p>
                          ))}
                          {combo.items?.length > 2 && (
                            <p className="text-xs text-blue-600 font-semibold">
                              +{combo.items.length - 2} sản phẩm khác
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-400 line-through text-sm">
                          {combo.originalPrice?.toLocaleString()}đ
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold text-sm">
                            {combo.comboPrice?.toLocaleString()}đ
                          </span>
                          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-0 font-semibold text-xs">
                            -{Math.round((1 - (combo.comboPrice / combo.originalPrice)) * 100)}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {combo.isActive ? (
                          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-0 font-medium">Đang bán</Badge>
                        ) : (
                          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-0 font-medium">Ngừng bán</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {combo.createdAt ? new Date(combo.createdAt).toLocaleString('vi-VN', {
                          year: 'numeric', month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        }) : '-'}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate("/products/combo_detail", { state: { combo } })}
                            className="hover:bg-blue-100 hover:text-blue-600 rounded-lg"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCombo(combo)}
                            className="hover:bg-indigo-100 hover:text-indigo-600 rounded-lg"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCombo(combo.id)}
                            className="hover:bg-red-100 hover:text-red-600 rounded-lg"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditComboModal
        combo={selectedCombo}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCombo}
      />
    </div>
  );
}

export default ComboManage;
