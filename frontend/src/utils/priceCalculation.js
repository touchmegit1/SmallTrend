/**
 * priceCalculation.js
 * Utility tính toán giá theo nghiệp vụ chuẩn:
 * - Người dùng nhập giá bán trước VAT
 * - Hệ thống tính VAT, giá bán cuối và làm tròn theo bước cấu hình
 */

export const roundToStep = (value, step = 100) => {
    const numericValue = Number(value) || 0;
    const numericStep = Number(step) || 1;
    if (numericStep <= 0) return numericValue;
    return Math.round(numericValue / numericStep) * numericStep;
};

export const calculateTaxInclusivePrice = (baseSellingPrice, taxPercent, roundStep = 100) => {
    const base = Number(baseSellingPrice) || 0;
    const tax = Number(taxPercent) || 0;

    const vatAmountRaw = base * (tax / 100);
    const finalSellingPriceRaw = base + vatAmountRaw;
    const sellingPrice = roundToStep(finalSellingPriceRaw, roundStep);
    const vatAmount = sellingPrice - base;

    return {
        baseSellingPrice: base,
        taxPercent: tax,
        vatAmountRaw,
        finalSellingPriceRaw,
        sellingPrice,
        vatAmount,
    };
};

export const calculatePriceBreakdown = ({ purchasePrice = 0, baseSellingPrice = 0, taxPercent = 0, roundStep = 100 } = {}) => {
    const purchase = Number(purchasePrice) || 0;
    const taxData = calculateTaxInclusivePrice(baseSellingPrice, taxPercent, roundStep);

    const profit = taxData.baseSellingPrice - purchase;
    const marginPercent = purchase > 0 ? (profit / purchase) * 100 : 0;

    return {
        ...taxData,
        purchasePrice: purchase,
        profit,
        marginPercent,
    };
};

export const calculateProfit = (costPrice, baseSellingPrice) => {
    return (Number(baseSellingPrice) || 0) - (Number(costPrice) || 0);
};

export const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return Number(value).toLocaleString("vi-VN") + " VND";
};
