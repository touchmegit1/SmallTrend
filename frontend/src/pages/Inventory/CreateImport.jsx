import React, { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useImportForm } from "../../hooks/useImportForm";
import ImportProductsTable from "../../components/inventory/ImportProductsTable";
import ProductSearchList from "../../components/inventory/ProductSearchList";
import ImportSidebar from "../../components/inventory/ImportSidebar";

function CreateImport() {
  const navigate = useNavigate();
  const [searchProduct, setSearchProduct] = useState("");
  const {
    products,
    loading,
    saving,
    currentProducts,
    importForm,
    setImportForm,
    totalAmount,
    handleAddProduct,
    handleUpdateQuantity,
    handleSaveImport,
  } = useImportForm();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/inventory/import")} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Nhập hàng</h1>
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm hàng hóa theo mã hoặc tên (F3)"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ĐVT</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giảm giá</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <ImportProductsTable currentProducts={currentProducts} onUpdateQuantity={handleUpdateQuantity} />
            </tbody>
          </table>
          <ProductSearchList products={products} searchQuery={searchProduct} onAddProduct={handleAddProduct} />
        </div>
      </div>

      <ImportSidebar
        importForm={importForm}
        setImportForm={setImportForm}
        currentProducts={currentProducts}
        totalAmount={totalAmount}
        onSave={() => handleSaveImport(navigate)}
        saving={saving}
      />
    </div>
  );
}

export default CreateImport;
