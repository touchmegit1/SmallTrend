import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePurchaseOrder } from "../../hooks/usePurchaseOrder";
import { PO_STATUS } from "../../utils/purchaseOrder";

import PurchaseHeader from "../../components/inventory/purchase/PurchaseHeader";
import ProductSearchBar from "../../components/inventory/purchase/ProductSearchBar";
import PurchaseItemTable from "../../components/inventory/purchase/PurchaseItemTable";
import SummaryPanel from "../../components/inventory/purchase/SummaryPanel";
import ActionButtons from "../../components/inventory/purchase/ActionButtons";
import RejectionModal from "../../components/ui/RejectionModal";
import GoodsReceiptTable from "../../components/inventory/purchase/GoodsReceiptTable";

function CreatePurchaseOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const {
    products,
    suppliers,
    locations,
    loading,
    saving,
    error,
    order,
    items,
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

  const handleRejectClick = () => {
    setShowRejectionModal(true);
  };

  const handleRejectSubmit = async (reason) => {
    const result = await rejectOrder(navigate, reason);
    if (result) {
      setShowRejectionModal(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <PurchaseHeader
          order={order}
          onBack={() => navigate("/inventory/purchase-orders")}
        />

        {isEditable && (
          <ProductSearchBar
            products={products}
            onAddProduct={addProduct}
            onImportProducts={importProducts}
          />
        )}

        {/* Bảng kiểm kê cho NV kho (trạng thái CHECKING) */}
        {isChecking ? (
          <GoodsReceiptTable
            items={items}
            receiptItems={receiptItems}
            onUpdateReceiptItem={updateReceiptItem}
          />
        ) : (
          <PurchaseItemTable
            items={items}
            isEditable={isEditable}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        )}
      </div>

      <div className="flex flex-col w-[380px] bg-white border-l border-slate-200 shrink-0 h-full">
        <SummaryPanel
          order={order}
          items={items}
          suppliers={suppliers}
          locations={locations}
          updateOrder={updateOrder}
          isEditable={isEditable}
          allowMetaEdit={isChecking}
          checkingFinancials={checkingFinancials}
        />

        <ActionButtons
          status={order.status}
          saving={saving}
          isEditMode={!!id}
          onSaveDraft={() => saveDraft(navigate)}
          onSubmitForApproval={() => submitForApproval(navigate)}
          onConfirm={() => confirmOrder(navigate)}
          onReject={handleRejectClick}
          onDelete={() => deleteOrder(navigate)}
          onStartChecking={() => startChecking()}
          onReceiveGoods={() => receiveGoods(navigate)}
        />
      </div>


      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleRejectSubmit}
        isLoading={saving}
      />
    </div>
  );
}

export default CreatePurchaseOrder;
