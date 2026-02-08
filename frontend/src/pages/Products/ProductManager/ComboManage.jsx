import { useEffect, useState } from "react";
import Button from "../ProductComponents/button";
import { Input } from "../ProductComponents/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Badge } from "../ProductComponents/badge";
import { Plus, Search, Edit, Package2, Eye, CheckCircle, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import EditComboModal from "./EditComboModal";

const mockCombos = [
  {
    id: 1,
    name: "Combo Sáng Năng Động",
    description: "Sữa chua + Bánh mì + Nước cam",
    variants: [
      { id: 1, name: "Yaourt Vinamilk 100ml", quantity: 2 },
      { id: 2, name: "Bánh mì que 50g", quantity: 1 },
      { id: 3, name: "Nước cam ép 200ml", quantity: 1 }
    ],
    price: 45000,
    discount_price: 39000,
    status: "active",
    created_at: "15/01/2025 08:30"
  },
  {
    id: 2,
    name: "Combo Học Sinh",
    description: "Mì tôm + Nước ngọt + Snack",
    variants: [
      { id: 4, name: "Mì Hảo Hảo tôm chua cay", quantity: 2 },
      { id: 5, name: "Coca Cola 330ml", quantity: 1 },
      { id: 6, name: "Snack Oishi 50g", quantity: 1 }
    ],
    price: 35000,
    discount_price: 29000,
    status: "active",
    created_at: "16/01/2025 10:15"
  },
  {
    id: 3,
    name: "Combo Gia Đình",
    description: "Sữa tươi + Bánh quy + Kẹo",
    variants: [
      { id: 7, name: "Sữa TH True Milk 1L", quantity: 2 },
      { id: 8, name: "Bánh quy Cosy 200g", quantity: 1 },
      { id: 9, name: "Kẹo Alpenliebe 100g", quantity: 2 }
    ],
    price: 120000,
    discount_price: 99000,
    status: "inactive",
    created_at: "17/01/2025 14:20"
  }
];

export function ComboManage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredCombos = mockCombos
    .filter((combo) => {
      const matchesSearch =
        combo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        combo.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || combo.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at") {
        const [dateA, timeA] = aValue.split(" ");
        const [dayA, monthA, yearA] = dateA.split("/");
        const [dateB, timeB] = bValue.split(" ");
        const [dayB, monthB, yearB] = dateB.split("/");
        aValue = new Date(`${yearA}-${monthA}-${dayA} ${timeA}`);
        bValue = new Date(`${yearB}-${monthB}-${dayB} ${timeB}`);
      } else if (sortField === "price" || sortField === "discount_price") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleDeleteCombo = (comboId) => {
    if (confirm("Bạn có chắc muốn xóa combo này?")) {
      setToastMessage("Xóa combo thành công!");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleEditCombo = (combo) => {
    setSelectedCombo(combo);
    setIsEditModalOpen(true);
  };

  const handleSaveCombo = (updatedCombo) => {
    setToastMessage("Cập nhật combo thành công!");
    setIsEditModalOpen(false);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (location.state?.message) {
      setToastMessage(location.state.message);
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [location.state]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="relative flex gap-4 bg-green-50 border border-green-200 rounded-xl px-8 py-5 min-w-105 shadow-lg">
            <CheckCircle className="text-green-600 w-6 h-6" />
            <span className="text-base font-semibold text-gray-800">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Quản lý Combo
          </h1>
          <p className="text-gray-500 mt-1">
            Tổng số: {filteredCombos.length} combo
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="success">
            Xuất dữ liệu
          </Button>
          <Button
            onClick={() => navigate("/products/create_combo")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo combo mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm combo..."
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
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Danh sách Combo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("name")}
                >
                  Tên Combo {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Sản phẩm trong combo</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("price")}
                >
                  Giá gốc {sortField === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("discount_price")}
                >
                  Giá combo {sortField === "discount_price" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort("created_at")}
                >
                  Thời gian tạo {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCombos.map((combo) => (
                <TableRow className="hover:bg-gray-200" key={combo.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{combo.name}</p>
                        <p className="text-xs text-gray-500">
                          {combo.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {combo.variants.slice(0, 2).map((variant) => (
                        <p key={variant.id} className="text-xs text-gray-600">
                          • {variant.name} x{variant.quantity}
                        </p>
                      ))}
                      {combo.variants.length > 2 && (
                        <p className="text-xs text-blue-600 font-medium">
                          +{combo.variants.length - 2} sản phẩm khác
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-500 line-through">
                      {combo.price.toLocaleString()}đ
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 font-semibold">
                      {combo.discount_price.toLocaleString()}đ
                    </span>
                    <Badge className="ml-2 bg-red-100 text-red-700 text-xs">
                      -{Math.round((1 - combo.discount_price / combo.price) * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {combo.status === "active" ? (
                      <Badge className="bg-green-100 text-green-700">Đang bán</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">Ngưng bán</Badge>
                    )}
                  </TableCell>
                  <TableCell>{combo.created_at}</TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate("/products/combo_detail", { state: { combo } })}
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCombo(combo)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCombo(combo.id)}
                        title="Xóa"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
