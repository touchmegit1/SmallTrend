import React, { useState } from "react";
import {
  Plus,
  Search,
  ClipboardCheck,
  PackagePlus,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrderList } from "../../../hooks/inventory/purchase/usePurchaseOrderList";
import { useAuth } from "../../../context/AuthContext";
import { MANAGER_ROLES, hasAnyRole } from "../../../utils/rolePermissions";
import PurchaseOrderRecordsTable from "../../../components/inventory/purchase/PurchaseOrderRecordsTable";
import CustomSelect from "../../../components/common/CustomSelect";

function PurchaseOrderList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = hasAnyRole(user, MANAGER_ROLES);
  const { suppliers, filteredOrders, loading, searchQuery, setSearchQuery } =
    usePurchaseOrderList();

  // Tab state: 'ALL' (Quản lý nhập hàng) or 'AUDIT' (Kiểm kê hàng nhập)
  const [activeTab, setActiveTab] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- TAB: NHẬP HÀNG (QUẢN LÝ) ---
  const managementOrders = filteredOrders;
  const displayedManagementOrders =
    statusFilter === "ALL"
      ? managementOrders
      : managementOrders.filter((o) => o.status === statusFilter);

  // --- TAB: KIỂM KÊ (NHÂN VIÊN KHO) ---
  const auditOrders = filteredOrders.filter((o) =>
    ["CONFIRMED", "CHECKING"].includes(o.status),
  );

  // If we are in audit tab, and want to show ALL audit, we default it to 'ALL' (but inside auditOrders)
  const displayedAuditOrders =
    statusFilter === "ALL" || !["CONFIRMED", "CHECKING"].includes(statusFilter)
      ? auditOrders
      : auditOrders.filter((o) => o.status === statusFilter);

  const currentOrders =
    activeTab === "ALL" ? displayedManagementOrders : displayedAuditOrders;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => navigate("/inventory")}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500 shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PackagePlus size={20} className="text-indigo-600" />
                Nhập hàng &amp; Kiểm kê
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Quản lý phiếu yêu cầu nhập hàng và kiểm kê
              </p>
            </div>
          </div>

          {!isManager && (
            <button
              onClick={() => navigate("/inventory/purchase-orders/create")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition shadow-sm"
            >
              <Plus size={16} />
              Yêu cầu nhập hàng
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* TABS LỚN */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab("ALL");
                setStatusFilter("ALL");
              }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${
                activeTab === "ALL"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Tất cả phiếu nhập
            </button>
            <button
              onClick={() => {
                setActiveTab("AUDIT");
                setStatusFilter("ALL"); // Reset inside audit tab
              }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition flex items-center gap-2 ${
                activeTab === "AUDIT"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ClipboardCheck size={16} />
              Kiểm kê hàng nhập
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* SEARCH */}
            <div className="relative w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm theo mã phiếu nhập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50"
              />
            </div>

            {/* STATUS FILTERS DỰA TRÊN TAB LỚN */}
            <div className="w-48 text-left">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={
                  activeTab === "ALL"
                    ? [
                        { value: "ALL", label: "Tất cả" },
                        { value: "DRAFT", label: "Phiếu tạm" },
                        { value: "PENDING", label: "Chờ duyệt" },
                        { value: "REJECTED", label: "Từ chối" },
                        { value: "CONFIRMED", label: "Đã duyệt" },
                        { value: "CHECKING", label: "Đang kiểm kê" },
                        { value: "RECEIVED", label: "Đã nhập kho" },
                      ]
                    : [
                        { value: "ALL", label: "Tất cả" },
                        { value: "CONFIRMED", label: "Chờ kiểm" },
                        { value: "CHECKING", label: "Đang kiểm kê" },
                      ]
                }
                variant="status"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {currentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 mt-10">
            <ClipboardCheck className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-sm">
              Không có phiếu nhập nào
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Mã phiếu
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Thời gian tạo
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Mã NCC
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Nhà Cung Cấp
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Tổng G.Trị
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <PurchaseOrderRecordsTable
                  records={currentOrders}
                  suppliers={suppliers}
                />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PurchaseOrderList;
