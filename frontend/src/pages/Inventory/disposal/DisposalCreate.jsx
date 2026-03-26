import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExpiredBatches,
  getNextDisposalCode,
  saveDisposalDraft,
  approveDisposalVoucher,
} from "../../../services/inventory/disposalService";
import { getActiveLocations } from "../../../services/inventory/inventoryService";
import { formatCurrency } from "../../../utils/inventory";
import { useToast } from "../../../components/ui/Toast";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

const REASON_OPTIONS = [{ value: "EXPIRED", label: "Hết hạn" }];

export default function DisposalCreate() {
  const navigate = useNavigate();
  const toast = useToast();
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
  const [confirmState, setConfirmState] = useState(null);
  const [errors, setErrors] = useState({});

  const confirmConfigs = {
    confirmDeduction: {
      title: "Xác nhận xử lý",
      message:
        "Bạn có chắc chắn muốn xác nhận phiếu xử lý này? Tồn kho sẽ bị trừ ngay lập tức và không thể hoàn tác.",
      confirmText: "Xác nhận",
      variant: "warning",
    },
  };

  // Load initial data
  useEffect(() => {
    const init = async () => {
      try {
        const [code, locs] = await Promise.all([
          getNextDisposalCode(),
          getActiveLocations(),
        ]);
        setVoucherCode(code);
        setLocations(locs);
      } catch (err) {
        toast.error("Lá»—i táº£i dá»¯ liá»‡u: " + err.message);
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
        toast.error("Lá»—i táº£i lĂ´ háº¿t háº¡n: " + err.message);
      }
    };
    loadBatches();
  }, [locationId]);

  // Add batch to disposal items
  const addItem = (batch) => {
    if (selectedItems.some((item) => item.batchId === batch.batchId)) {
      toast.warning("LĂ´ hĂ ng Ä‘Ă£ Ä‘Æ°á»£c thĂªm");
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        batchId: batch.batchId,
        productId: batch.productId,
        productName: batch.productName,
        batchCode: batch.batchCode,
        availableQuantity: batch.availableQuantity,
        quantity: batch.availableQuantity,
        unitCost: batch.unitCost,
        totalCost: batch.totalValue,
        expiryDate: batch.expiryDate,
      },
    ]);
  };

  // Remove item
  const removeItem = (batchId) => {
    setSelectedItems(selectedItems.filter((item) => item.batchId !== batchId));
  };

  // Update item quantity
  const updateQuantity = (batchId, newQty) => {
    const qty = parseInt(newQty) || 0;
    setSelectedItems(
      selectedItems.map((item) => {
        if (item.batchId === batchId) {
          return {
            ...item,
            quantity: Math.min(qty, item.availableQuantity),
            totalCost: Math.min(qty, item.availableQuantity) * item.unitCost,
          };
        }
        return item;
      }),
    );
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
    if (!locationId) errs.locationId = "Vui lĂ²ng chá»n kho";
    if (!reasonType) errs.reasonType = "Vui lĂ²ng chá»n lĂ½ do";
    if (selectedItems.length === 0)
      errs.items = "Vui lĂ²ng thĂªm Ă­t nháº¥t 1 sáº£n pháº©m";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const userId = JSON.parse(localStorage.getItem("user"))?.id || 1;
      await saveDisposalDraft(
        {
          locationId: parseInt(locationId),
          reasonType,
          notes,
          items: selectedItems.map((item) => ({
            batchId: item.batchId,
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        userId,
      );

      toast.success("LÆ°u nhĂ¡p thĂ nh cĂ´ng");
      navigate("/inventory/disposal");
    } catch (err) {
      toast.error("Lá»—i lÆ°u nhĂ¡p: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Confirm and deduct stock
  const handleConfirm = async () => {
    if (!validate()) return;
    setConfirmState("confirmDeduction");
  };

  const closeConfirm = () => setConfirmState(null);

  const confirmDeduction = async () => {
    setSaving(true);
    try {
      const userId = JSON.parse(localStorage.getItem("user"))?.id || 1;

      const draft = await saveDisposalDraft(
        {
          locationId: parseInt(locationId),
          reasonType,
          notes,
          items: selectedItems.map((item) => ({
            batchId: item.batchId,
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        userId,
      );

      await approveDisposalVoucher(draft.id, userId);

      toast.success("XĂ¡c nháº­n thĂ nh cĂ´ng! Tá»“n kho Ä‘Ă£ Ä‘Æ°á»£c trá»«.");
      navigate("/inventory/disposal");
    } catch (err) {
      toast.error("Lá»—i xĂ¡c nháº­n: " + err.message);
    } finally {
      setSaving(false);
      closeConfirm();
    }
  };

  const executeConfirmedAction = async () => {
    if (confirmState !== "confirmDeduction") return;
    await confirmDeduction();
  };

  const activeConfirmConfig = confirmState
    ? confirmConfigs[confirmState]
    : null;

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
          <h1 className="text-2xl font-bold text-slate-900">Táº¡o phiáº¿u xá»­ lĂ½</h1>
          <p className="text-sm text-slate-500 mt-1">
            MĂ£ phiáº¿u:{" "}
            <span className="font-mono font-semibold text-red-600">
              {voucherCode}
            </span>
          </p>
        </div>
        <button
          onClick={() => navigate("/inventory/disposal")}
          className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          â† Quay láº¡i
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Warehouse & Reason */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">ThĂ´ng tin cÆ¡ báº£n</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kho <span className="text-red-500">*</span>
                </label>
                <select
                  value={locationId}
                  onChange={(e) => {
                    setLocationId(e.target.value);
                    setSelectedItems([]);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none ${
                    errors.locationId ? "border-red-500" : "border-slate-200"
                  }`}
                >
                  <option value="">-- Chá»n kho --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name || loc.location_name}
                    </option>
                  ))}
                </select>
                {errors.locationId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.locationId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  LĂ½ do <span className="text-red-500">*</span>
                </label>
                <select
                  value={reasonType}
                  onChange={(e) => setReasonType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {REASON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ghi chĂº
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Nháº­p ghi chĂº..."
              />
            </div>
          </div>

          {/* Expired Batches */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              LĂ´ hĂ ng háº¿t háº¡n
            </h3>

            {!locationId ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                Vui lĂ²ng chá»n kho Ä‘á»ƒ táº£i danh sĂ¡ch lĂ´ háº¿t háº¡n
              </div>
            ) : expiredBatches.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                KhĂ´ng cĂ³ lĂ´ hĂ ng háº¿t háº¡n
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Sáº£n pháº©m
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        MĂ£ lĂ´
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        HSD
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                        SL
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                        GiĂ¡ trá»‹
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">
                        Thao tĂ¡c
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expiredBatches.map((batch) => (
                      <tr key={batch.batchId} className="hover:bg-slate-50">
                        <td className="px-3 py-2">{batch.productName}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {batch.batchCode}
                        </td>
                        <td className="px-3 py-2 text-red-600">
                          {new Date(batch.expiryDate).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {batch.availableQuantity}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(batch.totalValue)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => addItem(batch)}
                            disabled={selectedItems.some(
                              (item) => item.batchId === batch.batchId,
                            )}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ThĂªm
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
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">
              Danh sĂ¡ch xá»­ lĂ½ ({selectedItems.length})
            </h3>

            {errors.items && (
              <p className="text-sm text-red-500 mb-3">{errors.items}</p>
            )}

            {selectedItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                ChÆ°a cĂ³ sáº£n pháº©m nĂ o Ä‘Æ°á»£c chá»n
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        Sáº£n pháº©m
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                        MĂ£ lĂ´
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                        SL kháº£ dá»¥ng
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                        SL xá»­ lĂ½
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                        GiĂ¡ trá»‹
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">
                        XĂ³a
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedItems.map((item) => (
                      <tr key={item.batchId}>
                        <td className="px-3 py-2">{item.productName}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {item.batchCode}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-500">
                          {item.availableQuantity}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.batchId, e.target.value)
                            }
                            min={1}
                            max={item.availableQuantity}
                            className="w-20 px-2 py-1 border border-slate-200 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(item.totalCost)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => removeItem(item.batchId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            âœ•
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
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Tá»•ng quan</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tá»•ng sáº£n pháº©m:</span>
                <span className="font-semibold">{totals.items}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tá»•ng sá»‘ lÆ°á»£ng:</span>
                <span className="font-semibold">{totals.quantity}</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t">
                <span className="text-slate-600">Tá»•ng giĂ¡ trá»‹:</span>
                <span className="font-semibold text-red-600 text-lg">
                  {formatCurrency(totals.value)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <button
              onClick={handleConfirm}
              disabled={saving || selectedItems.length === 0}
              className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? "Äang xá»­ lĂ½..." : "XĂ¡c nháº­n & Trá»« kho"}
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={saving || selectedItems.length === 0}
              className="w-full px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              LÆ°u nhĂ¡p
            </button>

            <button
              onClick={() => navigate("/inventory/disposal")}
              className="w-full px-4 py-2.5 text-slate-600 hover:text-slate-900"
            >
              Há»§y
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!activeConfirmConfig}
        title={activeConfirmConfig?.title}
        message={activeConfirmConfig?.message}
        confirmText={activeConfirmConfig?.confirmText}
        cancelText="Hủy"
        variant={activeConfirmConfig?.variant || "warning"}
        onCancel={closeConfirm}
        onConfirm={executeConfirmedAction}
      />

      {saving && !!activeConfirmConfig && (
        <div className="fixed inset-0 z-[10000] pointer-events-none" />
      )}
    </div>
  );
}

