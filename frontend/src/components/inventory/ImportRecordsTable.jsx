import React from "react";

function ImportRecordsTable({ records, suppliers }) {
  if (records.length === 0) {
    return (
      <tr>
        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
          Không có phiếu nhập nào
        </td>
      </tr>
    );
  }

  return records.map((record) => (
    <tr key={record.id} className="hover:bg-gray-50 cursor-pointer">
      <td className="px-4 py-3">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-4 py-3">
        <svg className="w-5 h-5 text-gray-300 hover:text-yellow-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </td>
      <td className="px-4 py-3 text-sm font-mono text-blue-600">{record.po_number}</td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {new Date(record.created_at).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {suppliers.find(s => s.id === record.supplier_id)?.code || `NCC${String(record.supplier_id).padStart(4, "0")}`}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{record.supplier_name}</td>
      <td className="px-4 py-3 text-sm text-gray-900 text-right">{record.total_amount?.toLocaleString() || "0"}</td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
          Đã nhập hàng
        </span>
      </td>
    </tr>
  ));
}

export default ImportRecordsTable;
