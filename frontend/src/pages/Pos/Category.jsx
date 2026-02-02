import { useState } from "react";

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
    <div className="mx-3 p-2 bg-gray-50 rounded-2xl border border-gray-200">
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              active === item
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;
