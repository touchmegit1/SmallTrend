import React, { useState, useEffect } from "react";
import { Plus, Save, Trash2, Package } from "lucide-react";
import {
  getProducts,
  getSuppliers,
  getPurchaseOrders,
  createPurchaseOrder,
  createPurchaseOrderItem,
} from "../../services/inventoryService";

function ImportInventory() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [importRecords, setImportRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [importForm, setImportForm] = useState({
    po_number: "",
    supplier_id: "",
    creator_id: 4,
    status: "PENDING",
    created_at: new Date().toISOString().split("T")[0],
  });

  const [currentProducts, setCurrentProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    product_id: "",
    quantity: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersData, productsData, ordersData] = await Promise.all([
          getSuppliers(),
          getProducts(),
          getPurchaseOrders(),
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);

        const lastPO = ordersData[ordersData.length - 1];
        const nextNumber = lastPO
          ? parseInt(lastPO.po_number.split("-")[2]) + 1
          : 1;
        setImportForm((prev) => ({
          ...prev,
          po_number: `PO-2024-${String(nextNumber).padStart(3, "0")}`,
        }));

        const records = ordersData.map((order) => {
          const supplier = suppliersData.find((s) => s.id === order.supplier_id);
          return {
            ...order,
            supplier_name: supplier?.name || "Unknown",
          };
        });
        setImportRecords(records.reverse());
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = () => {
    if (!productForm.product_id || !productForm.quantity) {
      alert("Vui lòng chọn sản phẩm và nhập số lượng!");
      return;
    }

    const selectedProduct = products.find(
      (p) => p.id === parseInt(productForm.product_id)
    );

    const newProduct = {
      id: Date.now(),
      product_id: selectedProduct.id,
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      quantity: parseInt(productForm.quantity),
      unit_cost: selectedProduct.purchase_price,
      unit: selectedProduct.unit,
      total_cost: parseInt(productForm.quantity) * selectedProduct.purchase_price,
    };

    setCurrentProducts([...currentProducts, newProduct]);
    setProductForm({ product_id: "", quantity: "" });
  };

  const handleRemoveProduct = (id) => {
    setCurrentProducts(currentProducts.filter((p) => p.id !== id));
  };

  const handleSaveImport = async () => {
    if (!importForm.supplier_id || currentProducts.length === 0) {
      alert("Vui lòng chọn nhà cung cấp và thêm sản phẩm!");
      return;
    }

    setSaving(true);
    try {
      const totalAmount = currentProducts.reduce((sum, p) => sum + p.total_cost, 0);
      const supplierName = suppliers.find(
        (s) => s.id === parseInt(importForm.supplier_id)
      ).name;

      const orderData = {
        po_number: importForm.po_number,
        supplier_id: parseInt(importForm.supplier_id),
        creator_id: importForm.creator_id,
        total_amount: totalAmount,
        status: importForm.status,
        created_at: new Date().toISOString(),
      };

      const newOrder = await createPurchaseOrder(orderData);

      for (const product of currentProducts) {
        await createPurchaseOrderItem({
          purchase_order_id: newOrder.id,
          product_id: product.product_id,
          quantity: product.quantity,
          unit_cost: product.unit_cost,
          total_cost: product.total_cost,
        });
      }

      const newRecord = {
        ...newOrder,
        supplier_name: supplierName,
      };

      setImportRecords([newRecord, ...importRecords]);

      const nextNumber = parseInt(importForm.po_number.split("-")[2]) + 1;
      setImportForm({
        po_number: `PO-2024-${String(nextNumber).padStart(3, "0")}`,
        supplier_id: "",
        creator_id: 4,
        status: "PENDING",
        created_at: new Date().toISOString().split("T")[0],
      });
      setCurrentProducts([]);

      alert("Đã lưu phiếu nhập thành công!");
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Nhập kho</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tạo phiếu nhập hàng từ nhà cung cấp
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Tạo phiếu nhập mới
          </h2>
        </div>

        <div className="p-6">
          {/* Form Fields */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã phiếu nhập
              </label>
              <input
                type="text"
                value={importForm.po_number}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày nhập
              </label>
              <input
                type="date"
                value={importForm.created_at}
                onChange={(e) =>
                  setImportForm({ ...importForm, created_at: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <select
                value={importForm.supplier_id}
                onChange={(e) =>
                  setImportForm({ ...importForm, supplier_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Product Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Thêm sản phẩm
            </h3>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <select
                  value={productForm.product_id}
                  onChange={(e) =>
                    setProductForm({ ...productForm, product_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="number"
                  value={productForm.quantity}
                  onChange={(e) =>
                    setProductForm({ ...productForm, quantity: e.target.value })
                  }
                  min="1"
                  placeholder="Số lượng"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleAddProduct}
                className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm sản phẩm
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên sản phẩm
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Đơn giá
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thành tiền
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      Chưa có sản phẩm nào. Chọn sản phẩm và nhấn "Thêm"
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {product.quantity} {product.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {product.unit_cost.toLocaleString()}đ
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        {product.total_cost.toLocaleString()}đ
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-lg font-semibold text-gray-900">
              Tổng tiền:{" "}
              <span className="text-blue-600">
                {currentProducts
                  .reduce((sum, p) => sum + p.total_cost, 0)
                  .toLocaleString()}
                đ
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentProducts([]);
                  setImportForm({ ...importForm, supplier_id: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveImport}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Đang lưu..." : "Lưu phiếu nhập"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Records */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Phiếu nhập gần đây
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mã phiếu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ngày nhập
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nhà cung cấp
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {importRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">
                    {record.po_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(record.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.supplier_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {record.total_amount.toLocaleString()}đ
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        record.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : record.status === "APPROVED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {record.status === "COMPLETED"
                        ? "Hoàn thành"
                        : record.status === "APPROVED"
                        ? "Đã duyệt"
                        : "Chờ xử lý"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ImportInventory;
