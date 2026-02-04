import { useState } from "react";
import TopBar from "./TopBar";
import EmptyCart from "./EmptyCart";
import Cart from "./Cart";
import PaymentPanel from "./PaymentPanel";
import QRScanner from "./QRScanner";

// Mock data sản phẩm
const mockProducts = [
  { id: 1, name: "Coca Cola 330ml", price: 15000, barcode: "123456" },
  { id: 2, name: "Pepsi 330ml", price: 14000, barcode: "123457" },
  { id: 3, name: "Sting 330ml", price: 12000, barcode: "123458" },
  { id: 4, name: "Bánh mì sandwich", price: 25000, barcode: "123459" },
  { id: 5, name: "Sữa tươi Vinamilk", price: 28000, barcode: "123460" },
  { id: 6, name: "Nước suối Lavie", price: 8000, barcode: "123461" }
];

export default function POS() {
  const [orders, setOrders] = useState([{ id: 1, cart: [], customer: null, usePoints: false }]);
  const [activeOrderId, setActiveOrderId] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const activeOrder = orders.find(order => order.id === activeOrderId);

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const addToCart = (product) => {
    const existingItem = activeOrder.cart.find(item => item.id === product.id);
    if (existingItem) {
      setOrders(orders.map(order =>
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
      ));
    } else {
      setOrders(orders.map(order =>
        order.id === activeOrderId
          ? { ...order, cart: [...order.cart, { ...product, qty: 1 }] }
          : order
      ));
    }
  };

  const updateCart = (newCart) => {
    setOrders(orders.map(order =>
      order.id === activeOrderId ? { ...order, cart: newCart } : order
    ));
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
    setOrders([...orders, { id: newId, cart: [], customer: null, usePoints: false }]);
    setActiveOrderId(newId);
  };

  const deleteOrder = (orderId) => {
    if (orders.length > 1) {
      const newOrders = orders.filter(order => order.id !== orderId);
      setOrders(newOrders);
      if (activeOrderId === orderId) {
        setActiveOrderId(newOrders[0].id);
      }
    }
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "#f8f9fa",
      height: "100vh",
      overflow: "hidden",
    
    }}>
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
      />

      {showQRScanner && (
        <QRScanner
          onScan={(barcode) => {
            const product = mockProducts.find(p => p.barcode === barcode);
            if (product) addToCart(product);
            setShowQRScanner(false);
          }}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        flex: 1,
        gap: "0",
        minHeight: 0
      }}>
        <Cart
          cart={activeOrder.cart}
          setCart={updateCart}
          customer={activeOrder.customer}
          setCustomer={updateCustomer}
          usePoints={activeOrder.usePoints}
          setUsePoints={updateUsePoints}
        />
        <PaymentPanel
          cart={activeOrder.cart}
          customer={activeOrder.customer}
          usePoints={activeOrder.usePoints}
        />
      </div>
    </div>
  );
}
