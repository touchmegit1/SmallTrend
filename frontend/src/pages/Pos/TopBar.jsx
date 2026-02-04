export default function TopBar({ onSearch }) {
  return (
    <div style={{ padding: "10px", background: "red", color: "white", display: "flex", gap: "10px" }}>
      <input
        placeholder="Tìm sản phẩm (F3) hoặc quét barcode"
        style={{ flex: 1, padding: "8px" }}
        onChange={e => onSearch(e.target.value)}
      />
      <button>📷 Quét mã</button>
    </div>
  );
}
