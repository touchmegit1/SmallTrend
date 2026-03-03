import React from "react";

function AuditTable({ items, onActualStockChange }) {
  return items.map((item) => (
    <tr key={item.id} className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.stt}</td>
      <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.code}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
      <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.unit}</td>
      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.systemStock}</td>
      <td className="px-4 py-3 text-sm text-gray-900 text-right">
        <input
          type="number"
          value={item.actualStock === null ? "" : item.actualStock}
          onChange={(e) => onActualStockChange(item.id, e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      </td>
      <td className="px-4 py-3 text-sm text-right">
        <span className={`font-medium ${item.difference > 0 ? "text-green-600" : item.difference < 0 ? "text-red-600" : "text-gray-900"}`}>
          {item.actualStock !== null ? item.difference : "---"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-right">
        <span className={`font-medium ${item.valueDifference > 0 ? "text-green-600" : item.valueDifference < 0 ? "text-red-600" : "text-gray-900"}`}>
          {item.actualStock !== null ? item.valueDifference.toLocaleString() : "---"}
        </span>
      </td>
    </tr>
  ));
}

export default AuditTable;
