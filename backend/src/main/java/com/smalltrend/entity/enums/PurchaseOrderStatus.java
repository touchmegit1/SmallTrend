package com.smalltrend.entity.enums;

public enum PurchaseOrderStatus {
    DRAFT,           // Phiếu tạm (nhân viên lưu nháp)
    PENDING,         // Chờ duyệt (nhân viên gửi)
    CONFIRMED,       // Đã duyệt (quản lý chấp nhận, cập nhật stock)
    REJECTED,        // Từ chối (quản lý từ chối, nhân viên sửa lại)
    ORDERED,         // Đã đặt hàng
    RECEIVED,        // Đã nhận
    CANCELLED        // Hủy
}
