import { useEffect, useRef, useState } from "react";

export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        maxWidth: "500px",
        width: "90%",
        textAlign: "center"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h3 style={{ margin: 0 }}>Quét mã sản phẩm</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>

        {/* Camera View */}
        <div style={{
          position: "relative",
          marginBottom: "20px",
          background: "#f0f0f0",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "300px",
              objectFit: "cover"
            }}
          />
          
          {/* Scanning overlay */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "200px",
            height: "100px",
            border: "2px solid #007bff",
            borderRadius: "8px",
            background: "rgba(0,123,255,0.1)"
          }}>
            <div style={{
              position: "absolute",
              top: "-10px",
              left: "-10px",
              right: "-10px",
              bottom: "-10px",
              border: "2px solid white",
              borderRadius: "12px",
              animation: "pulse 2s infinite"
            }} />
          </div>
        </div>

        {/* Manual Input */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 10px 0", color: "#666" }}>
            Hoặc nhập mã thủ công:
          </p>
          <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Nhập mã barcode..."
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Thêm
            </button>
          </form>
        </div>

        <div style={{ fontSize: "14px", color: "#666" }}>
          {isScanning ? "📷 Camera đang hoạt động" : "❌ Không thể truy cập camera"}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}