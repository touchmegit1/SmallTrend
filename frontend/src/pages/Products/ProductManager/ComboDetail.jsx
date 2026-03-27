import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Package2, Edit, Calendar, Trash2 } from "lucide-react"
import Button from "../../../components/product/button";
import { Card } from "../../../components/product/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/product/table";
import { Label } from "../../../components/product/label";
import { Badge } from "../../../components/product/badge";
import EditComboModal from "./EditComboModal";
import { useProductCombos } from "../../../hooks/product_combos";
import { useAuth } from "../../../context/AuthContext";
import { isProductReadOnlyRole } from "../../../utils/rolePermissions";

const ComboDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [combo, setCombo] = useState(location.state?.combo);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { updateCombo, deleteCombo } = useProductCombos();
  const isReadOnlyRole = isProductReadOnlyRole(user);

  const handleSaveCombo = async (updatedCombo) => {
    if (isReadOnlyRole) return;
    try {
      const savedCombo = await updateCombo(combo.id, updatedCombo);
      setCombo(savedCombo || updatedCombo);
      setToastMessage("Cập nhật combo thành công!");
      setIsEditModalOpen(false);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Lỗi khi cập nhật combo");
    }
  };

  const handleDeleteCombo = async () => {
    if (isReadOnlyRole) return;
    if (confirm("Bạn có chắc muốn xóa combo này?")) {
      try {
        await deleteCombo(combo.id);
        navigate("/products/combo", {
          state: { message: "Xóa combo thành công!" },
        });
      } catch (err) {
        alert(err.message || "Lỗi khi xóa combo");
      }
    }
  };

  if (!combo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8">
          <p className="text-gray-500 mb-4">Không tìm thấy combo</p>
          <Button onClick={() => navigate("/products/combo")}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  const discountPercent = combo.originalPrice && combo.originalPrice > 0
    ? Math.round((1 - combo.comboPrice / combo.originalPrice) * 100)
    : 0;

  const totalItems = combo.items?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0;
  const averagePricePerUnit = totalItems > 0 ? combo.comboPrice / totalItems : 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="space-y-5">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-white border-l-4 border-green-500 rounded-xl px-6 py-4 shadow-xl flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-800">{toastMessage}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/products/combo")}
              className="w-10 h-10 p-0 rounded-xl bg-white border border-gray-200 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{combo.comboName}</h1>
              <p className="text-sm text-gray-500 mt-1">Mã Combo: {combo.comboCode || `#${combo.id}`}</p>
            </div>
          </div>
          {!isReadOnlyRole && (
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={handleDeleteCombo}
                className="shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa Combo
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-xl rounded-2xl bg-white/90 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sản phẩm trong combo</p>
                <p className="text-2xl font-bold text-gray-900">{combo.items?.length || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-xl rounded-2xl bg-white/90 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
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
          <Card className="border-0 shadow-xl rounded-2xl bg-white/90 p-5">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50 p-3">
              <div className="aspect-[4/3] bg-white rounded-lg flex items-center justify-center overflow-hidden">
                {combo.imageUrl ? (
                  <img
                    src={combo.imageUrl.startsWith("http") ? combo.imageUrl : `${import.meta.env.PROD ? "" : "http://localhost:8081"}${combo.imageUrl.startsWith("/") ? "" : "/"}${combo.imageUrl}`}
                    alt={combo.comboName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <Package2 className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">Chưa có ảnh combo</p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-3">Hình ảnh combo</p>
          </Card>

          <Card className="border-0 shadow-xl rounded-2xl bg-white/90 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-100">
              <h2 className="text-lg font-bold text-gray-800">Thông tin Combo</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tên Combo</Label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{combo.comboName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
                  <div className="mt-1">
                    {combo.isActive ? (
                      <Badge className="bg-green-50 text-green-700 border border-green-200">Đang bán</Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-700 border border-red-200">Ngưng bán</Badge>
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
                    <Badge className="bg-red-50 text-red-700 border border-red-200">-{discountPercent}%</Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Mô tả</Label>
                <p className="text-sm text-gray-900 mt-1">{combo.description || "Không có mô tả"}</p>
              </div>
            </div>
            {!isReadOnlyRole && (
              <div className="p-5 border-t border-gray-200 bg-gray-50">
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa Combo
                </Button>
              </div>
            )}
          </Card>
        </div>

        <Card className="border-0 shadow-xl rounded-2xl bg-white/90 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-100">
            <h2 className="text-xl font-bold text-gray-800">Sản phẩm trong Combo</h2>
          </div>

          <div className="p-0">
            {!combo.items?.length ? (
              <div className="py-14 text-center text-gray-400">
                <Package2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-base font-medium text-gray-600">Combo chưa có sản phẩm</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                    <TableHead className="w-16 font-bold text-gray-700">STT</TableHead>
                    <TableHead className="font-bold text-gray-700">Tên sản phẩm</TableHead>
                    <TableHead className="font-bold text-gray-700">Số lượng</TableHead>
                    <TableHead className="font-bold text-gray-700">Đơn giá</TableHead>
                    <TableHead className="font-bold text-gray-700">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {combo.items.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package2 className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="font-medium text-gray-900">{item.productVariantName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200">x{item.quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {Math.round(averagePricePerUnit).toLocaleString()}đ
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        {Math.round(averagePricePerUnit * item.quantity).toLocaleString()}đ
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell colSpan={4} className="text-right text-gray-700">Tổng cộng:</TableCell>
                    <TableCell className="text-green-600">{combo.comboPrice?.toLocaleString()}đ</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {!isReadOnlyRole && (
          <EditComboModal
            combo={combo}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveCombo}
          />
        )}
      </div>
    </div>
  );
};

export default ComboDetail;
