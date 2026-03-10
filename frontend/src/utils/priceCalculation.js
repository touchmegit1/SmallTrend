/**
 * priceCalculation.js
 * Utility tính toán giá sản phẩm — đơn giản.
 *
 * Mô hình giá:
 *   cost_price    = Giá nhập
 *   selling_price = Giá bán (đã bao gồm thuế, user nhập trực tiếp)
 *   profit        = selling_price − cost_price
 */

/**
 * Tính lợi nhuận.
 * @param {number} costPrice    Giá nhập
 * @param {number} sellingPrice Giá bán (đã gồm thuế)
 * @returns {number}
 */
export const calculateProfit = (costPrice, sellingPrice) => {
    return (Number(sellingPrice) || 0) - (Number(costPrice) || 0);
};

/**
 * Format tiền tệ VND.
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return Number(value).toLocaleString("vi-VN") + " đ";
};
