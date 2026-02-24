const products = [
  { id: 1, name: "Bánh mì", price: 15000, barcode: "123456" },
  { id: 2, name: "Coca", price: 10000, barcode: "789012" },
  { id: 3, name: "Sting 330ml", price: 12000, barcode: "123458" },
  { id: 4, name: "Bánh mì sandwich", price: 25000, barcode: "123459" },
  { id: 5, name: "Sữa tươi Vinamilk", price: 28000, barcode: "123460" },
  { id: 6, name: "Nước suối Lavie", price: 8000, barcode: "123461" }
];

export default function ProductList({ onAdd }) {
  return (
    <div>
      <h3>Danh sách sản phẩm</h3>
      {products.map(p => (
        <div key={p.id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "5px" }}>
          <p>{p.name}</p>
          <p>{p.price.toLocaleString()} đ</p>
          <button onClick={() => onAdd(p)}>Thêm</button>
        </div>
      ))}
    </div>
  );
}
