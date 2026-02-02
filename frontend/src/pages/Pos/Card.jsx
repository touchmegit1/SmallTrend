function ProductCard({ ten, barcode, gia, img, stock }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
      {/* Product Image */}
      <div className="relative">
        {stock && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Còn {stock}
          </span>
        )}
        <img
          src={img}
          alt={ten}
          className="w-full h-44 object-cover"
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {ten}
            </h3>
            <p className="text-gray-500 text-sm">
              {barcode}
            </p>
          </div>
          <span className="cursor-pointer text-gray-400 ml-2">ⓘ</span>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-blue-600 font-bold text-base">
            {Number(gia).toLocaleString("vi-VN")}đ
          </span>

          <button className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm">
            🛒 Thêm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
