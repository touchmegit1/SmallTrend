import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { PO_STATUS_CONFIG } from "../../utils/purchaseOrder";

function PurchaseOrderRecordsTable(props) {
  const { records = [], suppliers = [] } = props;
  const navigate = useNavigate();
  if (records.length === 0) {
    return (
      <tr>
        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
          Không có phiếu nhập nào
        </td>
      </tr>
    );
  }

  return records.map((record) => (
    <tr
      key={record.id}
      className="hover:bg-slate-50 cursor-pointer"
      onClick={() => navigate(`/inventory/purchase-orders/${record.id}`)}
    >
      <td className="px-4 py-3 text-sm font-mono text-blue-600">
        {record.po_number ||
          record.poNumber ||
          record.order_number ||
          record.orderNumber}
      </td>
      <td className="px-4 py-3 text-sm text-slate-900">
        {new Date(record.created_at).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3 text-sm text-slate-900">
        {suppliers.find((s) => s.id === record.supplier_id)?.code ||
          `NCC${String(record.supplier_id).padStart(4, "0")}`}
      </td>
      <td className="px-4 py-3 text-sm text-slate-900">
        {record.supplier_name}
      </td>
      <td className="px-4 py-3 text-sm text-slate-900 text-right">
        {Number(record.total_amount ?? 0).toLocaleString("vi-VN")}
      </td>
      <td className="px-4 py-3 text-center">
        {(() => {
          const cfg = PO_STATUS_CONFIG[record.status] || PO_STATUS_CONFIG.DRAFT;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${cfg.bg} ${cfg.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
              {cfg.label}
            </span>
          );
        })()}
      </td>
    </tr>
  ));
}

PurchaseOrderRecordsTable.propTypes = {
  records: PropTypes.arrayOf(PropTypes.object),
  suppliers: PropTypes.arrayOf(PropTypes.object),
};

export default PurchaseOrderRecordsTable;

