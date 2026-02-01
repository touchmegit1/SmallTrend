import "bootstrap/dist/css/bootstrap.min.css";
import ProductCard from "./Card";
import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import Form from "react-bootstrap/Form";
import CategoryBar from "./Category";
import { Button, InputGroup } from "react-bootstrap";
function POS() {
  return (
    <div className="p-3">

      <Container>
        <Row>
          <Col md={8}>
            {/* Thanh search */}
            <div style={{ padding: "12px" }}>
              <Form.Control
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc mã vạch..."
                className="py-2"
                style={{ borderRadius: "10px" }}
              />
            </div>
            {/* Thanh search category */}
            <CategoryBar></CategoryBar>

            <div>
              <Container fluid>
                <div
                  style={{
                    height: "85vh",
                    overflowY: "auto",
                    padding: "10px"
                  }}
                >
                  <Row className="g-4">
                    <Col md={4}>
                      <ProductCard
                        ten="Bánh mì tươi"
                        barcode="Bánh mì & Ngũ cốc"
                        gia="15000"
                        stock={8}
                        img="https://images.unsplash.com/photo-1509440159596-0249088772ff"
                      />
                    </Col>

                    <Col md={4}>
                      <ProductCard
                        ten="Cà phê hạt Arabica"
                        barcode="Đồ uống"
                        gia="120000"
                        img="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd"
                      />
                    </Col>

                    <Col md={4}>
                      <ProductCard
                        ten="Sữa tươi Vinamilk"
                        barcode="Sữa & Sản phẩm sữa"
                        gia="32000"
                        img="https://images.unsplash.com/photo-1624781612151-5d055cd97f37"
                      />
                    </Col>

                    <Col md={4}>
                      <ProductCard
                        ten="Snack khoai tây Lays"
                        barcode="Snack & Đồ ăn vặt"
                        gia="18000"
                        img="https://images.unsplash.com/photo-1626094309830-abbb0c99da4a"
                      />
                    </Col>

                    <Col md={4}>
                      <ProductCard
                        ten="Nước cam ép tươi"
                        barcode="Đồ uống"
                        gia="25000"
                        img="https://images.unsplash.com/photo-1621263764928-df1444c5e859"
                      />
                    </Col>

                    <Col md={4}>
                      <ProductCard
                        ten="Mì ăn liền Hảo Hảo"
                        barcode="Thực phẩm khô"
                        gia="6000"
                        img="https://images.unsplash.com/photo-1601562876973-6e1d0a77d66a"
                      />
                    </Col>
                  </Row>
                </div>
              </Container>
            </div>

          </Col>
          <Col md={4}>
            <Container className="mt-4">
              {/* THÔNG TIN KHÁCH HÀNG */}
              <Card className="mb-3 shadow-sm border-0 rounded-4 p-3">
                <h5 className="mb-3">Thông tin khách hàng</h5>
                <Form>
                  <Form.Label className="fw-semibold">Số điện thoại</Form.Label>
                  <InputGroup>
                    <Form.Control
                      className="rounded-start-3"
                      placeholder="Nhập số điện thoại để tra cứu hoặc đăng ký thành viên mới"
                    />
                    <Button variant="dark" className="px-4 rounded-end-3">
                      Tìm
                    </Button>
                  </InputGroup>
                </Form>
              </Card>

              {/* GIỎ HÀNG */}
              <Card className="mb-3 shadow-sm border-0 rounded-4 p-3 text-center">
                <Row className="align-items-center mb-2">
                  <Col>
                    <h5 className="mb-0">Giỏ hàng</h5>
                  </Col>
                  <Col className="text-end text-muted">
                    (0 sản phẩm)
                  </Col>
                </Row>

                <div
                  className="my-5 text-muted"
                  style={{ fontSize: "14px" }}
                >
                  Chưa có sản phẩm nào
                </div>
              </Card>

              {/* THANH TOÁN */}
              <Card className="shadow-sm border-0 rounded-4 p-3">
                <h5 className="mb-3">Thanh toán</h5>

                <Row className="mb-2">
                  <Col className="text-muted">Tạm tính:</Col>
                  <Col className="text-end">0đ</Col>
                </Row>

                <Row className="mb-2">
                  <Col className="text-muted">VAT (10%):</Col>
                  <Col className="text-end">0đ</Col>
                </Row>

                <hr />

                <Row className="mb-3">
                  <Col className="fw-bold">Tổng cộng:</Col>
                  <Col className="text-end text-primary fw-bold fs-5">0đ</Col>
                </Row>

                <Button
                  variant="secondary"
                  className="mb-2 py-2 rounded-3"
                  disabled
                >
                  Thanh toán tiền mặt
                </Button>

                <Button
                  variant="light"
                  className="py-2 rounded-3 border"
                >
                  Thanh toán thẻ
                </Button>
              </Card>
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default POS;
