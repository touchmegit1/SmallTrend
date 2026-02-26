import React from "react";
import { useNavigate } from "react-router-dom";
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

function InventoryAudit() {
  const navigate = useNavigate();
  const {
    // Reference
    locations,
    loading,
    saving,
    error,

    // Session
    session,
    updateSession,
    filteredItems,
    stats,

    // UI State
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,

    // Item Actions
    updateActualQuantity,
    markAllAsMatched,

    // Reason Modal
    reasonModalItem,
    openReasonModal,
    closeReasonModal,
    saveReasonFromModal,

    // Actions
    saveDraft,
    confirmCount,
    cancelCount,
  } = useInventoryCount();

  // ─── Loading ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
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

  // ─── Error ───────────────────────────────────────────
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
    session?.status === IC_STATUS.DRAFT ||
    session?.status === IC_STATUS.COUNTING;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ─── Left Side: Counting Area ────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <InventoryCountHeader
          session={session}
          onBack={() => navigate("/inventory")}
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
          onConfirm={() => confirmCount(navigate)}
          onCancel={() => cancelCount(navigate)}
        />
      </div>

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

export default InventoryAudit;
