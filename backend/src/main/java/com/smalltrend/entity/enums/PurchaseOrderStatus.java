package com.smalltrend.entity.enums;

public enum PurchaseOrderStatus {
    DRAFT,          // Nháp
    PENDING,        // Chờ duyệt
    APPROVED,       // Đã duyệt
    ORDERED,        // Đã đặt hàng
    PARTIAL,        // Nhận một phần
    RECEIVED,       // Đã nhận đủ
    CANCELLED       // Đã hủy
}
