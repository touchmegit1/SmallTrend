import { useState } from "react";
import TopBar from "./TopBar";
import ProductList from "./ProductList";
import Cart from "./Cart";
import CustomerInfo from "./CustomerInfo";
import PaymentPanel from "./PaymentPanel";

export default function POS() {
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, newQty) => {
    setCart(prev =>
      prev.map(p =>
        p.id === id ? { ...p, qty: newQty } : p
      )
    );
  };

  return (
    <div>
      <TopBar onSearch={(keyword) => console.log("Search:", keyword)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: "10px", padding: "10px" }}>
        <ProductList onAdd={addToCart} />
        <Cart cart={cart} onUpdateQty={updateQty} />
        <div>
          <CustomerInfo onSave={setCustomer} />
          <PaymentPanel cart={cart} customer={customer} />
        </div>
      </div>
    </div>
  );
}
