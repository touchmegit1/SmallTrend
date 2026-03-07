import { useState, useEffect, useRef } from "react";
import TopBar from "./TopBar";
import EmptyCart from "./EmptyCart";
import Cart from "./Cart";
import PaymentPanel from "./PaymentPanel";
import PaymentModal from "./PaymentModal";
import QRScanner from "./QRScanner";
import Invoice from "./Invoice";
import posService from "../../services/posService";
import api from "../../config/axiosConfig";

export default function POS() {
  const searchInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('posOrders');
    return saved ? JSON.parse(saved) : [{ id: 1, cart: [], customer: null, usePoints: false }];
  });
  const [activeOrderId, setActiveOrderId] = useState(() => {
    const saved = localStorage.getItem('activeOrderId');
    return saved ? parseInt(saved) : 1;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('posShortcuts');
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      payment1: parsed?.payment1 === 'F9' ? 'F10' : (parsed?.payment1 || 'F10'),
      printInvoice: parsed?.printInvoice || 'F9',
      comboFocus: parsed?.comboFocus || 'F11',
      newOrder: parsed?.newOrder || 'F8',
      deleteOrder: parsed?.deleteOrder || 'Delete'
    };
  });

  const activeOrder = orders.find(order => order.id === activeOrderId) || { id: activeOrderId, cart: [], customer: null, usePoints: false };

  // Fetch products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  // Auto focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Reset selected index when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm)) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      ).sort((a, b) => {
        const term = searchTerm.toLowerCase();
        const aStarts = a.name.toLowerCase().startsWith(term) || (a.barcode && a.barcode.toLowerCase().startsWith(term)) || (a.sku && a.sku.toLowerCase().startsWith(term));
        const bStarts = b.name.toLowerCase().startsWith(term) || (b.barcode && b.barcode.toLowerCase().startsWith(term)) || (b.sku && b.sku.toLowerCase().startsWith(term));
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
      if (filtered.length > 0) {
        const exactMatchIndex = filtered.findIndex(p =>
          (p.barcode && p.barcode.toLowerCase() === searchTerm.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === searchTerm.toLowerCase())
        );
        setSelectedProductIndex(exactMatchIndex >= 0 ? exactMatchIndex : 0);
      } else {
        setSelectedProductIndex(-1);
      }
    } else {
      setSelectedProductIndex(-1);
    }
  }, [searchTerm, products]);

  // Re-focus when switching orders or closing modals
  useEffect(() => {
    if (searchInputRef.current && !showPaymentModal && !showQRScanner && !showInvoice && !showShortcuts) {
      searchInputRef.current.focus();
    }
  }, [activeOrderId, showPaymentModal, showQRScanner, showInvoice, showShortcuts]);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    // Không xử lý phím tắt nếu đang focus vào ô input trong modal cài đặt
    if (showShortcuts) return;

    if (e.key === shortcuts.deleteOrder) {
      e.preventDefault();
      if (orders.length > 1) {
        // Find next or previous order id to set active
        const sortedOrders = [...orders].sort((a, b) => a.id - b.id);
        const currentIndex = sortedOrders.findIndex(o => o.id === activeOrderId);
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex + 1;
        const nextId = sortedOrders[nextIndex].id;

        const newOrders = orders.filter(o => o.id !== activeOrderId).sort((a, b) => a.id - b.id);
        setOrders(newOrders);
        setActiveOrderId(nextId);

        // Cập nhật lại transactions trong localStorage
        const orderId = `ORDER_${activeOrderId}`;
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const filteredTransactions = transactions.filter(t => t.orderId !== orderId);
        localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
      }
      return;
    }

    if (filteredProducts.length === 0 && e.key !== 'Enter') return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedProductIndex(prev =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedProductIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        const indexToAdd = selectedProductIndex >= 0 && selectedProductIndex < filteredProducts.length
          ? selectedProductIndex : 0;
        addToCart(filteredProducts[indexToAdd]);
        setSearchTerm('');
        setSelectedProductIndex(-1);
      }
    } else if (e.key === '+' && activeOrder.cart.length > 0) {
      e.preventDefault();
      updateCart(activeOrder.cart.map((item, idx) =>
        idx === activeOrder.cart.length - 1 ? { ...item, qty: item.qty + 1 } : item
      ));
    } else if (e.key === '-' && activeOrder.cart.length > 0) {
      e.preventDefault();
      const lastItem = activeOrder.cart[activeOrder.cart.length - 1];
      if (lastItem.qty > 1) {
        updateCart(activeOrder.cart.map((item, idx) =>
          idx === activeOrder.cart.length - 1 ? { ...item, qty: item.qty - 1 } : item
        ));
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const sortedOrders = [...orders].sort((a, b) => a.id - b.id);
      const currentIndex = sortedOrders.findIndex(o => o.id === activeOrderId);
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + sortedOrders.length) % sortedOrders.length
        : (currentIndex + 1) % sortedOrders.length;
      setActiveOrderId(sortedOrders[nextIndex].id);
    }
  };

  // F9/F10 shortcut for payment
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Bỏ qua phím tắt nếu đang mở modal (ngoại trừ F9/F10 trong payment modal thì đã xử lý bên trong modal)
      if (showPaymentModal || showQRScanner || showInvoice || showShortcuts) return;

      if (e.key === shortcuts.payment1 && activeOrder.cart.length > 0) {
        e.preventDefault();
        setShowPaymentModal(true);
      } else if (e.key === shortcuts.printInvoice) {
        e.preventDefault();
        handlePrintCurrentInvoice();
      } else if (e.key === shortcuts.comboFocus) {
        e.preventDefault();
        const comboBtn = document.querySelector('.combo-suggest-btn');
        if (comboBtn) {
          comboBtn.focus();
        }
      } else if (e.key === shortcuts.newOrder) {
        e.preventDefault();
        addNewOrder();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeOrder.cart, showPaymentModal, showQRScanner, showInvoice, showShortcuts, orders, activeOrderId, shortcuts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await posService.getAllProducts();
      // Transform backend data to match frontend format
      const transformedProducts = data.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.sellPrice),
        barcode: item.barcode || item.sku,
        sku: item.sku,
        stock: item.stockQuantity || 0,
        category: item.categoryName,
        brand: item.brandName
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else {
        // Fallback to mock data if backend is not available
        console.warn('Backend not available, using mock data');
        const mockProducts = [
          { id: 1, name: "Coca Cola 330ml", price: 15000, barcode: "123456", sku: "COCA-330", stock: 50 },
          { id: 2, name: "Pepsi 330ml", price: 14000, barcode: "123457", sku: "PEPSI-330", stock: 30 },
          { id: 3, name: "Sting 330ml", price: 12000, barcode: "123458", sku: "STING-330", stock: 25 },
          { id: 4, name: "Bánh mì sandwich", price: 25000, barcode: "123459", sku: "BANH-MI", stock: 10 },
          { id: 5, name: "Sữa tươi Vinamilk", price: 28000, barcode: "123460", sku: "SUA-VNM", stock: 20 },
          { id: 6, name: "Nước suối Lavie", price: 8000, barcode: "123461", sku: "NUOC-LAVIE", stock: 100 }
        ];
        setProducts(mockProducts);
        setCombos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load backend combos separately just in case product load fails slightly or we want them independent
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await api.get('/product-combos');
        setCombos(response.data || []);
      } catch (err) {
        console.error('Error fetching combos:', err);
      }
    };
    fetchCombos();
  }, []);

  useEffect(() => {
    localStorage.setItem('posOrders', JSON.stringify(orders));
    localStorage.setItem('activeOrderId', activeOrderId.toString());
  }, [orders, activeOrderId]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm)) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    const term = searchTerm.toLowerCase();
    const aStarts = a.name.toLowerCase().startsWith(term) || (a.barcode && a.barcode.toLowerCase().startsWith(term)) || (a.sku && a.sku.toLowerCase().startsWith(term));
    const bStarts = b.name.toLowerCase().startsWith(term) || (b.barcode && b.barcode.toLowerCase().startsWith(term)) || (b.sku && b.sku.toLowerCase().startsWith(term));
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  });

  const addToCart = (product) => {
    const existingItem = activeOrder.cart.find(item => item.id === product.id);
    let updatedOrders;
    if (existingItem) {
      updatedOrders = orders.map(order =>
        order.id === activeOrderId
          ? {
            ...order,
            cart: order.cart.map(item =>
              item.id === product.id
                ? { ...item, qty: item.qty + 1 }
                : item
            )
          }
          : order
      );
    } else {
      updatedOrders = orders.map(order =>
        order.id === activeOrderId
          ? { ...order, cart: [...order.cart, { ...product, qty: 1 }] }
          : order
      );
    }
    setOrders(updatedOrders);

    // Focus lại vào search input sau khi thêm sản phẩm
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);

    // Lưu ngay sau khi cập nhật
    setTimeout(() => {
      const currentOrder = updatedOrders.find(o => o.id === activeOrderId);
      if (currentOrder && currentOrder.cart.length > 0) {
        const subtotal = currentOrder.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const orderId = `ORDER_${activeOrderId}`;
        const pendingTransaction = {
          id: `#HD${Date.now().toString().slice(-6)}`,
          orderId: orderId,
          time: new Date().toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          quantity: `${currentOrder.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
          payment: "Tiền mặt",
          total: `${subtotal.toLocaleString()} đ`,
          status: "Chờ thanh toán",
          items: currentOrder.cart,
          customer: currentOrder.customer,
          customerMoney: 0,
          change: 0,
          pointsDiscount: 0,
          notes: ""
        };

        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const existingIndex = transactions.findIndex(t => t.orderId === orderId);

        if (existingIndex >= 0) {
          transactions[existingIndex] = pendingTransaction;
        } else {
          transactions.unshift(pendingTransaction);
        }
        localStorage.setItem('transactions', JSON.stringify(transactions));
      }
    }, 100);
  };

  const addComboToCart = (combo) => {
    let currentCart = [...activeOrder.cart];

    // Tạo hashmap để kiểm tra và trừ qty
    combo.items.forEach(comboItem => {
      const existingIdx = currentCart.findIndex(c => c.id === comboItem.productVariantId);
      if (existingIdx >= 0) {
        currentCart[existingIdx].qty -= comboItem.quantity;
        if (currentCart[existingIdx].qty <= 0) {
          currentCart.splice(existingIdx, 1);
        }
      }
    });

    const existingComboIdx = currentCart.findIndex(c => c.isCombo && c.id === `combo_${combo.id}`);
    if (existingComboIdx >= 0) {
      currentCart[existingComboIdx].qty += 1;
    } else {
      currentCart.push({
        id: `combo_${combo.id}`,
        name: `Combo: ${combo.comboName}`,
        price: combo.comboPrice,
        qty: 1,
        isCombo: true,
        comboId: combo.id,
        items: combo.items
      });
    }

    updateCart(currentCart);
  };

  const updateCart = (newCart) => {
    const updatedOrders = orders.map(order =>
      order.id === activeOrderId ? { ...order, cart: newCart } : order
    );
    setOrders(updatedOrders);

    // Lưu ngay sau khi cập nhật
    setTimeout(() => {
      const currentOrder = updatedOrders.find(o => o.id === activeOrderId);
      if (currentOrder && currentOrder.cart.length > 0) {
        const subtotal = currentOrder.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const orderId = `ORDER_${activeOrderId}`;
        const pendingTransaction = {
          id: `#HD${Date.now().toString().slice(-6)}`,
          orderId: orderId,
          time: new Date().toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          quantity: `${currentOrder.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
          payment: "Tiền mặt",
          total: `${subtotal.toLocaleString()} đ`,
          status: "Chờ thanh toán",
          items: currentOrder.cart,
          customer: currentOrder.customer,
          customerMoney: 0,
          change: 0,
          pointsDiscount: 0,
          notes: ""
        };

        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const existingIndex = transactions.findIndex(t => t.orderId === orderId);

        if (existingIndex >= 0) {
          transactions[existingIndex] = pendingTransaction;
        } else {
          transactions.unshift(pendingTransaction);
        }
        localStorage.setItem('transactions', JSON.stringify(transactions));
      } else {
        // Xóa đơn treo nếu giỏ hàng trống
        const orderId = `ORDER_${activeOrderId}`;
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const filteredTransactions = transactions.filter(t => t.orderId !== orderId);
        localStorage.setItem('transactions', JSON.stringify(filteredTransactions));
      }
    }, 100);
  };



  const updateCustomer = (customer) => {
    setOrders(orders.map(order =>
      order.id === activeOrderId ? { ...order, customer } : order
    ));
  };

  const updateUsePoints = (usePoints) => {
    setOrders(orders.map(order =>
      order.id === activeOrderId ? { ...order, usePoints } : order
    ));
  };

  const addNewOrder = () => {
    const newId = Math.max(...orders.map(o => o.id)) + 1;
    const newOrders = [...orders, { id: newId, cart: [], customer: null, usePoints: false }].sort((a, b) => a.id - b.id);
    setOrders(newOrders);
    setActiveOrderId(newId);
  };

  const deleteOrder = (orderId) => {
    if (orders.length > 1) {
      const newOrders = orders.filter(order => order.id !== orderId).sort((a, b) => a.id - b.id);
      setOrders(newOrders);
      if (activeOrderId === orderId) {
        setActiveOrderId(newOrders[0].id);
      }
    }
  };

  const completeOrder = async (orderData) => {
    // Xóa đơn chờ thanh toán
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const filteredTransactions = transactions.filter(t => t.status !== "Chờ thanh toán");

    // Đã xóa đồng bộ điểm khách hàng qua localStorage, chỉ sử dụng database qua PaymentModal

    const transaction = {
      id: `#HD${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      quantity: `${orderData.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
      payment: orderData.paymentMethod || "Tiền mặt",
      total: `${orderData.total.toLocaleString()} đ`,
      status: "Hoàn thành",
      cart: orderData.cart.map(item => ({
        ...item,
        productId: item.id
      })),
      items: orderData.cart,
      customer: orderData.customer,
      customerMoney: orderData.customerMoney,
      change: orderData.change,
      pointsDiscount: orderData.pointsDiscount,
      discount: orderData.discount || 0,
      notes: orderData.notes
    };

    filteredTransactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(filteredTransactions));

    // Lưu ngay vào database
    if (transaction.customer && transaction.cart) {
      try {
        const request = {
          customerId: transaction.customer.id,
          customerName: transaction.customer.name,
          paymentMethod: transaction.payment,
          items: transaction.cart.map(item => ({
            productId: item.productId || item.id,
            productName: item.name,
            quantity: item.qty,
            price: item.price,
            subtotal: item.price * item.qty
          }))
        };
        await api.post('/pos/purchase-history', request);
      } catch (error) {
        console.error('Error saving purchase history:', error);
      }
    }

    setShowPaymentModal(false);
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);

    setSelectedTransaction(transaction);
    setShowInvoice(true);

    setOrders(orders.map(order =>
      order.id === activeOrderId
        ? { ...order, cart: [], customer: null, usePoints: false }
        : order
    ));
  };

  const handlePrintCurrentInvoice = () => {
    const currentOrder = activeOrder;
    if (currentOrder.cart.length === 0) {
      const emptyTransaction = {
        id: `#HD${Date.now().toString().slice(-6)}`,
        time: new Date().toLocaleString('vi-VN'),
        quantity: `0 món`,
        payment: "Chưa thanh toán",
        total: `0 đ`,
        status: "Không có sản phẩm",
        cart: [],
        items: [],
        customer: null,
        customerMoney: 0,
        change: 0,
        pointsDiscount: 0,
        discount: 0,
        notes: ""
      };
      setSelectedTransaction(emptyTransaction);
      setShowInvoice(true);
      return;
    }

    const subtotal = currentOrder.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const pendingTransaction = {
      id: `#HD${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleString('vi-VN'),
      quantity: `${currentOrder.cart.reduce((sum, item) => sum + item.qty, 0)} món`,
      payment: "Chưa thanh toán",
      total: `${subtotal.toLocaleString()} đ`,
      status: "Chờ thanh toán",
      cart: currentOrder.cart,
      items: currentOrder.cart,
      customer: currentOrder.customer,
      customerMoney: 0,
      change: 0,
      pointsDiscount: 0,
      discount: 0,
      notes: ""
    };
    setSelectedTransaction(pendingTransaction);
    setShowInvoice(true);
  };

  return (
    <div style={{
      height: "89vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#f8f9fa",
      overflow: "hidden",
      paddingTop: "20px",
    }}>
      <div style={{ padding: "10px 20px" }}>
        <TopBar
          searchInputRef={searchInputRef}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
          addToCart={addToCart}
          addNewOrder={addNewOrder}
          orders={orders}
          activeOrderId={activeOrderId}
          setActiveOrderId={setActiveOrderId}
          setShowQRScanner={setShowQRScanner}
          deleteOrder={deleteOrder}
          onPrintInvoice={handlePrintCurrentInvoice}
          onKeyDown={handleKeyDown}
          selectedProductIndex={selectedProductIndex}
          setShowShortcuts={setShowShortcuts}
        />
      </div>

      {showShortcuts && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
              Cài đặt Phím tắt hệ thống
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>In hóa đơn hiện tại</span>
                <input
                  value={shortcuts.printInvoice}
                  onChange={(e) => setShortcuts({ ...shortcuts, printInvoice: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Thanh toán</span>
                <input
                  value={shortcuts.payment1}
                  onChange={(e) => setShortcuts({ ...shortcuts, payment1: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Trỏ xuống gợi ý Combo</span>
                <input
                  value={shortcuts.comboFocus}
                  onChange={(e) => setShortcuts({ ...shortcuts, comboFocus: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Thêm hóa đơn mới</span>
                <input
                  value={shortcuts.newOrder}
                  onChange={(e) => setShortcuts({ ...shortcuts, newOrder: e.target.value.toUpperCase() })}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Xóa hóa đơn đang chọn</span>
                <input
                  value={shortcuts.deleteOrder}
                  onChange={(e) => {
                    const val = e.target.value;
                    const finalVal = val.toLowerCase() === 'delete' ? 'Delete' : val.toUpperCase();
                    setShortcuts({ ...shortcuts, deleteOrder: finalVal });
                  }}
                  style={{ width: "80px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", color: "#666", fontSize: "13px" }}>
                <span>Chuyển hóa đơn tiếp theo</span>
                <strong>Tab</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666", fontSize: "13px" }}>
                <span>Chuyển hóa đơn trước đó</span>
                <strong>Shift + Tab</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666", fontSize: "13px" }}>
                <span>Tăng giảm số lượng SP</span>
                <strong>+, -</strong>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('posShortcuts', JSON.stringify(shortcuts));
                setShowShortcuts(false);
              }}
              style={{
                width: "100%",
                padding: "10px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                marginTop: "20px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Lưu & Đóng
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={{ marginTop: "20px" }}>
          <PaymentModal
            cart={activeOrder.cart}
            customer={activeOrder.customer}
            onClose={() => setShowPaymentModal(false)}
            onComplete={completeOrder}
            shortcuts={shortcuts}
          />
        </div>
      )}

      {showQRScanner && (
        <QRScanner
          onScan={async (barcode) => {
            try {
              const data = await posService.getProductByBarcode(barcode);
              if (data && data.length > 0) {
                const product = {
                  id: data[0].id,
                  name: data[0].name,
                  price: Number(data[0].sellPrice),
                  barcode: data[0].barcode || data[0].sku,
                  sku: data[0].sku,
                  stock: data[0].stockQuantity || 0
                };
                addToCart(product);
              } else {
                alert('Không tìm thấy sản phẩm với mã vạch này!');
              }
            } catch (error) {
              console.error('Error scanning barcode:', error);
              alert('Lỗi khi quét mã vạch!');
            }
            setShowQRScanner(false);
          }}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {showInvoice && (
        <Invoice
          transaction={selectedTransaction}
          onClose={() => setShowInvoice(false)}
        />
      )}

      {showSuccessNotification && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "#007bff",
          color: "white",
          padding: "15px 25px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "14px",
          fontWeight: "500",
          animation: "slideIn 0.3s ease-out"
        }}>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(400px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          <span style={{ fontSize: "20px" }}>✓</span>
          <span>Thanh toán thành công!</span>
        </div>
      )}

      {loading ? (
        <div style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "16px",
          color: "#666"
        }}>
          Đang tải sản phẩm...
        </div>
      ) : (
        <div style={{
          flex: 1,
          padding: "0 20px 10px 20px",
          overflow: "hidden",
          display: "flex",
          paddingTop: "30px"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            width: "100%",
            paddingTop: "0px",
            minHeight: 0
          }}>
            <Cart
              cart={activeOrder.cart}
              setCart={updateCart}
              combos={combos}
              products={products}
              addToCart={addToCart}
              addComboToCart={addComboToCart}
            />
            <PaymentPanel
              cart={activeOrder.cart}
              customer={activeOrder.customer}
              usePoints={activeOrder.usePoints}
              onOpenPayment={() => setShowPaymentModal(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
