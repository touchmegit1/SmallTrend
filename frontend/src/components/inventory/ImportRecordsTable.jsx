import React from "react";

function ImportRecordsTable({ records, suppliers }) {
  if (records.length === 0) {
    return (
      <tr>
        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
          Không có phiếu nhập nào
        </td>
      </tr>
    );
  }

  return records.map((record) => (
    <tr key={record.id} className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 py-3 text-sm font-mono text-blue-600">
        {record.po_number}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {new Date(record.created_at).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {suppliers.find((s) => s.id === record.supplier_id)?.code ||
          `NCC${String(record.supplier_id).padStart(4, "0")}`}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {record.supplier_name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 text-right">
        {record.total_amount?.toLocaleString() || "0"}
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
          Đã nhập hàng
        </span>
      </td>
    </tr>
  ));
}

export default ImportRecordsTable;
