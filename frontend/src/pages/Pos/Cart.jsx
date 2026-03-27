import EmptyCart from "./EmptyCart";
import { useState } from "react";

// Hiển thị thành phần cart.
export default function Cart({ cart, setCart, combos = [], products = [], addToCart, addComboToCart }) {
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [comboDetail, setComboDetail] = useState(null); // combo object being previewed

  // Cập nhật quantity.
  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, qty: newQty } : item
      ));
    }
  };

  // Thực hiện remove item.
  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Lấy combo suggestions.
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

  // Tính tổng giá lẻ các sản phẩm trong combo
  const calcComboRetailTotal = (combo) => {
    if (!combo?.items) return 0;
    return combo.items.reduce((sum, ci) => {
      const p = products.find(p => p.id === ci.productVariantId);
      const unitPrice = p ? p.price : (ci.unitPrice || ci.sellPrice || 0);
      return sum + unitPrice * (ci.quantity || 1);
    }, 0);
  };

  // Nút Info mở popup chi tiết combo bằng SVG đẹp mắt
  const ComboInfoBtn = ({ combo, style }) => (
    <button
      onClick={(e) => { e.stopPropagation(); setComboDetail(combo); }}
      title="Xem chi tiết combo"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#007bff",
        padding: "2px",
        flexShrink: 0,
        transition: "all 0.2s ease-in-out",
        borderRadius: "50%",
        ...style
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.color = "#0056b3";
        e.currentTarget.style.background = "rgba(0,123,255,0.1)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = "#007bff";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        fill="currentColor" 
        viewBox="0 0 16 16"
      >
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
      </svg>
    </button>
  );

  return (
    <div style={{
      background: "white",
      borderRadius: "0",
      padding: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      position: "relative"
    }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#2c3e50", fontSize: "15px" }}>Giỏ hàng</h3>

      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {cart.map(item => (
            <div key={item.id} style={{
              display: "flex",
              alignItems: "center",
              padding: "6px",
              border: "1px solid #e9ecef",
              borderRadius: "4px",
              marginBottom: "6px",
              background: item.isCombo ? "#f0faff" : "#f8f9fa"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "600", marginBottom: "2px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                  {item.name}
                  {item.isCombo && (() => {
                    const c = combos.find(c => c.id === item.comboId);
                    return c ? <ComboInfoBtn combo={c} /> : null;
                  })()}
                </div>
                <div style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "12px" }}>
                  {item.price.toLocaleString()}đ
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <button
                  onClick={() => updateQuantity(item.id, item.qty - 1)}
                  style={{
                    width: "24px", height: "24px",
                    border: "1px solid #ddd", background: "white",
                    borderRadius: "4px", cursor: "pointer", fontSize: "13px"
                  }}
                >-</button>

                {editingId === item.id ? (
                  <input
                    type="number"
                    autoFocus
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      const val = parseInt(editingValue);
                      if (!isNaN(val)) updateQuantity(item.id, val);
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = parseInt(editingValue);
                        if (!isNaN(val)) updateQuantity(item.id, val);
                        setEditingId(null);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    style={{
                      width: "40px", height: "24px", textAlign: "center",
                      fontWeight: "bold", fontSize: "12px",
                      border: "2px solid #007bff", borderRadius: "4px",
                      outline: "none", padding: "0 2px"
                    }}
                  />
                ) : (
                  <span
                    onClick={() => { setEditingId(item.id); setEditingValue(item.qty.toString()); }}
                    title="Nhấp để sửa số lượng"
                    style={{
                      minWidth: "22px", textAlign: "center",
                      fontWeight: "bold", fontSize: "12px",
                      cursor: "text", padding: "2px 4px",
                      borderRadius: "3px", border: "1px dashed #aaa",
                      userSelect: "none"
                    }}
                  >
                    {item.qty}
                  </span>
                )}

                <button
                  onClick={() => updateQuantity(item.id, item.qty + 1)}
                  style={{
                    width: "24px", height: "24px",
                    border: "1px solid #ddd", background: "white",
                    borderRadius: "4px", cursor: "pointer", fontSize: "13px"
                  }}
                >+</button>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    width: "24px", height: "24px",
                    border: "1px solid #dc3545", background: "#dc3545",
                    color: "white", borderRadius: "4px",
                    cursor: "pointer", marginLeft: "3px", fontSize: "13px"
                  }}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Đề xuất combo */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: "10px", borderTop: "2px dashed #e9ecef", paddingTop: "10px" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#17a2b8", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
            <span>💡 Đề xuất kết hợp Combo</span>
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#333", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {suggestion.name}
                    </span>
                    <ComboInfoBtn combo={suggestion.combo} />
                  </div>
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
                    background: "#17a2b8", color: "white",
                    border: "none", borderRadius: "4px",
                    fontSize: "11px", fontWeight: "bold",
                    cursor: "pointer", flexShrink: 0, marginLeft: "6px"
                  }}
                >
                  + Thêm Combo {suggestion.comboName}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup chi tiết combo */}
      {comboDetail && (
        <div
          onClick={() => setComboDetail(null)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 3000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", borderRadius: "12px",
              padding: "24px", width: "360px", maxWidth: "95%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "#17a2b8" }}>
                  📦 {comboDetail.comboName}
                </div>
                {comboDetail.description && (
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "3px" }}>{comboDetail.description}</div>
                )}
              </div>
              <button
                onClick={() => setComboDetail(null)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999", lineHeight: 1 }}
              >×</button>
            </div>

            {/* Danh sách sản phẩm */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "6px" }}>Sản phẩm trong combo:</div>
              {(comboDetail.items || []).map((ci, i) => {
                const p = products.find(p => p.id === ci.productVariantId);
                const unitPrice = p ? p.price : (ci.unitPrice || ci.sellPrice || 0);
                const qty = ci.quantity || 1;
                // Construct name similar to backend ProductVariantService.mapToResponse
                let productName = p ? p.name : (ci.productName || `SP #${ci.productVariantId}`);
                if (!p && ci) {
                  const nameParts = [ci.productName];
                  if (ci.unitName) nameParts.push(ci.unitName);
                  if (ci.attributes && typeof ci.attributes === 'object') {
                    Object.values(ci.attributes).forEach(val => {
                      if (val) nameParts.push(`- ${val}`);
                    });
                  }
                  productName = nameParts.filter(Boolean).join(" ");
                }

                return (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "5px 8px", marginBottom: "4px",
                    background: "#f8f9fa", borderRadius: "6px",
                    fontSize: "12px"
                  }}>
                    <span style={{ flex: 1, color: "#333" }}>
                      {productName}{qty > 1 ? ` ×${qty}` : ""}
                    </span>
                    <span style={{ color: "#e74c3c", fontWeight: "600", whiteSpace: "nowrap", marginLeft: "8px" }}>
                      {(unitPrice * qty).toLocaleString()}đ
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tổng kết giá */}
            {(() => {
              const retailTotal = calcComboRetailTotal(comboDetail);
              const comboPrice = comboDetail.comboPrice || 0;
              const saved = retailTotal - comboPrice;
              return (
                <div style={{
                  background: "#f0faff", borderRadius: "8px",
                  padding: "10px 12px", border: "1px solid #bee5eb"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginBottom: "4px" }}>
                    <span>Tổng mua lẻ:</span>
                    <span style={{ textDecoration: "line-through", color: "#999" }}>{retailTotal.toLocaleString()}đ</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "700", color: "#17a2b8" }}>
                    <span>Giá combo:</span>
                    <span>{comboPrice.toLocaleString()}đ</span>
                  </div>
                  {saved > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#28a745", marginTop: "4px" }}>
                      <span>🎉 Tiết kiệm được:</span>
                      <strong>{saved.toLocaleString()}đ ({retailTotal > 0 ? Math.round(saved / retailTotal * 100) : 0}%)</strong>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
