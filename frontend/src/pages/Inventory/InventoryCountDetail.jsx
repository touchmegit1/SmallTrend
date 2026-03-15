import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInventoryCount } from "../../hooks/useInventoryCount";
import { IC_STATUS } from "../../utils/inventoryCount";

// Count Components
import InventoryCountHeader from "../../components/inventory/count/InventoryCountHeader";
import InventoryProgressBar from "../../components/inventory/count/InventoryProgressBar";
import CountFilterBar from "../../components/inventory/count/CountFilterBar";
import InventoryCountTable from "../../components/inventory/count/InventoryCountTable";
import DifferenceReasonModal from "../../components/inventory/count/DifferenceReasonModal";
import CountSummaryPanel from "../../components/inventory/count/CountSummaryPanel";
import CountActionButtons from "../../components/inventory/count/CountActionButtons";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function InventoryCountDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // "create" or a voucher ID

  const {
    locations,
    loading,
    saving,
    error,
    isCreateMode,

    session,
    updateSession,
    filteredItems,
    stats,

    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,

    updateActualQuantity,
    markAllAsMatched,

    reasonModalItem,
    openReasonModal,
    closeReasonModal,
    saveReasonFromModal,

    saveDraft,
    confirmCount,
    submitForApproval,
    approveCount,
    rejectCount,
    cancelCount,
  } = useInventoryCount(id);

  const [confirmState, setConfirmState] = useState(null);

  const confirmConfigs = {
    confirmCount: {
      title: "Xác nhận kiểm kho",
      message: "Xác nhận hoàn tất kiểm kho và cập nhật tồn kho theo số thực tế?",
      confirmText: "Xác nhận",
      variant: "warning",
    },
    submitForApproval: {
      title: "Gửi duyệt phiếu",
      message: `Gửi phiếu kiểm kho ${session?.code || ""} cho Manager duyệt?`,
      confirmText: "Gửi duyệt",
      variant: "info",
    },
    approveCount: {
      title: "Duyệt phiếu kiểm kho",
      message: "Duyệt phiếu kiểm kho và áp dụng kết quả tồn kho?",
      confirmText: "Duyệt phiếu",
      variant: "warning",
    },
    cancelCount: {
      title: "Hủy phiên kiểm kho",
      message: "Xác nhận hủy phiên kiểm kho này?",
      confirmText: "Hủy phiên",
      variant: "danger",
    },
  };

  const openConfirm = (action) => setConfirmState(action);
  const closeConfirm = () => setConfirmState(null);

  const executeConfirmedAction = async () => {
    if (!confirmState) return;

    if (confirmState === "confirmCount") {
      await confirmCount(navigate);
    } else if (confirmState === "submitForApproval") {
      await submitForApproval(navigate);
    } else if (confirmState === "approveCount") {
      await approveCount(navigate);
    } else if (confirmState === "cancelCount") {
      await cancelCount(navigate);
    }

    closeConfirm();
  };

  const activeConfirmConfig = confirmState ? confirmConfigs[confirmState] : null;

  // ─── Loading ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            {isCreateMode
              ? "Đang tạo phiếu kiểm kho..."
              : "Đang tải phiếu kiểm kho..."}
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Lỗi tải dữ liệu</p>
          <p className="text-sm text-slate-500 mb-3">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate("/inventory-counts")}
              className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Quay lại danh sách
            </button>
            <button
              onClick={() => globalThis.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEditable =
    session?.status === IC_STATUS.DRAFT ||
    session?.status === IC_STATUS.COUNTING;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ─── Left Side: Counting Area ────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <InventoryCountHeader
          session={session}
          onBack={() => navigate("/inventory-counts")}
        />

        {/* Progress */}
        <InventoryProgressBar stats={stats} />

        {/* Search + Filter Tabs */}
        <CountFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          isEditable={isEditable}
          onMarkAllMatched={markAllAsMatched}
        />

        {/* Items Table */}
        <InventoryCountTable
          items={filteredItems}
          isEditable={isEditable}
          onActualChange={updateActualQuantity}
          onOpenReason={openReasonModal}
        />
      </div>

      {/* ─── Right Side: Summary + Actions ───────────── */}
      <div className="flex flex-col shrink-0">
        <CountSummaryPanel
          session={session}
          stats={stats}
          locations={locations}
          updateSession={updateSession}
        />

        <CountActionButtons
          status={session?.status}
          saving={saving}
          onSaveDraft={() => saveDraft(navigate)}
          onConfirm={() => openConfirm("confirmCount")}
          onSubmitForApproval={() => openConfirm("submitForApproval")}
          onApprove={() => openConfirm("approveCount")}
          onReject={(reason) => rejectCount(reason, navigate)}
          onCancel={() => openConfirm("cancelCount")}
        />
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

      {/* ─── Reason Modal ────────────────────────────── */}
      {reasonModalItem && (
        <DifferenceReasonModal
          item={reasonModalItem}
          onSave={saveReasonFromModal}
          onClose={closeReasonModal}
        />
      )}

    </div>
  );
}

export default InventoryCountDetail;
