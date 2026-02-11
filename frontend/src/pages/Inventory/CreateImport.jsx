import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Trash2, Check, X, Grid, Plus, Eye, Printer, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  getSuppliers,
  getPurchaseOrders,
  createPurchaseOrder,
  createPurchaseOrderItem,
  updateProductStock,
} from "../../services/inventoryService";

function CreateImport() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");

  const [importForm, setImportForm] = useState({
    po_number: "",
    supplier_id: null,
    supplier_name: "",
    creator_id: 1,
    status: "COMPLETED",
    created_at: new Date().toISOString(),
    notes: "",
  });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  const [currentProducts, setCurrentProducts] = useState([]);

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
          ? parseInt(lastPO.po_number.replace("PN", "")) + 1
          : 1;
        setImportForm((prev) => ({
          ...prev,
          po_number: `PN${String(nextNumber).padStart(6, "0")}`,
        }));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = (product) => {
    const existingProduct = currentProducts.find(p => p.product_id === product.id);
    
    if (existingProduct) {
      setCurrentProducts(currentProducts.map(p => 
        p.product_id === product.id 
          ? { ...p, quantity: p.quantity + 1, total_cost: (p.quantity + 1) * p.unit_cost }
          : p
      ));
    } else {
      const newProduct = {
        id: Date.now(),
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        quantity: 1,
        unit_cost: product.purchase_price,
        unit: product.unit,
        total_cost: product.purchase_price,
      };
      setCurrentProducts([...currentProducts, newProduct]);
    }
  };

  const handleRemoveProduct = (id) => {
    setCurrentProducts(currentProducts.filter((p) => p.id !== id));
  };

  const handleUpdateQuantity = (id, quantity) => {
    setCurrentProducts(currentProducts.map(p => 
      p.id === id 
        ? { ...p, quantity: parseInt(quantity) || 0, total_cost: (parseInt(quantity) || 0) * p.unit_cost }
        : p
    ));
  };

  const handleSaveImport = async () => {
    if (!importForm.supplier_id || currentProducts.length === 0) {
      alert("Vui lòng chọn nhà cung cấp và thêm sản phẩm!");
      return;
    }

    setSaving(true);
    try {
      const totalAmount = currentProducts.reduce((sum, p) => sum + p.total_cost, 0);

      const orderData = {
        po_number: importForm.po_number,
        supplier_id: importForm.supplier_id,
        supplier_name: importForm.supplier_name,
        creator_id: importForm.creator_id,
        total_amount: totalAmount,
        status: "COMPLETED",
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

        const currentProduct = products.find(p => p.id === product.product_id);
        if (currentProduct) {
          await updateProductStock(product.product_id, currentProduct.stock_quantity + product.quantity);
        }
      }

      alert("Đã lưu phiếu nhập thành công!");
      navigate("/inventory/import");
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra!");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSupplier = (supplier) => {
    setImportForm(prev => ({
      ...prev,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
    }));
    setShowSupplierModal(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const totalAmount = currentProducts.reduce((sum, p) => sum + p.total_cost, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/inventory/import")}
              className="p-2 hover:bg-gray-100 rounded"
            >
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

        {/* Products Table */}
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
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">Chưa có sản phẩm nào trong phiếu nhập</p>
                      <p className="text-gray-400 text-xs mt-1">Tìm kiếm và click vào sản phẩm bên dưới để thêm</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{product.sku}</td>
                    <td className="px-4 py-3 text-sm">{product.name}</td>
                    <td className="px-4 py-3 text-sm">{product.unit}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleUpdateQuantity(product.id, e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{product.unit_cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">0</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{product.total_cost.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Available Products List */}
          {searchProduct && (
            <div className="bg-white border-t-2 border-gray-300">
              <div className="px-6 py-3 bg-gray-100 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Sản phẩm có sẵn</h3>
              </div>
              <div className="max-h-64 overflow-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className="px-6 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-blue-600">{product.sku}</span>
                        <span className="text-sm text-gray-900">{product.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{product.unit}</span>
                      <span className="text-sm font-semibold text-gray-900">{product.purchase_price.toLocaleString()}đ</span>
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">
                    Không tìm thấy sản phẩm
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mã phiếu nhập</span>
              <input
                type="text"
                value={importForm.po_number}
                disabled
                className="text-right font-semibold text-gray-900 bg-transparent border-none focus:outline-none w-32"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Trạng thái</span>
              <select className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 border-none">
                <option>Phiếu tạm</option>
                <option>Đã nhập hàng</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng tiền hàng</span>
              <span className="font-semibold text-gray-900">{currentProducts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giảm giá</span>
              <input
                type="number"
                defaultValue="0"
                className="text-right font-semibold text-gray-900 bg-transparent border-none focus:outline-none w-20"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cần trả nhà cung cấp</span>
              <span className="font-semibold text-blue-600">{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhà cung cấp
            </label>
            <input
              type="text"
              value={importForm.supplier_name}
              onChange={(e) =>
                setImportForm({ ...importForm, supplier_name: e.target.value })
              }
              placeholder="Nhập tên nhà cung cấp"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={importForm.notes}
              onChange={(e) =>
                setImportForm({ ...importForm, notes: e.target.value })
              }
              placeholder="Ghi chú"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2 mb-3">
            <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" />
              Lưu tạm
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Grid className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={handleSaveImport}
            disabled={saving || !importForm.supplier_name || currentProducts.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            {saving ? "Đang lưu..." : "Hoàn thành"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateImport;
