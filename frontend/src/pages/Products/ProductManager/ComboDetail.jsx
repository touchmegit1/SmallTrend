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

  const { updateCombo, deleteCombo } = useProductCombos();

  // Hàm xử lý sau khi lưu thành công việc chỉnh sửa Combo (từ Edit Modal)
  // Cập nhật lại dữ liệu đang hiển thị trên giao diện
  const handleSaveCombo = async (updatedCombo) => {
    try {
      const savedCombo = await updateCombo(combo.id, updatedCombo);
      setCombo(savedCombo || updatedCombo); // Update the combo state
      setToastMessage("Cập nhật combo thành công!"); // Keep toast message for success
      setIsEditModalOpen(false);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật combo');
    }
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-green-50 z-50 border border-green-200 rounded-xl px-6 py-4 shadow-lg flex items-center gap-3 transform transition-all animate-bounce">
            <span className="text-sm font-medium text-green-800">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-10 w-10 p-0 rounded-full border-gray-200 hover:bg-gray-100 transition-colors" onClick={() => navigate("/products/combo")}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{combo.comboName}</h1>
              {combo.isActive ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-none px-2.5 py-0.5 font-medium shadow-sm">Đang bán</Badge>
              ) : (
                <Badge className="bg-rose-100 text-rose-700 border-none px-2.5 py-0.5 font-medium shadow-sm">Ngưng bán</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Mã Combo: <span className="font-semibold text-gray-800">{combo.comboCode || `#${combo.id}`}</span></p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all rounded-lg"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteCombo}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border border-gray-200 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
              <Package2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sản phẩm trong combo</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{combo.items?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="border border-gray-200 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tạo: <span className="text-gray-900">{combo.createdAt ? new Date(combo.createdAt).toLocaleDateString("vi-VN") : "-"}</span></p>
              <p className="text-xs font-medium text-gray-500">Cập nhật: <span className="text-gray-900">{combo.updatedAt ? new Date(combo.updatedAt).toLocaleDateString("vi-VN") : "-"}</span></p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Combo Image */}
        <Card className="lg:col-span-1 border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm h-full flex flex-col">
          <div className="p-5 border-b border-gray-100 flex-none">
            <h2 className="text-lg font-bold text-gray-900">Hình ảnh</h2>
          </div>
          <div className="p-5 flex-1 flex flex-col items-center justify-center">
            <div className="w-full aspect-square max-h-64 bg-gray-50 rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-gray-100 shadow-inner group">
              {combo.imageUrl ? (
                <img
                  src={combo.imageUrl.startsWith('http') ? combo.imageUrl : `http://localhost:8081${combo.imageUrl.startsWith('/') ? '' : '/'}${combo.imageUrl}`}
                  alt={combo.comboName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Package2 className="w-20 h-20 text-gray-300" />
              )}
            </div>
          </div>
        </Card>

        {/* Right - Combo Info */}
        <Card className="lg:col-span-2 border border-gray-200 rounded-2xl bg-white shadow-sm h-full flex flex-col">
          <div className="p-5 border-b border-gray-100 flex-none">
            <h2 className="text-lg font-bold text-gray-900">Chi tiết Combo</h2>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Combo</Label>
                <p className="text-base font-semibold text-gray-900 mt-1.5">{combo.comboName}</p>
              </div>
              <div className="sm:text-right">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Giảm giá</Label>
                <Badge className="bg-rose-100 text-rose-700 border-none px-2.5 py-1 text-sm mt-1.5 inline-flex shadow-sm">
                  Cấp độ giảm {discountPercent}%
                </Badge>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá gốc</Label>
                <p className="text-base text-gray-400 line-through mt-1.5 font-medium">{combo.originalPrice?.toLocaleString()} đ</p>
              </div>
              <div className="sm:text-right">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá bán Combo</Label>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{combo.comboPrice?.toLocaleString()} đ</p>
              </div>
            </div>

            <div className="px-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Mô tả</Label>
              <div className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-100 leading-relaxed shadow-sm min-h-[4rem]">
                {combo.description ? combo.description : <span className="text-gray-400 italic">Không có mô tả cho combo này.</span>}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Products in Combo */}
      <Card className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Thành phần Combo</h2>
        </div>
        <div className="p-0">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/80 border-b border-gray-200 hover:bg-gray-50 cursor-default">
                <TableHead className="w-16 font-semibold text-gray-600 text-center">STT</TableHead>
                <TableHead className="font-semibold text-gray-600">Sản phẩm chi tiết</TableHead>
                <TableHead className="font-semibold text-gray-600 text-center w-32">Số lượng</TableHead>
                <TableHead className="font-semibold text-gray-600 text-right">Đơn giá chia đều</TableHead>
                <TableHead className="font-semibold text-gray-600 text-right pr-6">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combo.items?.map((item, index) => {
                const totalItems = combo.items.reduce((sum, v) => sum + v.quantity, 0);
                const averagePricePerUnit = totalItems > 0 ? combo.comboPrice / totalItems : 0;
                const isLast = index === combo.items.length - 1;

                return (
                  <TableRow key={item.id} className={`hover:bg-blue-50/30 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}>
                    <TableCell className="font-medium text-gray-500 text-center">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                          <Package2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-semibold text-gray-800">{item.productVariantName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm">
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 font-medium text-right">
                      {averagePricePerUnit.toFixed(0).toLocaleString()} ₫
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 text-right pr-6">
                      {(averagePricePerUnit * item.quantity).toFixed(0).toLocaleString()} ₫
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-gray-50/80 border-t border-gray-200">
                <TableCell colSpan={4} className="text-right font-semibold text-gray-700 py-4 uppercase text-xs tracking-wider">Tổng cộng giá trị Combo:</TableCell>
                <TableCell className="text-emerald-600 font-black text-lg text-right pr-6 py-4 tracking-tight">
                  {combo.comboPrice?.toLocaleString()} ₫
                </TableCell>
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
