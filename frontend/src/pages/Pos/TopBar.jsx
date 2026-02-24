export default function TopBar({ searchTerm, setSearchTerm, filteredProducts, addToCart, addNewOrder, orders, activeOrderId, setActiveOrderId, setShowQRScanner, deleteOrder, onPrintInvoice }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchTerm) {
      const product = filteredProducts[0];
      if (product) {
        addToCart(product);
        setSearchTerm("");
      }
    }
  };

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
          placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
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
            {filteredProducts.map(product => (
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
                  alignItems: "center"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                onMouseLeave={(e) => e.target.style.background = "white"}
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
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1 }}>
        {[...orders].sort((a, b) => a.id - b.id).map((order, index) => (
          <div key={order.id} style={{ position: "relative", display: "flex", alignItems: "center" }}>
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
                 minWidth: 0  
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
            fontWeight: "bold"
          }}
        >
          +
        </button>
      </div>
      
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button 
          onClick={() => setShowQRScanner(true)}
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
          Quét QR
        </button>
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
        <button style={{
          padding: "6px 12px",
          background: "rgba(255,255,255,0.2)",
          color: "white",
          border: "none",
          borderRadius: "15px",
          cursor: "pointer",
          fontSize: "12px"
        }}>
          Cài đặt
        </button>
      </div>
    </div>
  );
}
