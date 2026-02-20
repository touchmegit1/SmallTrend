import React from "react";

function RecentActivities({ stockMovements }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 mt-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Hoạt động gần đây</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã GD</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stockMovements.slice(0, 10).map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-900">
                  {movement.type}-{String(movement.id).padStart(3, "0")}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${movement.type === "IN" ? "bg-green-100 text-green-800" : movement.type === "OUT" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                    {movement.type === "IN" ? "Nhập" : movement.type === "OUT" ? "Xuất" : "Chuyển"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{movement.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(movement.created_at).toLocaleString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentActivities;
