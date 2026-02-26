import React from "react";

function ExpiringBatchesTable({ batches, products }) {
  const expiringBatches = batches.filter((batch) => {
    if (!batch.expiry_date) return false;
    const daysUntilExpiry = Math.ceil((new Date(batch.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  const expiredBatches = batches.filter((batch) => {
    if (!batch.expiry_date) return false;
    return new Date(batch.expiry_date) < new Date();
  });

  const allBatches = [...expiredBatches, ...expiringBatches];

  if (allBatches.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 mt-6">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Cảnh báo hạn sử dụng</h2>
        <span className="text-sm text-red-600 font-medium">{allBatches.length} lô hàng</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã lô</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allBatches.map((batch) => {
              const product = products.find((p) => p.id === batch.product_id);
              const daysUntilExpiry = Math.ceil((new Date(batch.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
              const isExpired = daysUntilExpiry < 0;
              return (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{batch.batch_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{product?.name || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{batch.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(batch.expiry_date).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${isExpired ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {isExpired ? "Đã hết hạn" : `Còn ${daysUntilExpiry} ngày`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpiringBatchesTable;
