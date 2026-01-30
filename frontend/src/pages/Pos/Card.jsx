import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

function ProductCard({ ten, barcode, gia }) {
  return (
    <Card
      style={{
        width: "18rem",
        borderRadius: "12px",
        overflow: "hidden",
      }}
      className="shadow-sm"
    >
      {/* Ảnh */}
      <Card.Img
        variant="top"
        src="https://images.unsplash.com/photo-1608198093002-ad4e005484ec"
        style={{
          height: "180px",
          objectFit: "cover",
        }}
      />

      <Card.Body>
        {/* Tên */}
        <Card.Title className="mb-1">{ten}</Card.Title>

        {/* Danh mục / barcode */}
        <Card.Text className="text-muted mb-3" style={{ fontSize: "14px" }}>
          {barcode}
        </Card.Text>

        {/* Giá + nút thêm */}
        <div className="d-flex justify-content-between align-items-center">
          <span
            style={{
              color: "#0d6efd",
              fontWeight: "600",
              fontSize: "18px",
            }}
          >
            {gia}đ
          </span>

          <Button variant="dark">Thêm</Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
