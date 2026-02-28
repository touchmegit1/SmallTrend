/**
 * button.jsx
 * Component UI chuẩn Nút Bấm.
 * Đóng gói logic chuyển đổi màu sắc, các trạng thái loading/disabled 
 * cũng như kích cỡ size tuỳ chỉnh dùng chung.
 */
import React, { useMemo } from "react";
import PropTypes from "prop-types";

// Class nền CSS chung bắt buộc phải có cho Button
const baseClass =
  "inline-flex items-center justify-center rounded-md font-medium transition";

// Danh mục Bảng màu hệ thống Button (Theme Variant)
const variantClass = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  secondary: "bg-gray-200 text-black hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
};

// Cấu hình Kích cỡ Nút (Size Scale)
const sizeClass = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4",
  lg: "h-10 px-6 text-lg",
};

/**
 * @param {React.ReactNode} children Nội dung Text hoặc Icon chứa trong Nút
 * @param {string} variant Tuỳ chọn loại nút theo theme (primary, warning, danger...)
 * @param {string} size Tuỳ chọn kích thuớc (sm, md, lg)
 * @param {boolean} disabled Cờ tắt hoặc bật trạng thái Disable Form Input (Ngầm cấm click)
 * @param {string} className Ghi đè tự do class Tailwind
 */
function Button({
  children,
  variant = "primary", // Mặc định là Màu xanh (Hành động chính)
  size = "md", // Mặc định cỡ vừa
  disabled = false,
  className = "",
  ...props
}) {
  // Gộp thông qua useMemo để chỉ update Render React Component một lần khi có thay đổi các Option Input
  const finalClassName = useMemo(() => {
    return [
      baseClass,
      variantClass[variant] || variantClass.primary, // Cẩn phòng fallback lấy default
      sizeClass[size] || sizeClass.md,
      disabled && "opacity-50 cursor-not-allowed",
      className,
    ]
      .filter(Boolean)
      .join(" ");
  }, [variant, size, disabled, className]);

  return (
    <button
      {...props}
      disabled={disabled}
      className={finalClassName}
    >
      {children}
    </button>
  );
}

// Check Props Type ràng buộc lỗi
Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "success",
    "ghost",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
