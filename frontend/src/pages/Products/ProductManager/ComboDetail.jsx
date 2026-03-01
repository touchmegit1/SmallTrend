import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Package2, Edit, TrendingUp, Calendar, Trash2 } from "lucide-react";
import Button from "../ProductComponents/button";
import { Card } from "../ProductComponents/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ProductComponents/table";
import { Label } from "../ProductComponents/label";
import { Badge } from "../ProductComponents/badge";
import EditComboModal from "./EditComboModal";
import { useProductCombos } from "../../../hooks/product_combos";

// Component hiển thị chi tiết của một Combo Sản phẩm
// Cho phép xem thông tin cấu thành (các sản phẩm con), trạng thái và thực hiện các thao tác sửa/xoá
const ComboDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [combo, setCombo] = useState(location.state?.combo); // Use useState to allow updating combo
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { deleteCombo } = useProductCombos();

  // Hàm xử lý sau khi lưu thành công việc chỉnh sửa Combo (từ Edit Modal)
  // Cập nhật lại dữ liệu đang hiển thị trên giao diện
  const handleSaveCombo = (updatedCombo) => {
    setCombo(updatedCombo); // Update the combo state
    setToastMessage("Cập nhật combo thành công!"); // Keep toast message for success
    setIsEditModalOpen(false);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Hàm xử lý xoá Combo Sản phẩm
  // Hiển thị hộp thoại xác nhận trước khi gọi API để xoá bản ghi
  const handleDeleteCombo = async () => {
    if (confirm("Bạn có chắc muốn xóa combo này?")) { // Changed to window.confirm as per instruction, but keeping original confirm for consistency
      try {
        await deleteCombo(combo.id);
        navigate("/products/combo", {
          state: { message: "Xóa combo thành công!" }
        });
      } catch (err) {
        alert(err.message || 'Lỗi khi xóa combo');
      }
    }
  };

  if (!combo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy combo</p>
          <Button onClick={() => navigate("/products/combo")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const discountPercent = combo.originalPrice && combo.originalPrice > 0
    ? Math.round((1 - combo.comboPrice / combo.originalPrice) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-green-50 border border-green-200 rounded-xl px-8 py-5 shadow-lg">
            <span className="text-base font-semibold text-gray-800">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => navigate("/products/combo")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{combo.comboName}</h1>
            <p className="text-md text-gray-500 font-semibold">Mã Combo: {combo.comboCode || `#${combo.id}`}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={handleDeleteCombo}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa Combo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sản phẩm trong combo</p>
              <p className="text-2xl font-bold text-gray-900">{combo.items?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã bán (30 ngày)</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ngày tạo: {combo.createdAt ? new Date(combo.createdAt).toLocaleDateString("vi-VN") : "-"}</p>
              <p className="text-xs text-gray-500">Cập nhật: {combo.updatedAt ? new Date(combo.updatedAt).toLocaleDateString("vi-VN") : "-"}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left - Combo Image */}
        <Card className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
            <Package2 className="w-16 h-16 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Hình ảnh combo</p>
          </div>
        </Card>

        {/* Right - Combo Info */}
        <Card className="border border-gray-300 rounded-lg bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold">Thông tin Combo</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-500">Tên Combo</Label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{combo.comboName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
                <div className="mt-1">
                  {combo.isActive ? (
                    <Badge className="bg-green-100 text-green-700">Đang bán</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700">Ngưng bán</Badge>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Giá gốc</Label>
                <p className="text-sm text-gray-500 line-through mt-1">{combo.originalPrice?.toLocaleString()}đ</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Giá Combo</Label>
                <p className="text-sm font-bold text-green-600 mt-1">{combo.comboPrice?.toLocaleString()}đ</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Giảm giá</Label>
                <div className="mt-1">
                  <Badge className="bg-red-100 text-red-700">-{discountPercent}%</Badge>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Mô tả</Label>
              <p className="text-sm text-gray-900 mt-1">{combo.description}</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa Combo
            </Button>
          </div>
        </Card>
      </div>

      {/* Products in Combo */}
      <Card className="border border-gray-300 rounded-lg bg-white">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold">Sản phẩm trong Combo</h2>
        </div>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combo.items?.map((item, index) => {
                const totalItems = combo.items.reduce((sum, v) => sum + v.quantity, 0);
                const averagePricePerUnit = totalItems > 0 ? combo.comboPrice / totalItems : 0;

                return (
                  <TableRow key={item.id} className="hover:bg-gray-100">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-medium">{item.productVariantName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700">x{item.quantity}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {averagePricePerUnit.toFixed(0).toLocaleString()}đ
                    </TableCell>
                    <TableCell className="font-semibold">
                      {(averagePricePerUnit * item.quantity).toFixed(0).toLocaleString()}đ
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-gray-50 font-bold">
                <TableCell colSpan={4} className="text-right">Tổng cộng:</TableCell>
                <TableCell className="text-green-600">{combo.comboPrice?.toLocaleString()}đ</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      <EditComboModal
        combo={combo}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCombo}
      />
    </div>
  );
}

export default ComboDetail;
