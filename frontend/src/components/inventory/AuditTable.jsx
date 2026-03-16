import React from "react";

const getDiffClass = (value) => {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-slate-900";
};

function AuditTable({ items, onActualStockChange }) {
  return items.map((item) => (
    <tr key={item.id} className="hover:bg-slate-50">
      <td className="px-4 py-3 text-sm text-slate-900 text-center">{item.stt}</td>
      <td className="px-4 py-3 text-sm font-mono text-slate-900">{item.code}</td>
      <td className="px-4 py-3 text-sm text-slate-900">{item.name}</td>
      <td className="px-4 py-3 text-sm text-slate-600 text-center">{item.unit}</td>
      <td className="px-4 py-3 text-sm text-slate-900 text-right">{item.systemStock}</td>
      <td className="px-4 py-3 text-sm text-slate-900 text-right">
        <input
          type="number"
          value={item.actualStock === null ? "" : item.actualStock}
          onChange={(e) => onActualStockChange(item.id, e.target.value)}
          className="w-full px-2 py-1 border border-slate-300 rounded text-right focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      </td>
      <td className="px-4 py-3 text-sm text-right">
        <span className={`font-medium ${getDiffClass(item.difference)}`}>
          {item.actualStock !== null ? item.difference : "---"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-right">
        <span className={`font-medium ${getDiffClass(item.valueDifference)}`}>
          {item.actualStock !== null ? item.valueDifference.toLocaleString() : "---"}
        </span>
      </td>
    </tr>
  ));
}

export default AuditTable;

