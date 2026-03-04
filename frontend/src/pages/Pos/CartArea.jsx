export default function CartArea({ cart }) {
  return (
    <div>
      <h3>Danh sách sản phẩm</h3>
      {cart.map((item, index) => (
        <div key={index} style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px",
          borderBottom: "1px solid #ddd"
        }}>
          <span>
            {item.name}
            <span style={{ color: '#666', fontSize: '13px', marginLeft: '5px' }}>
              ({item.unitName || (item.category?.toLowerCase() === 'nước' ? 'Lon' : item.category?.toLowerCase() === 'thực phẩm' ? 'Gói' : 'Cái')})
            </span>
          </span>
          <span>x {item.qty}</span>
        </div>
      ))}
    </div>
  );
}
