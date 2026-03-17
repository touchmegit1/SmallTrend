import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Gift } from "lucide-react";

export default function TopBar({ searchInputRef, searchTerm, setSearchTerm, filteredProducts, addToCart, addNewOrder, orders, activeOrderId, setActiveOrderId, setShowQRScanner, deleteOrder, onPrintInvoice, onOpenLoyalty, onKeyDown, selectedProductIndex, setShowShortcuts, notifications }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [orders]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };
  const notifyItems = notifications || [];
  const notifyCount = notifyItems.length;

  return (
    <div style={{
      background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
      color: "white",
      padding: "8px 15px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      borderRadius: "10px",
      height: "45px",
      marginBottom: "15px"
    }}>
      <div style={{ fontSize: "18px", fontWeight: "bold", minWidth: "150px" }}>SmallTrend POS</div>

      <div style={{ position: "relative", flex: 1, maxWidth: "350px" }}>
        <input
          ref={searchInputRef}
          placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={onKeyDown}
          style={{
            padding: "8px 12px",
            width: "100%",
            border: "none",
            borderRadius: "20px",
            fontSize: "14px",
            outline: "none"
          }}
        />

        {/* Product dropdown */}
        {searchTerm && filteredProducts.length > 0 && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            maxHeight: "250px",
            overflowY: "auto",
            marginTop: "5px"
          }}>
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => {
                  addToCart(product);
                  setSearchTerm("");
                }}
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  color: "#333",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: selectedProductIndex === index ? "#e3f2fd" : "white"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = selectedProductIndex === index ? "#e3f2fd" : "#f8f9fa"}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedProductIndex === index ? "#e3f2fd" : "white"}
              >
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "2px", fontSize: "13px" }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    Mã: {product.barcode}
                  </div>
                </div>
                <div style={{ color: "#e74c3c", fontWeight: "bold", fontSize: "13px" }}>
                  {product.price.toLocaleString()}đ
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Tabs */}
      <div style={{ position: "relative", flex: 1, maxWidth: "400px", display: "flex", alignItems: "center" }}>
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            style={{
              position: "absolute",
              left: 0,
              zIndex: 10,
              width: "20px",
              height: "20px",
              background: "rgba(255,255,255,0.9)",
              color: "#007bff",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              fontWeight: "bold"
            }}
          >
            ‹
          </button>
        )}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            flex: 1,
            padding: orders.length > 3 ? "0 25px" : "0"
          }}
        >
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          {[...orders].sort((a, b) => a.id - b.id).map((order, index) => (
            <div key={order.id} style={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0 }}>
              <button
                onClick={() => setActiveOrderId(order.id)}
                style={{
                  padding: "5px 10px",
                  background: order.id === activeOrderId ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "11px",
                  paddingRight: orders.length > 1 ? "25px" : "10px",
                  minWidth: 0,
                  whiteSpace: "nowrap"
                }}
              >
                Hóa đơn {index + 1} ({order.cart.length})
              </button>
              {orders.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOrder(order.id);
                  }}
                  style={{
                    position: "absolute",
                    right: "2px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "16px",
                    height: "16px",
                    background: "rgba(220,53,69,0.8)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNewOrder}
            style={{
              padding: "5px 8px",
              background: "rgba(0,123,255,0.8)",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              flexShrink: 0
            }}
          >
            +
          </button>
        </div>
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            style={{
              position: "absolute",
              right: 0,
              zIndex: 10,
              width: "20px",
              height: "20px",
              background: "rgba(255,255,255,0.9)",
              color: "#007bff",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              fontWeight: "bold"
            }}
          >
            ›
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={onPrintInvoice}
          style={{
            padding: "6px 12px",
            background: "rgba(255,255,255,0.2)",
            color: "white",
            border: "none",
            borderRadius: "15px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          In hóa đơn
        </button>

        <button
          onClick={onOpenLoyalty}
          style={{
            width: "32px",
            height: "32px",
            background: "rgba(255,255,255,0.2)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Đổi quà"
        >
          <Gift size={16} />
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowSettings(false);
            }}
            style={{
              width: "32px",
              height: "32px",
              background: showNotifications ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}
            title="Thông báo"
          >
            <Bell size={16} />
            {notifyCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                minWidth: "16px",
                height: "16px",
                borderRadius: "8px",
                background: "#dc3545",
                color: "white",
                fontSize: "10px",
                lineHeight: "16px",
                textAlign: "center",
                padding: "0 4px",
                fontWeight: "bold"
              }}>
                {notifyCount > 9 ? "9+" : notifyCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              overflow: "hidden",
              zIndex: 1001,
              width: "320px",
              maxHeight: "320px",
              overflowY: "auto"
            }}>
              <div style={{
                padding: "10px 12px",
                borderBottom: "1px solid #eee",
                fontSize: "13px",
                fontWeight: "600",
                color: "#333"
              }}>
                Thông báo hệ thống
              </div>
              {notifyItems.length === 0 ? (
                <div style={{ padding: "12px", fontSize: "12px", color: "#6c757d" }}>
                  Không có thông báo mới
                </div>
              ) : (
                notifyItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                        setShowNotifications(false);
                      }
                    }}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f5f5f5",
                      fontSize: "12px",
                      color: "#333",
                      cursor: item.path ? "pointer" : "default"
                    }}
                    onMouseEnter={(e) => {
                      if (item.path) e.currentTarget.style.background = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontWeight: "600", marginBottom: "3px" }}>{item.title}</div>
                    <div style={{ color: "#6c757d" }}>{item.description}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowNotifications(false);
            }}
            style={{
              padding: "6px 12px",
              background: showSettings ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
              color: "white",
              border: "none",
              borderRadius: "15px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Cài đặt
          </button>
          {showSettings && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "8px",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              overflow: "hidden",
              zIndex: 1000,
              minWidth: "150px"
            }}>
              <button
                onClick={() => {
                  setShowSettings(false);
                  if (setShowShortcuts) setShowShortcuts(true);
                }}
                style={{
                  width: "100%",
                  padding: "10px 15px",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  color: "#333",
                  fontSize: "13px"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                onMouseLeave={(e) => e.target.style.background = "none"}
              >
                Phím tắt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
