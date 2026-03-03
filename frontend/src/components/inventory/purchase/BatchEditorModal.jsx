import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar, Package } from "lucide-react";

export default function BatchEditorModal({ item, onSave, onClose }) {
  const [batches, setBatches] = useState([]);

  // Initialize from item's existing batches
  useEffect(() => {
    if (item?.batches && item.batches.length > 0) {
      setBatches(item.batches.map((b, i) => ({ ...b, _id: i })));
    } else {
      setBatches([]);
    }
  }, [item]);

  if (!item) return null;

  const addBatch = () => {
    setBatches((prev) => [
      ...prev,
      {
        _id: Date.now(),
        batch_code: "",
        expiry_date: "",
        quantity: 0,
      },
    ]);
  };

  const updateBatch = (id, field, value) => {
    setBatches((prev) =>
      prev.map((b) => (b._id === id ? { ...b, [field]: value } : b)),
    );
  };

  const removeBatch = (id) => {
    setBatches((prev) => prev.filter((b) => b._id !== id));
  };

  const totalBatchQty = batches.reduce(
    (s, b) => s + (parseInt(b.quantity) || 0),
    0,
  );
  const qtyDiff = item.quantity - totalBatchQty;

  const handleSave = () => {
    // Validate batch_codes
    const hasEmptyCodes = batches.some((b) => !b.batch_code.trim());
    if (hasEmptyCodes) {
      alert("Mỗi lô hàng phải có mã lô.");
      return;
    }

    const hasZeroQty = batches.some((b) => (parseInt(b.quantity) || 0) <= 0);
    if (hasZeroQty) {
      alert("Số lượng mỗi lô phải > 0.");
      return;
    }

    // Save batches (strip internal _id)
    const cleanBatches = batches.map(({ _id, ...rest }) => ({
      ...rest,
      quantity: parseInt(rest.quantity) || 0,
    }));
    onSave(item._key, cleanBatches);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Quản lý lô hàng
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.name}{" "}
              <span className="font-mono text-indigo-500">({item.sku})</span> —
              Tổng cần nhập:{" "}
              <span className="font-bold">
                {item.quantity} {item.unit}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[450px] overflow-auto">
          {batches.length === 0 ? (
            <div className="text-center py-10">
              <Package size={36} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 text-sm mb-3">
                Chưa có lô hàng nào. Thêm lô hàng để quản lý HSD.
              </p>
              <button
                onClick={addBatch}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
              >
                <Plus size={16} /> Thêm lô hàng
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((batch, idx) => (
                <div
                  key={batch._id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="text-xs font-bold text-slate-400 pt-2 w-6 text-center">
                    {idx + 1}
                  </div>

                  {/* Batch Code */}
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
                      Mã lô
                    </label>
                    <input
                      type="text"
                      value={batch.batch_code}
                      onChange={(e) =>
                        updateBatch(batch._id, "batch_code", e.target.value)
                      }
                      placeholder="VD: LOT-2026-001"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="w-24">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      value={batch.quantity}
                      onChange={(e) =>
                        updateBatch(batch._id, "quantity", e.target.value)
                      }
                      min="1"
                      className="w-full px-3 py-2 text-sm text-right border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="w-40">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
                      Hạn sử dụng
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={batch.expiry_date || ""}
                        onChange={(e) =>
                          updateBatch(batch._id, "expiry_date", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeBatch(batch._id)}
                    className="p-2 mt-5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              <button
                onClick={addBatch}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-indigo-600 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition"
              >
                <Plus size={16} /> Thêm lô
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-slate-500">Tổng lô: </span>
            <span className="font-bold text-slate-900">{totalBatchQty}</span>
            <span className="text-slate-400">
              {" "}
              / {item.quantity} {item.unit}
            </span>
            {qtyDiff !== 0 && batches.length > 0 && (
              <span
                className={`ml-2 text-xs font-semibold ${qtyDiff > 0 ? "text-amber-600" : "text-red-600"}`}
              >
                (
                {qtyDiff > 0 ? `Thiếu ${qtyDiff}` : `Thừa ${Math.abs(qtyDiff)}`}
                )
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={batches.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Lưu lô hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
