package com.smalltrend.exception;

/**
 * Exception dùng riêng cho module CRM.
 * Phân biệt lỗi NOT_FOUND và DUPLICATE để GlobalExceptionHandler
 * trả HTTP status phù hợp (404 / 409).
 */
public class CrmException extends RuntimeException {

    public enum Code {
        NOT_FOUND,
        DUPLICATE_PHONE,
        INVALID_INPUT
    }

    private final Code code;

    public CrmException(Code code, String message) {
        super(message);
        this.code = code;
    }

    public Code getCode() {
        return code;
    }

    // ── factory helpers ──────────────────────────────────────────────────────

    public static CrmException customerNotFound(Integer id) {
        return new CrmException(Code.NOT_FOUND,
                "Không tìm thấy khách hàng với ID: " + id);
    }

    public static CrmException customerNotFoundByPhone(String phone) {
        return new CrmException(Code.NOT_FOUND,
                "Không tìm thấy khách hàng với số điện thoại: " + phone);
    }

    public static CrmException duplicatePhone(String phone) {
        return new CrmException(Code.DUPLICATE_PHONE,
                "Số điện thoại '" + phone + "' đã được đăng ký cho khách hàng khác.");
    }
}
