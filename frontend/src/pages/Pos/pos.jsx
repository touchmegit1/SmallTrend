import { useState, useEffect } from "react";
import TopBar from "./TopBar";
import EmptyCart from "./EmptyCart";
import Cart from "./Cart";
import PaymentPanel from "./PaymentPanel";
import PaymentModal from "./PaymentModal";
import QRScanner from "./QRScanner";
import Invoice from "./Invoice";
import posService from "../../services/posService";

export default function POS() {
  const [products, setProducts] = useState([]);
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
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const activeOrder = orders.find(order => order.id === activeOrderId) || { id: activeOrderId, cart: [], customer: null, usePoints: false };

  // Fetch products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  // F9 shortcut for payment
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F9' && activeOrder.cart.length > 0 && !showPaymentModal) {
        e.preventDefault();
        setShowPaymentModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeOrder.cart, showPaymentModal]);

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
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('posOrders', JSON.stringify(orders));
    localStorage.setItem('activeOrderId', activeOrderId.toString());
  }, [orders, activeOrderId]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm)) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const completeOrder = (orderData) => {
    // Xóa đơn chờ thanh toán
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const filteredTransactions = transactions.filter(t => t.status !== "Chờ thanh toán");
    
    // Xử lý điểm khách hàng
    if (orderData.customer) {
      const customers = JSON.parse(localStorage.getItem('customers') || '[]');
      const earnedPoints = Math.floor(orderData.total / 10000);
      const pointsUsed = orderData.pointsDiscount / 100;
      
      const updatedCustomers = customers.map(c => 
        c.phone === orderData.customer.phone 
          ? { 
              ...c, 
              points: (c.points || 0) - pointsUsed + earnedPoints,
              existingPoints: (c.existingPoints || 0) - pointsUsed + earnedPoints
            }
          : c
      );
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      
      // Cập nhật lại customer object
      orderData.customer.points = (orderData.customer.points || 0) - pointsUsed + earnedPoints;
      orderData.customer.existingPoints = (orderData.customer.existingPoints || 0) - pointsUsed + earnedPoints;
    }

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

  const handlePrintLastInvoice = () => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (transactions.length > 0) {
      setSelectedTransaction(transactions[0]);
      setShowInvoice(true);
    } else {
      alert("Chưa có hóa đơn nào!");
    }
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
          onPrintInvoice={handlePrintLastInvoice}
        />
      </div>

      {showPaymentModal && (
        <div style={{ marginTop: "20px" }}>
          <PaymentModal
            cart={activeOrder.cart}
            customer={activeOrder.customer}
            onClose={() => setShowPaymentModal(false)}
            onComplete={completeOrder}
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
