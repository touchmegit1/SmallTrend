import React from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrder } from "../../hooks/usePurchaseOrder";
import { PO_STATUS } from "../../utils/purchaseOrder";

// Purchase Order Components
import PurchaseHeader from "../../components/inventory/purchase/PurchaseHeader";
import ProductSearchBar from "../../components/inventory/purchase/ProductSearchBar";
import PurchaseItemTable from "../../components/inventory/purchase/PurchaseItemTable";
import BatchEditorModal from "../../components/inventory/purchase/BatchEditorModal";
import SummaryPanel from "../../components/inventory/purchase/SummaryPanel";
import ActionButtons from "../../components/inventory/purchase/ActionButtons";

function CreateImport() {
  const navigate = useNavigate();
  const {
    // Reference data
    products,
    suppliers,
    locations,
    filteredSuppliers,
    loading,
    saving,
    error,

    // Order state
    order,
    items,
    financials,

    // Supplier autocomplete
    supplierQuery,
    setSupplierQuery,
    selectSupplier,
    clearSupplier,

    // Order management
    updateOrder,
    addProduct,
    removeItem,
    updateItem,

    // Batch management
    batchEditData,
    openBatchEditor,
    closeBatchEditor,
    updateItemBatches,

    // Actions
    saveDraft,
    confirmOrder,
    cancelOrder,
  } = usePurchaseOrder();

  // ─── Loading State ─────────────────────────────────────
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

  // ─── Error State ───────────────────────────────────────
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

  const isEditable = order.status === PO_STATUS.DRAFT;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ─── Left Side: Products ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <PurchaseHeader
          order={order}
          onBack={() => navigate("/inventory/import")}
        />

        {/* Search Bar */}
        {isEditable && (
          <ProductSearchBar products={products} onAddProduct={addProduct} />
        )}

        {/* Items Table */}
        <PurchaseItemTable
          items={items}
          isEditable={isEditable}
          onUpdate={updateItem}
          onRemove={removeItem}
          onOpenBatch={openBatchEditor}
        />
      </div>

      {/* ─── Right Side: Summary + Actions ────────────────── */}
      <div className="flex flex-col shrink-0">
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
        />

        <ActionButtons
          status={order.status}
          saving={saving}
          onSaveDraft={() => saveDraft(navigate)}
          onConfirm={() => confirmOrder(navigate)}
          onCancel={() => cancelOrder(navigate)}
        />
      </div>

      {/* ─── Batch Editor Modal ───────────────────────────── */}
      {batchEditData && (
        <BatchEditorModal
          item={batchEditData}
          onSave={updateItemBatches}
          onClose={closeBatchEditor}
        />
      )}
    </div>
  );
}

export default CreateImport;
