/**
 * input.jsx
 * Component UI trường nhập liệu (Input forms).
 * Áp dụng sẵn bộ css focus ring, disabled mode.
 */
import React from "react";
import { cn } from "./utils";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type} // Hỗ trợ đa dạng Text, password, number... mặc định về văn bản chuẩn
      className={cn(
        // Flexbox layout cho component kết hợp input, các màu bo cong đồng điệu design system
        "flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className // Pass xuống các ghi đè CSS Inline từ Component gọi đẻ chèn đè cn()
      )}
      ref={ref} // Forwarding Reference giúp các Form thư viện validate tracking được Element Dom Output này
      {...props}
    />
  );
});

Input.displayName = "Input"; // Đặt tên giúp Debug Component Tree trên trình duyệt rõ ràng

export { Input };