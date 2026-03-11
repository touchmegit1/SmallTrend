import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePurchaseOrder } from "../../../hooks/usePurchaseOrder";
import {
  PO_STATUS,
  PO_STATUS_CONFIG,
  formatVND,
} from "../../../utils/purchaseOrder";
import { useAuth } from "../../../context/AuthContext";

import PurchaseHeader from "../../../components/inventory/purchase/PurchaseHeader";
import ProductSearchBar from "../../../components/inventory/purchase/ProductSearchBar";
import PurchaseItemTable from "../../../components/inventory/purchase/PurchaseItemTable";
import BatchEditorModal from "../../../components/inventory/purchase/BatchEditorModal";
import SummaryPanel from "../../../components/inventory/purchase/SummaryPanel";
import ActionButtons from "../../../components/inventory/purchase/ActionButtons";
import RejectionModal from "../../../components/ui/RejectionModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import GoodsReceiptTable from "../../../components/inventory/purchase/GoodsReceiptTable";
import {
  Package,
  Save,
  CheckCircle,
  Loader2,
  Trash2,
  Clock,
  User,
  ClipboardCheck,
  PackageCheck,
  XCircle,
  ShieldCheck,
  Eye,
} from "lucide-react";

function CreatePurchaseOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "warning",
  });
  const { user } = useAuth();

  const openConfirm = (title, message, onConfirm, variant = "warning") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        await onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      variant,
    });
  };

  const {
    products,
    suppliers,
    locations,
    filteredSuppliers,
    loading,
    saving,
    error,
    order,
    items,
    financials,
    supplierQuery,
    setSupplierQuery,
    selectSupplier,
    clearSupplier,
    updateOrder,
    addProduct,
    importProducts,
    removeItem,
    updateItem,
    batchEditData,
    openBatchEditor,
    closeBatchEditor,
    updateItemBatches,
    receiptItems,
    updateReceiptItem,
    saveDraft,
    submitForApproval,
    confirmOrder,
    startChecking,
    validateReceiveGoodsConfig,
    receiveGoods,
    rejectOrder,
    deleteOrder,
  } = usePurchaseOrder(id || null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0"></div>
          </div>
          <p className="text-sm text-slate-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Lỗi tải dữ liệu</p>
          <p className="text-sm text-slate-500 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const isEditable =
    order.status === PO_STATUS.DRAFT || order.status === PO_STATUS.REJECTED;
  const isChecking = order.status === PO_STATUS.CHECKING;
  const isPending = order.status === PO_STATUS.PENDING;
  const isConfirmed = order.status === PO_STATUS.CONFIRMED;
  const isReceived = order.status === PO_STATUS.RECEIVED;
  const isCancelled = order.status === PO_STATUS.CANCELLED;

  // Layout modes:
  // "edit"     → DRAFT, REJECTED (tạo/sửa phiếu, chỉ sp + SL)
  // "review"   → PENDING, CONFIRMED, RECEIVED, CANCELLED (xem/duyệt phiếu, card layout)
  // "checking" → CHECKING (kiểm kê, sidebar để nhập chi tiết)
  const layoutMode = isEditable ? "edit" : isChecking ? "checking" : "review";

  const statusCfg = PO_STATUS_CONFIG[order.status] || PO_STATUS_CONFIG.DRAFT;

  const userRole = (user?.role || "").toUpperCase();
  const isManagerOrAdmin = [
    "MANAGER",
    "ROLE_MANAGER",
    "ADMIN",
    "ROLE_ADMIN",
  ].includes(userRole);
  const isInventoryStaff = ["INVENTORY_STAFF", "ROLE_INVENTORY_STAFF"].includes(
    userRole,
  );
  const canCheckAndReceive = isManagerOrAdmin || isInventoryStaff;

  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const handleRejectClick = () => {
    setShowRejectionModal(true);
  };

  const handleRejectSubmit = async (reason) => {
    const result = await rejectOrder(navigate, reason);
    if (result) {
      setShowRejectionModal(false);
    }
  };

  // ─── Info Strip (reusable) ─────────────────────────────────
  const InfoStrip = ({ gradient }) => (
    <div
      className={`px-6 py-4 border-b border-slate-100 ${gradient || "bg-gradient-to-r from-indigo-50/80 via-white to-slate-50/50"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Package size={17} className="text-indigo-600" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold text-indigo-600">
                {order.po_number || "—"}
              </span>
            </div>
          </div>
          <div className="h-5 w-px bg-slate-200"></div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusCfg.bg} ${statusCfg.text}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
            ></span>
            {statusCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString("vi-VN")
              : "---"}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
            {items.length} sản phẩm
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <PurchaseHeader
          order={order}
          onBack={() => navigate("/inventory/purchase-orders")}
        />

        {/* ═══════════════════════════════════════════════════════
            EDIT MODE: DRAFT / REJECTED
            Card layout: search + table + save/submit
        ═══════════════════════════════════════════════════════ */}
        {layoutMode === "edit" && (
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-6 py-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <InfoStrip />

                <ProductSearchBar
                  products={products}
                  onAddProduct={addProduct}
                  onImportProducts={importProducts}
                />

                <PurchaseItemTable
                  items={items}
                  isEditable={true}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  onOpenBatch={openBatchEditor}
                />

                {/* Action Footer */}
                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      {items.length > 0
                        ? `${items.length} sản phẩm · Tổng SL: ${totalQty}`
                        : "Thêm sản phẩm để bắt đầu"}
                    </div>
                    <div className="flex items-center gap-2.5">
                      {!!id && (
                        <button
                          onClick={() =>
                            openConfirm(
                              "Xóa phiếu",
                              "Bạn có chắc chắn muốn xóa phiếu nhập tạm này không?",
                              () => deleteOrder(navigate),
                              "danger",
                            )
                          }
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Trash2 size={14} />
                          Xóa
                        </button>
                      )}
                      <button
                        onClick={() => saveDraft(navigate)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        {saving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}
                        Lưu nháp
                      </button>
                      <button
                        onClick={() => submitForApproval(navigate)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
                      >
                        {saving ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle size={15} />
                        )}
                        Gửi yêu cầu duyệt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            REVIEW MODE: PENDING / CONFIRMED / RECEIVED / CANCELLED
            Card layout: read-only table + contextual actions
        ═══════════════════════════════════════════════════════ */}
        {layoutMode === "review" && (
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
              {/* ─── Main Card ────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <InfoStrip
                  gradient={
                    isPending
                      ? "bg-gradient-to-r from-amber-50/60 via-white to-slate-50/50"
                      : isConfirmed
                        ? "bg-gradient-to-r from-blue-50/60 via-white to-slate-50/50"
                        : isReceived
                          ? "bg-gradient-to-r from-emerald-50/60 via-white to-slate-50/50"
                          : "bg-gradient-to-r from-slate-50/60 via-white to-slate-50/50"
                  }
                />

                {/* Products table (read-only) */}
                <PurchaseItemTable
                  items={items}
                  isEditable={false}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  onOpenBatch={openBatchEditor}
                />

                {/* Summary stats */}
                <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Package size={13} className="text-slate-400" />
                        <span className="font-medium">{items.length}</span> mặt
                        hàng
                      </div>
                      <div className="h-4 w-px bg-slate-200"></div>
                      <div className="text-slate-500">
                        Tổng SL:{" "}
                        <span className="font-semibold text-slate-700">
                          {totalQty}
                        </span>
                      </div>
                    </div>
                    {(isReceived || isConfirmed) && financials.total > 0 && (
                      <div className="text-sm text-slate-500">
                        Tổng tiền:{" "}
                        <span className="font-bold text-indigo-600">
                          {formatVND(financials.total)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Action Footer ──────────────────────────── */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    {/* Left: Status context message */}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      {isPending && (
                        <>
                          <Eye size={14} className="text-amber-500" />
                          <span>Phiếu đang chờ duyệt</span>
                        </>
                      )}
                      {isConfirmed && (
                        <>
                          <ShieldCheck size={14} className="text-blue-500" />
                          <span>Đã duyệt · Chờ kiểm kê</span>
                        </>
                      )}
                      {isReceived && (
                        <>
                          <PackageCheck
                            size={14}
                            className="text-emerald-500"
                          />
                          <span>Đã nhập kho thành công</span>
                        </>
                      )}
                      {isCancelled && (
                        <>
                          <XCircle size={14} className="text-slate-400" />
                          <span>Phiếu đã hủy</span>
                        </>
                      )}
                    </div>

                    {/* Right: Action buttons */}
                    <div className="flex items-center gap-2.5">
                      {/* PENDING → Manager Approve / Reject */}
                      {isPending && isManagerOrAdmin && (
                        <>
                          <button
                            onClick={handleRejectClick}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <XCircle size={14} />
                            Từ chối
                          </button>
                          <button
                            onClick={() =>
                              openConfirm(
                                "Duyệt phiếu nhập",
                                "Xác nhận duyệt phiếu nhập? Phiếu sẽ chuyển cho NV kho kiểm kê.",
                                () => confirmOrder(navigate),
                                "info",
                              )
                            }
                            disabled={saving}
                            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200"
                          >
                            {saving ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <CheckCircle size={15} />
                            )}
                            Duyệt phiếu nhập
                          </button>
                        </>
                      )}

                      {/* CONFIRMED → Start Checking */}
                      {isConfirmed && canCheckAndReceive && (
                        <button
                          onClick={() =>
                            openConfirm(
                              "Bắt đầu kiểm kê",
                              "Bắt đầu kiểm kê hàng hóa?",
                              startChecking,
                              "info",
                            )
                          }
                          disabled={saving}
                          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-purple-200"
                        >
                          {saving ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <ClipboardCheck size={15} />
                          )}
                          Bắt đầu kiểm kê
                        </button>
                      )}

                      {/* RECEIVED / CANCELLED → Done indicator */}
                      {(isReceived || isCancelled) && (
                        <div className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 rounded-xl">
                          <CheckCircle size={14} />
                          Đã xử lý xong
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            CHECKING MODE: CHECKING
            Full-width table + sidebar for detailed data entry
        ═══════════════════════════════════════════════════════ */}
        {layoutMode === "checking" && (
          <GoodsReceiptTable
            items={items}
            receiptItems={receiptItems}
            onUpdateReceiptItem={updateReceiptItem}
          />
        )}
      </div>

      {/* ─── Right Sidebar (CHECKING mode only) ──────────────── */}
      {layoutMode === "checking" && (
        <div className="flex flex-col w-[380px] bg-white border-l border-slate-200 shrink-0 h-full">
          <SummaryPanel
            order={order}
            items={items}
            financials={financials}
            suppliers={suppliers}
            filteredSuppliers={filteredSuppliers}
            locations={locations}
            supplierQuery={supplierQuery}
            setSupplierQuery={setSupplierQuery}
            selectSupplier={selectSupplier}
            clearSupplier={clearSupplier}
            updateOrder={updateOrder}
            isEditable={true}
          />

          <ActionButtons
            status={order.status}
            saving={saving}
            isEditMode={!!id}
            onSaveDraft={() => saveDraft(navigate)}
            onSubmitForApproval={() => submitForApproval(navigate)}
            onConfirm={() =>
              openConfirm(
                "Duyệt phiếu nhập",
                "Xác nhận duyệt phiếu nhập? Phiếu sẽ chuyển cho NV kho kiểm kê.",
                () => confirmOrder(navigate),
                "info",
              )
            }
            onReject={handleRejectClick}
            onDelete={() =>
              openConfirm(
                "Xóa phiếu",
                "Bạn có chắc chắn muốn xóa phiếu nhập tạm này không?",
                () => deleteOrder(navigate),
                "danger",
              )
            }
            onStartChecking={() =>
              openConfirm(
                "Bắt đầu kiểm kê",
                "Bắt đầu kiểm kê hàng hóa?",
                startChecking,
                "info",
              )
            }
            onReceiveGoods={() => {
              if (validateReceiveGoodsConfig()) {
                openConfirm(
                  "Xác nhận nhập kho",
                  "Xác nhận nhập kho? Tồn kho sẽ được cập nhật và không thể hoàn tác.",
                  () => receiveGoods(navigate),
                  "warning",
                );
              }
            }}
          />
        </div>
      )}

      {batchEditData && (
        <BatchEditorModal
          item={batchEditData}
          onSave={updateItemBatches}
          onClose={closeBatchEditor}
        />
      )}

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleRejectSubmit}
        isLoading={saving}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        variant={confirmModal.variant}
        loading={saving}
      />
    </div>
  );
}

export default CreatePurchaseOrder;
