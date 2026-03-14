/**
 * priceCalculation.js
 * Utility tinh toan gia san pham - don gian.
 *
 * Mo hinh gia:
 *   cost_price    = Gia nhap
 *   selling_price = Gia ban (da bao gom thue, user nhap truc tiep)
 *   profit        = selling_price - cost_price
 */

/**
 * Tinh loi nhuan.
 * @param {number} costPrice Gia nhap
 * @param {number} sellingPrice Gia ban (da gom thue)
 * @returns {number}
 */
export const calculateProfit = (costPrice, sellingPrice) => {
    return (Number(sellingPrice) || 0) - (Number(costPrice) || 0);
};

/**
 * Format tien te VND.
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return Number(value).toLocaleString("vi-VN") + " VND";
};
