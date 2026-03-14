package com.smalltrend.entity.enums;

public enum PurchaseOrderStatus {
    DRAFT,           // Phiếu tạm (nhân viên lưu nháp)
    PENDING,         // Chờ duyệt (nhân viên gửi)
    CONFIRMED,       // Đã duyệt (quản lý chấp nhận) — chờ NV kho kiểm kê
    REJECTED,        // Từ chối (quản lý từ chối, nhân viên sửa lại)
    CHECKING,        // Đang kiểm kê (NV kho đang đối chiếu hàng với hợp đồng)
    RECEIVED,        // Đã nhập kho (NV kho xác nhận, cập nhật stock)
    ORDERED,         // Đã đặt hàng
    CANCELLED        // Hủy
}
