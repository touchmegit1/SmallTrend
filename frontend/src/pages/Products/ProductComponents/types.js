/**
 * types.js
 * Khai báo các Type Definition (JsDoc) chuẩn cho toàn bộ thư mục Product.
 * Giúp gợi ý code (Intellisense) tốt hơn trên IDE và duy trì cấu trúc Backend/Frontend đồng bộ.
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Mã khoá định danh của sản phẩm (Sinh tự động hoặc UUID)
 * @property {string} name - Tên thương phẩm hiển thị
 * @property {string} sku - Mã Stock Keeping Unit dùng nội bộ
 * @property {string} barcode - Cấu trúc mã vạch in chuẩn (VD: EAN-13, CODE128)
 * @property {string} category - ID hoặc Tên Nhóm ngành hàng
 * @property {string} brand - ID hoặc Tên Thương hiệu nhà phân phối
 * @property {string} unit - Đơn vị tính cơ bản (Cái, Chiếc, Bịch, Thùng)
 * @property {string=} description - Bài viết chi tiết thông số (Tuỳ chọn)
 * @property {number} costPrice - Giá vốn tự tính / Base nhập kho
 * @property {number} retailPrice - Giá thẻ nhãn bán lẻ
 * @property {number} wholesalePrice - Giá niêm yết bán buôn / Sỉ số lượng lớn
 * @property {number} stock - Tổng tồn thực tế ở kho
 * @property {number=} minStock - Ngưỡng cảnh báo sắp hết hàng (Tuỳ chọn)
 * @property {number=} maxStock - Ngưỡng trần tồn kho (Tuỳ chọn)
 * @property {number=} weight - Khối lượng tịnh
 * @property {string=} dimensions - Số đo thể tích (CaoxRộngxDài)
 * @property {number=} variants - Count tổng số biến thể con
 * @property {string=} image - Ảnh bìa đại diện sản phẩm gốc
 * @property {"active" | "inactive"} status - Trạng thái hoạt động
 * @property {string=} createdAt - Dấu thời gian khởi tạo
 * @property {string=} updatedAt - Dấu thời gian chỉnh sửa cuối
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string=} id - Định danh nhánh phân loại
 * @property {string} name - Tên size / Màu sắc (Vd: Màu xanh size XL)
 * @property {string} sku - Mã SKU thứ cấp của từng màu / size
 * @property {string} barcode - Mã Barcode rẽ nhánh
 * @property {Object.<string, string>} attributes - Dictionary thuộc tính mềm
 * @property {number} price - Giá override đè lên giá Parent nếu bán khác giá
 * @property {number} stock - Tồn độc lập của Variant
 * @property {"active" | "inactive"} status - Status bán của bản thân nhánh
 */

/**
 * @typedef {"list" | "add" | "detail" | "edit" | "add-variant" | "edit-variant"} ScreenType
 * Biến cờ (Flag) dùng để bật tắt ẩn hiện các Modal Screen tương ứng trong flow.
 */
