import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function ProductCard({ ten, barcode, gia, img, stock }) {
  return (
    <Card
      className="shadow-sm"
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "none"
      }}
    >
      {/* ẢNH SẢN PHẨM */}
      <div style={{ position: "relative" }}>
        {stock && (
          <Badge
            bg="danger"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              borderRadius: "20px",
              padding: "6px 10px"
            }}
          >
            Còn {stock}
          </Badge>
        )}
        <Card.Img
          variant="top"
          src={img}
          style={{ height: "180px", objectFit: "cover" }}
        />
      </div>

      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title style={{ fontSize: "16px", fontWeight: "600" }}>
              {ten}
            </Card.Title>
            <Card.Text style={{ color: "#777", fontSize: "14px" }}>
              {barcode}
            </Card.Text>
          </div>
          <span style={{ cursor: "pointer" }}>ⓘ</span>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span
            style={{
              color: "#0d6efd",
              fontWeight: "bold",
              fontSize: "16px"
            }}
          >
            {Number(gia).toLocaleString("vi-VN")}đ
          </span>

          <Button
            variant="dark"
            style={{ borderRadius: "10px" }}
          >
            🛒 Thêm
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
