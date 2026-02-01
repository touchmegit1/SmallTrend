import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import "./CategoryBar.css";

const categories = [
  "Tất Cả",
  "Bánh Mì & Ngũ Cốc",
  "Đồ Uống",
  "Sữa & Sản Phẩm Sữa",
  "Snack & Đồ Ăn Vặt",
  "Thực Phẩm Khô",
  "Bánh Kẹo",
];

function CategoryBar() {
  const [active, setActive] = useState("Tất Cả");

  return (
    <div className="category-wrapper">
      {/* Wrapper có nhiệm vụ tạo thanh cuộn */}
      <div className="category-scroll-container">
        <Nav variant="pills" className="category-scroll">
          {categories.map((item) => (
            <Nav.Item key={item}>
              <Nav.Link
                active={active === item}
                onClick={() => setActive(item)}
              >
                {item}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>
    </div>
  );
}

export default CategoryBar;
