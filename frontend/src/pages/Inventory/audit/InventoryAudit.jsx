import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventoryCount } from "../../../hooks/inventory/count/useInventoryCount";
import { IC_STATUS } from "../../../utils/inventoryCount";

import InventoryCountHeader from "../../../components/inventory/count/InventoryCountHeader";
import InventoryProgressBar from "../../../components/inventory/count/InventoryProgressBar";
import CountFilterBar from "../../../components/inventory/count/CountFilterBar";
import InventoryCountTable from "../../../components/inventory/count/InventoryCountTable";
import DifferenceReasonModal from "../../../components/inventory/count/DifferenceReasonModal";
import CountSummaryPanel from "../../../components/inventory/count/CountSummaryPanel";
import CountActionButtons from "../../../components/inventory/count/CountActionButtons";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

function InventoryAudit() {
  const navigate = useNavigate();
  const {
    locations,
    loading,
    saving,
    error,
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
    cancelCount,
  } = useInventoryCount();

  const [confirmState, setConfirmState] = useState(null);

  const confirmConfigs = {
    confirmCount: {
      title: "Xác nhận kiểm kho",
      message: "Xác nhận hoàn tất kiểm kho và cập nhật tồn kho theo số thực tế?",
      confirmText: "Xác nhận",
      variant: "warning",
    },
    cancelCount: {
      title: "Hủy phiên kiểm kho",
      message: "Xác nhận hủy phiên kiểm kho này?",
      confirmText: "Hủy phiên",
      variant: "danger",
    },
  };

  const closeConfirm = () => setConfirmState(null);

  const executeConfirmedAction = async () => {
    if (!confirmState) return;

    if (confirmState === "confirmCount") {
      await confirmCount(navigate);
    } else if (confirmState === "cancelCount") {
      await cancelCount(navigate);
    }

    closeConfirm();
  };

  const activeConfirmConfig = confirmState ? confirmConfigs[confirmState] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Đang tải dữ liệu kiểm kho...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
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
    session?.status === IC_STATUS.DRAFT ||
    session?.status === IC_STATUS.COUNTING;

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col xl:flex-row">
      <div className="flex-1 flex flex-col min-w-0">
        <InventoryCountHeader
          session={session}
          onBack={() => navigate("/inventory")}
        />

        <InventoryProgressBar stats={stats} />

        <CountFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          isEditable={isEditable}
          onMarkAllMatched={markAllAsMatched}
        />

        <InventoryCountTable
          items={filteredItems}
          isEditable={isEditable}
          onActualChange={updateActualQuantity}
          onOpenReason={openReasonModal}
        />
      </div>

      <div className="flex flex-col w-full xl:w-80 xl:min-w-[320px] shrink-0 border-t xl:border-t-0 xl:border-l border-slate-200 bg-white">
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
          onConfirm={() => setConfirmState("confirmCount")}
          onCancel={() => setConfirmState("cancelCount")}
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

export default InventoryAudit;
