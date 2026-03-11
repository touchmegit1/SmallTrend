import EmptyCart from "./EmptyCart";
import { useState } from "react";

export default function Cart({ cart, setCart, combos = [], products = [], addToCart, addComboToCart }) {
  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, qty: newQty } : item
      ));
    }
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getComboSuggestions = () => {
    if (!combos.length || !cart.length) return [];

    const cartMap = {};
    cart.forEach(item => {
      cartMap[item.id] = (cartMap[item.id] || 0) + item.qty;
    });

    const suggestions = [];
    const suggestedProductIds = new Set();

    combos.forEach(combo => {
      if (!combo.isActive) return;

      let matchCount = 0;
      let missingItems = [];

      combo.items?.forEach(comboItem => {
        const cartQty = cartMap[comboItem.productVariantId] || 0;
        if (cartQty > 0) {
          matchCount++;
        } else {
          missingItems.push(comboItem);
        }
      });

      // Gợi ý combo nếu dở dang
      if (matchCount >= 1 && missingItems.length > 0) {
        missingItems.forEach(mi => {
          if (!suggestedProductIds.has(mi.productVariantId)) {
            const productInfo = products.find(p => p.id === mi.productVariantId);
            if (productInfo) {
              suggestions.push({
                ...productInfo,
                comboName: combo.comboName,
                combo: combo
              });
              suggestedProductIds.add(mi.productVariantId);
            }
          }
        });
      }
    });
    return suggestions;
  };

  const suggestions = getComboSuggestions();

  return (
    <div style={{
      background: "white",
      borderRadius: "0",
      padding: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden"
    }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50", fontSize: "15px" }}>Giỏ hàng</h3>

      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div style={{
          flex: 1,
          overflowY: "auto"
        }}>
          {cart.map(item => (
            <div key={item.id} style={{
              display: "flex",
              alignItems: "center",
              padding: "6px",
              border: "1px solid #e9ecef",
              borderRadius: "4px",
              marginBottom: "6px",
              background: "#f8f9fa"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", marginBottom: "2px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                  {item.name}
                </div>
                <div style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "12px" }}>
                  {item.price.toLocaleString()}đ
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <button
                  onClick={() => updateQuantity(item.id, item.qty - 1)}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #ddd",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  -
                </button>

                <span style={{
                  minWidth: "22px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "12px"
                }}>
                  {item.qty}
                </span>

                <button
                  onClick={() => updateQuantity(item.id, item.qty + 1)}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #ddd",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  +
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #dc3545",
                    background: "#dc3545",
                    color: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "3px",
                    fontSize: "13px"
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Đề xuất combo */}
      {suggestions.length > 0 && (
        <div style={{
          marginTop: "10px",
          borderTop: "2px dashed #e9ecef",
          paddingTop: "10px"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#17a2b8", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
            <span>💡 Đề xuất kết hợp Combo</span>
          </h4>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxHeight: "150px",
            overflowY: "auto"
          }}>
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8f9fa",
                border: "1px solid #17a2b8",
                borderRadius: "6px",
                padding: "8px"
              }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#333" }}>{suggestion.name}</div>
                  <div style={{ fontSize: "10px", color: "#6c757d", marginTop: "2px" }}>Đang có trong: {suggestion.comboName}</div>
                  <div style={{ fontSize: "12px", color: "#e74c3c", fontWeight: "bold", marginTop: "2px" }}>
                    {suggestion.price.toLocaleString()}đ
                  </div>
                </div>
                <button
                  className="combo-suggest-btn"
                  onClick={() => addComboToCart && addComboToCart(suggestion.combo)}
                  style={{
                    padding: "4px 10px",
                    background: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  + Thêm Combo {suggestion.comboName}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
