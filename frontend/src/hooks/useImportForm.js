import { useState, useEffect } from "react";
import { getProducts, getSuppliers, getPurchaseOrders, createPurchaseOrder, createPurchaseOrderItem, updateProductStock } from "../services/inventoryService";
import { generatePOCode } from "../utils/purchaseOrder";

export function useImportForm() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [importForm, setImportForm] = useState({
    po_number: "",
    supplier_id: null,
    supplier_name: "",
    creator_id: 1,
    status: "COMPLETED",
    created_at: new Date().toISOString(),
    notes: "",
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

        const code = generatePOCode(ordersData);
        setImportForm((prev) => ({ ...prev, po_number: code }));
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
        p.product_id === product.id ? { ...p, quantity: p.quantity + 1, total_cost: (p.quantity + 1) * p.unit_cost } : p
      ));
    } else {
      setCurrentProducts([...currentProducts, {
        id: Date.now(),
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        quantity: 1,
        unit_cost: product.purchase_price,
        unit: product.unit,
        total_cost: product.purchase_price,
      }]);
    }
  };

  const handleUpdateQuantity = (id, quantity) => {
    setCurrentProducts(currentProducts.map(p => 
      p.id === id ? { ...p, quantity: parseInt(quantity) || 0, total_cost: (parseInt(quantity) || 0) * p.unit_cost } : p
    ));
  };

  const handleSaveImport = async (navigate) => {
    if (!importForm.supplier_name || currentProducts.length === 0) {
      alert("Vui lòng nhập nhà cung cấp và thêm sản phẩm!");
      return;
    }

    setSaving(true);
    try {
      const totalAmount = currentProducts.reduce((sum, p) => sum + p.total_cost, 0);
      const newOrder = await createPurchaseOrder({
        ...importForm,
        total_amount: totalAmount,
        status: "COMPLETED",
        created_at: new Date().toISOString(),
      });

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

  const totalAmount = currentProducts.reduce((sum, p) => sum + p.total_cost, 0);

  return {
    suppliers,
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
  };
}
