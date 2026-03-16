import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Clock3 } from "lucide-react";
import { usePurchaseOrder } from "../../hooks/usePurchaseOrder";
import { PO_STATUS, PO_STATUS_CONFIG } from "../../utils/purchaseOrder";

import PurchaseHeader from "../../components/inventory/purchase/PurchaseHeader";
import ProductSearchBar from "../../components/inventory/purchase/ProductSearchBar";
import PurchaseItemTable from "../../components/inventory/purchase/PurchaseItemTable";
import SummaryPanel from "../../components/inventory/purchase/SummaryPanel";
import ActionButtons from "../../components/inventory/purchase/ActionButtons";
import RejectionModal from "../../components/ui/RejectionModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import GoodsReceiptTable from "../../components/inventory/purchase/GoodsReceiptTable";

function CreatePurchaseOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [confirmState, setConfirmState] = useState(null);

  const {
    products,
    suppliers,
    locations,
    loading,
    saving,
    error,
    order,
    items,
    supplierQuery,
    setSupplierQuery,
    updateOrder,
    addProduct,
    importProducts,
    removeItem,
    updateItem,
    receiptItems,
    updateReceiptItem,
    checkingFinancials,
    saveDraft,
    submitForApproval,
    confirmOrder,
    startChecking,
    receiveGoods,
    closeShortage,
    requestSupplierSupplement,
    rejectOrder,
    deleteOrder,
  } = usePurchaseOrder(id || null);

  const confirmConfigs = {
    confirmOrder: {
      title: "Duyệt phiếu nhập",
      message: "Xác nhận duyệt phiếu nhập? Phiếu sẽ chuyển cho NV kho kiểm kê.",
      confirmText: "Duyệt phiếu",
      variant: "info",
    },
    startChecking: {
      title: "Bắt đầu kiểm kê",
      message: "Xác nhận bắt đầu kiểm kê hàng hóa?",
      confirmText: "Bắt đầu",
      variant: "info",
    },
    receiveGoods: {
      title: "Xác nhận nhập kho",
      message:
        "Tồn kho sẽ được cập nhật và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?",
      confirmText: "Nhập kho",
      variant: "warning",
    },
    closeShortage: {
      title: "Chốt thiếu hàng",
      message:
        "Xác nhận chốt thiếu và cập nhật tồn kho theo số thực nhận hiện tại?",
      confirmText: "Chốt thiếu",
      variant: "warning",
    },
    requestSupplement: {
      title: "Yêu cầu NCC giao bù",
      message: "Xác nhận chuyển phiếu sang trạng thái chờ nhà cung cấp giao bù?",
      confirmText: "Yêu cầu giao bù",
      variant: "info",
    },
    deleteOrder: {
      title: "Xóa phiếu nháp",
      message: "Bạn có chắc chắn muốn xóa phiếu nhập tạm này không?",
      confirmText: "Xóa phiếu",
      variant: "danger",
    },
  };

  const openConfirm = (action) => setConfirmState(action);
  const closeConfirm = () => setConfirmState(null);

  const executeConfirmedAction = async () => {
    if (!confirmState) return;

    const actionMap = {
      confirmOrder: () => confirmOrder(navigate),
      startChecking,
      receiveGoods: () => receiveGoods(navigate),
      closeShortage,
      requestSupplement: requestSupplierSupplement,
      deleteOrder: () => deleteOrder(navigate),
    };

    const action = actionMap[confirmState];
    if (!action) return;

    const result = await action();
    if (result) {
      closeConfirm();
    }
  };

  const activeConfirmConfig = confirmState ? confirmConfigs[confirmState] : null;

  const handleSupplierInputChange = (value) => {
    setSupplierQuery(value);
  };

  const handleSupplierSelect = (value) => {
    setSupplierQuery(value);
  };

  const handleLocationChange = (value) => {
    updateOrder("location_id", value ? Number.parseInt(value, 10) : null);
  };

  const handleRejectClick = () => {
    setShowRejectionModal(true);
  };

  const handleRejectSubmit = async (reason) => {
    const result = await rejectOrder(navigate, reason);
    if (result) {
      setShowRejectionModal(false);
    }
  };

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
            onClick={() => globalThis.location.reload()}
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
  const isShortagePendingApproval =
    order.status === PO_STATUS.SHORTAGE_PENDING_APPROVAL;
  const isSupplierSupplementPending =
    order.status === PO_STATUS.SUPPLIER_SUPPLEMENT_PENDING;
  const isReceived = order.status === PO_STATUS.RECEIVED;
  const isReceiptView =
    isChecking || isReceived || isShortagePendingApproval || isSupplierSupplementPending;
  const statusCfg = PO_STATUS_CONFIG[order.status] || PO_STATUS_CONFIG.DRAFT;

  const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  let bottomHint = "";
  if (isEditable) {
    bottomHint = "Thêm sản phẩm để bắt đầu";
  } else if (order.status === PO_STATUS.PENDING) {
    bottomHint = "Phiếu đang chờ duyệt";
  } else if (order.status === PO_STATUS.CONFIRMED) {
    bottomHint = "Đã duyệt · Chờ kiểm kê";
  } else if (isReceived) {
    bottomHint = "Phiếu đã nhập kho";
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <PurchaseHeader
          order={order}
          onBack={() => navigate("/inventory/purchase-orders")}
        />

        {isReceiptView ? (
          <GoodsReceiptTable
            items={items}
            receiptItems={receiptItems}
            onUpdateReceiptItem={updateReceiptItem}
            isReadOnly={!isChecking}
          />
        ) : (
          <div className="flex-1 overflow-auto px-6 py-5">
            <div className="max-w-[1300px] mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                {isEditable && (
                  <div className="mb-3 text-xs text-slate-500">
                    Yêu cầu nhập hàng · thêm sản phẩm và gửi duyệt
                  </div>
                )}
                {order.status === PO_STATUS.PENDING && (
                  <div className="mb-3 text-xs text-amber-600">
                    Phiếu đang ở trạng thái chờ duyệt
                  </div>
                )}
                {order.status === PO_STATUS.CONFIRMED && (
                  <div className="mb-3 text-xs text-blue-600">
                    Phiếu đã duyệt · chờ bắt đầu kiểm kê
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Box size={16} />
                    </div>
                    <span className="font-mono text-base font-semibold text-indigo-600 shrink-0">
                      {order.po_number || "—"}
                    </span>
                    <span className="w-px h-5 bg-slate-200 shrink-0" />
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-xs text-slate-500 shrink-0">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={12} />
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("vi-VN")
                        : "---"}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                      {items.length} sản phẩm
                    </span>
                  </div>
                </div>
              </div>

              {isEditable && (
                <ProductSearchBar
                  products={products}
                  onAddProduct={addProduct}
                  onImportProducts={importProducts}
                />
              )}

              <PurchaseItemTable
                items={items}
                isEditable={isEditable}
                onUpdate={updateItem}
                onRemove={removeItem}
                totalQty={totalQty}
              />

              <ActionButtons
                status={order.status}
                saving={saving}
                isEditMode={!!id}
                layout="inline"
                footerHint={bottomHint}
                onSaveDraft={() => saveDraft(navigate)}
                onSubmitForApproval={() => submitForApproval(navigate)}
                onConfirm={() => openConfirm("confirmOrder")}
                onReject={handleRejectClick}
                onDelete={() => openConfirm("deleteOrder")}
                onStartChecking={() => openConfirm("startChecking")}
                onReceiveGoods={() => openConfirm("receiveGoods")}
                onCloseShortage={() => openConfirm("closeShortage")}
                onRequestSupplement={() => openConfirm("requestSupplement")}
              />
            </div>
          </div>
        )}
      </div>

      {isReceiptView && (
        <div className="flex flex-col w-[340px] xl:w-[360px] bg-white border-l border-slate-200 shrink-0 h-full">
          <SummaryPanel
            order={order}
            items={items}
            suppliers={suppliers}
            locations={locations}
            supplierQuery={supplierQuery}
            onSupplierQueryChange={handleSupplierInputChange}
            onSupplierSelect={handleSupplierSelect}
            onLocationChange={handleLocationChange}
            updateOrder={updateOrder}
            isEditable={isEditable}
            allowMetaEdit={isChecking}
            checkingFinancials={checkingFinancials}
          />

          <div className="mt-0 -translate-y-2">
            <ActionButtons
              status={order.status}
              saving={saving}
              isEditMode={!!id}
              onSaveDraft={() => saveDraft(navigate)}
              onSubmitForApproval={() => submitForApproval(navigate)}
              onConfirm={() => openConfirm("confirmOrder")}
              onReject={handleRejectClick}
              onDelete={() => openConfirm("deleteOrder")}
              onStartChecking={() => openConfirm("startChecking")}
              onReceiveGoods={() => openConfirm("receiveGoods")}
              onCloseShortage={() => openConfirm("closeShortage")}
              onRequestSupplement={() => openConfirm("requestSupplement")}
            />
          </div>
        </div>
      )}

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleRejectSubmit}
        isLoading={saving}
      />

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
    </div>
  );
}

export default CreatePurchaseOrder;
