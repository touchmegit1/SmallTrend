import ProductCard from "./Card";
import CategoryBar from "./Category";

function POS() {
  return (
    <div className="p-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Left Panel - Products */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="p-3">
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc mã vạch..."
                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Category Bar */}
            <CategoryBar />

            {/* Products Grid */}
            <div className="h-[85vh] overflow-y-scroll p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProductCard
                  ten="Bánh mì tươi"
                  barcode="Bánh mì & Ngũ cốc"
                  gia="15000"
                  stock={8}
                  img="https://images.unsplash.com/photo-1509440159596-0249088772ff"
                />
                <ProductCard
                  ten="Cà phê hạt Arabica"
                  barcode="Đồ uống"
                  gia="120000"
                  img="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd"
                />
                <ProductCard
                  ten="Sữa tươi Vinamilk"
                  barcode="Sữa & Sản phẩm sữa"
                  gia="32000"
                  img="https://images.unsplash.com/photo-1624781612151-5d055cd97f37"
                />
                <ProductCard
                  ten="Snack khoai tây Lays"
                  barcode="Snack & Đồ ăn vặt"
                  gia="18000"
                  img="https://images.unsplash.com/photo-1626094309830-abbb0c99da4a"
                />
                <ProductCard
                  ten="Nước cam ép tươi"
                  barcode="Đồ uống"
                  gia="25000"
                  img="https://images.unsplash.com/photo-1621263764928-df1444c5e859"
                />
                <ProductCard
                  ten="Mì ăn liền Hảo Hảo"
                  barcode="Thực phẩm khô"
                  gia="6000"
                  img="https://images.unsplash.com/photo-1601562876973-6e1d0a77d66a"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Cart & Payment */}
          <div className="w-96 mt-4">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 mb-3">
              <h5 className="text-lg font-semibold mb-3">Thông tin khách hàng</h5>
              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại để tra cứu hoặc đăng ký thành viên mới"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-r-lg hover:bg-gray-700">
                    Tìm
                  </button>
                </div>
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 mb-3 text-center">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-lg font-semibold">Giỏ hàng</h5>
                <span className="text-gray-500 text-sm">(0 sản phẩm)</span>
              </div>
              <div className="my-8 text-gray-500 text-sm">
                Chưa có sản phẩm nào
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm border p-4">
              <h5 className="text-lg font-semibold mb-3">Thanh toán</h5>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Tạm tính:</span>
                <span>0đ</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">VAT (10%):</span>
                <span>0đ</span>
              </div>
              
              <hr className="my-3" />
              
              <div className="flex justify-between mb-4">
                <span className="font-bold">Tổng cộng:</span>
                <span className="text-blue-600 font-bold text-xl">0đ</span>
              </div>
              
              <button
                className="w-full py-2 mb-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                disabled
              >
                Thanh toán tiền mặt
              </button>
              
              <button className="w-full py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                Thanh toán thẻ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POS;
