import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getExpiredBatches, getNextDisposalCode, saveDisposalDraft, confirmDisposalVoucher } from "../../services/disposalService";
import { getLocations } from "../../services/inventoryService";
import { formatCurrency } from "../../utils/inventory";

const REASON_OPTIONS = [
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "DAMAGED", label: "Hư hỏng" },
  { value: "LOST", label: "Thất thoát" },
  { value: "OBSOLETE", label: "Lỗi thời" },
  { value: "OTHER", label: "Khác" },
];

export default function DisposalCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [voucherCode, setVoucherCode] = useState("");
  const [locationId, setLocationId] = useState("");
  const [reasonType, setReasonType] = useState("EXPIRED");
  const [notes, setNotes] = useState("");
  
  // Reference data
  const [locations, setLocations] = useState([]);
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // UI state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Load initial data
  useEffect(() => {
    const init = async () => {
      try {
        const [code, locs] = await Promise.all([
          getNextDisposalCode(),
          getLocations(),
        ]);
        setVoucherCode(code);
        setLocations(locs.filter(l => l.status === "ACTIVE"));
      } catch (err) {
        alert("Lỗi tải dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Load expired batches when warehouse selected
  useEffect(() => {
    if (!locationId) {
      setExpiredBatches([]);
      return;
    }

    const loadBatches = async () => {
      try {
        const batches = await getExpiredBatches(locationId);
        setExpiredBatches(batches);
      } catch (err) {
        alert("Lỗi tải lô hết hạn: " + err.message);
      }
    };
    loadBatches();
  }, [locationId]);

  // Add batch to disposal items
  const addItem = (batch) => {
    if (selectedItems.some(item => item.batchId === batch.batchId)) {
      alert("Lô hàng đã được thêm");
      return;
    }

    setSelectedItems([...selectedItems, {
      batchId: batch.batchId,
      productId: batch.productId,
      productName: batch.productName,
      batchCode: batch.batchCode,
      availableQuantity: batch.availableQuantity,
      quantity: batch.availableQuantity,
      unitCost: batch.unitCost,
      totalCost: batch.totalValue,
      expiryDate: batch.expiryDate,
    }]);
  };

  // Remove item
  const removeItem = (batchId) => {
    setSelectedItems(selectedItems.filter(item => item.batchId !== batchId));
  };

  // Update item quantity
  const updateQuantity = (batchId, newQty) => {
    const qty = parseInt(newQty) || 0;
    setSelectedItems(selectedItems.map(item => {
      if (item.batchId === batchId) {
        return {
          ...item,
          quantity: Math.min(qty, item.availableQuantity),
          totalCost: Math.min(qty, item.availableQuantity) * item.unitCost,
        };
      }
      return item;
    }));
  };

  // Calculate totals
  const totals = {
    items: selectedItems.length,
    quantity: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    value: selectedItems.reduce((sum, item) => sum + item.totalCost, 0),
  };

  // Validate form
  const validate = () => {
    const errs = {};
    if (!locationId) errs.locationId = "Vui lòng chọn kho";
    if (!reasonType) errs.reasonType = "Vui lòng chọn lý do";
    if (selectedItems.length === 0) errs.items = "Vui lòng thêm ít nhất 1 sản phẩm";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const userId = JSON.parse(localStorage.getItem("user"))?.id || 1;
      await saveDisposalDraft({
        locationId: parseInt(locationId),
        reasonType,
        notes,
        items: selectedItems.map(item => ({
          batchId: item.batchId,
          productId: item.productId,
          quantity: item.quantity,
        })),
      }, userId);
      
      alert("Lưu nháp thành công");
      navigate("/inventory/disposal");
    } catch (err) {
      alert("Lỗi lưu nháp: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Confirm and deduct stock
  const handleConfirm = async () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const confirmDeduction = async () => {
    setSaving(true);
    try {
      const userId = JSON.parse(localStorage.getItem("user"))?.id || 1;
      
      // Save draft first
      const draft = await saveDisposalDraft({
        locationId: parseInt(locationId),
        reasonType,
        notes,
        items: selectedItems.map(item => ({
          batchId: item.batchId,
          productId: item.productId,
          quantity: item.quantity,
        })),
      }, userId);

      // Then confirm
      await confirmDisposalVoucher(draft.id, userId);
      
      alert("Xác nhận thành công! Tồn kho đã được trừ.");
      navigate("/inventory/disposal");
    } catch (err) {
      alert("Lỗi xác nhận: " + err.message);
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo phiếu xử lý</h1>
          <p className="text-sm text-gray-500 mt-1">Mã phiếu: <span className="font-mono font-semibold text-red-600">{voucherCode}</span></p>
        </div>
        <button
          onClick={() => navigate("/inventory/disposal")}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Quay lại
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Warehouse & Reason */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kho <span className="text-red-500">*</span>
                </label>
                <select
                  value={locationId}
                  onChange={(e) => {
                    setLocationId(e.target.value);
                    setSelectedItems([]);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none ${
                    errors.locationId ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <option value="">-- Chọn kho --</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name || loc.location_name}</option>
                  ))}
                </select>
                {errors.locationId && <p className="text-xs text-red-500 mt-1">{errors.locationId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do <span className="text-red-500">*</span>
                </label>
                <select
                  value={reasonType}
                  onChange={(e) => setReasonType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {REASON_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>

          {/* Expired Batches */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Lô hàng hết hạn</h3>
            
            {!locationId ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                Vui lòng chọn kho để tải danh sách lô hết hạn
              </div>
            ) : expiredBatches.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                Không có lô hàng hết hạn
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sản phẩm</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Mã lô</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">HSD</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">SL</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Giá trị</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expiredBatches.map(batch => (
                      <tr key={batch.batchId} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{batch.productName}</td>
                        <td className="px-3 py-2 font-mono text-xs">{batch.batchCode}</td>
                        <td className="px-3 py-2 text-red-600">{new Date(batch.expiryDate).toLocaleDateString("vi-VN")}</td>
                        <td className="px-3 py-2 text-right">{batch.availableQuantity}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(batch.totalValue)}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => addItem(batch)}
                            disabled={selectedItems.some(item => item.batchId === batch.batchId)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Thêm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Selected Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Danh sách xử lý ({selectedItems.length})
            </h3>
            
            {errors.items && <p className="text-sm text-red-500 mb-3">{errors.items}</p>}

            {selectedItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                Chưa có sản phẩm nào được chọn
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Sản phẩm</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Mã lô</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">SL khả dụng</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">SL xử lý</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Giá trị</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedItems.map(item => (
                      <tr key={item.batchId}>
                        <td className="px-3 py-2">{item.productName}</td>
                        <td className="px-3 py-2 font-mono text-xs">{item.batchCode}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{item.availableQuantity}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.batchId, e.target.value)}
                            min={1}
                            max={item.availableQuantity}
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.totalCost)}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => removeItem(item.batchId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary & Actions */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Tổng quan</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng sản phẩm:</span>
                <span className="font-semibold">{totals.items}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng số lượng:</span>
                <span className="font-semibold">{totals.quantity}</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t">
                <span className="text-gray-600">Tổng giá trị:</span>
                <span className="font-semibold text-red-600 text-lg">{formatCurrency(totals.value)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <button
              onClick={handleConfirm}
              disabled={saving || selectedItems.length === 0}
              className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? "Đang xử lý..." : "Xác nhận & Trừ kho"}
            </button>
            
            <button
              onClick={handleSaveDraft}
              disabled={saving || selectedItems.length === 0}
              className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lưu nháp
            </button>

            <button
              onClick={() => navigate("/inventory/disposal")}
              className="w-full px-4 py-2.5 text-gray-600 hover:text-gray-900"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận xử lý</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xác nhận phiếu xử lý này? 
              <br /><br />
              <strong className="text-red-600">Tồn kho sẽ bị trừ ngay lập tức và không thể hoàn tác!</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeduction}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Đang xử lý..." : "Xác nhận"}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
