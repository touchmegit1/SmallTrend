package com.smalltrend.exception;

public class InventoryCountException extends RuntimeException {

    public enum Code {
        COUNT_NOT_FOUND,
        INVALID_STATUS_TRANSITION,
        COUNT_ITEMS_REQUIRED,
        LOCATION_REQUIRED,
        VARIANT_ID_REQUIRED,
        COUNT_ALREADY_FINALIZED,
        INVALID_DIFFERENCE_SIGN
    }

    private final Code code;

    public InventoryCountException(Code code, String message) {
        super(message);
        this.code = code;
    }

    public Code getCode() {
        return code;
    }

    public static InventoryCountException countNotFound(Integer id) {
        return new InventoryCountException(Code.COUNT_NOT_FOUND, "Không tìm thấy phiếu kiểm kho với ID: " + id);
    }

    public static InventoryCountException invalidStatusTransition(String currentStatus, String targetStatus) {
        return new InventoryCountException(
                Code.INVALID_STATUS_TRANSITION,
                "Không thể chuyển trạng thái từ " + currentStatus + " sang " + targetStatus
        );
    }

    public static InventoryCountException countItemsRequired() {
        return new InventoryCountException(Code.COUNT_ITEMS_REQUIRED, "Phiếu kiểm kho phải có ít nhất 1 sản phẩm.");
    }

    public static InventoryCountException locationRequired() {
        return new InventoryCountException(Code.LOCATION_REQUIRED, "Vui lòng chọn vị trí cần kiểm kho.");
    }

    public static InventoryCountException variantIdRequired() {
        return new InventoryCountException(Code.VARIANT_ID_REQUIRED, "Item kiểm kho thiếu variantId.");
    }

    public static InventoryCountException countAlreadyFinalized(String action, String currentStatus) {
        return new InventoryCountException(
                Code.COUNT_ALREADY_FINALIZED,
                "Không thể " + action + " phiếu ở trạng thái " + currentStatus
        );
    }

    public static InventoryCountException invalidDifferenceSign(Integer differenceQuantity, java.math.BigDecimal differenceValue) {
        return new InventoryCountException(
                Code.INVALID_DIFFERENCE_SIGN,
                "Dữ liệu chênh lệch không hợp lệ: differenceQuantity=" + differenceQuantity
                        + ", differenceValue=" + differenceValue
        );
    }
}
