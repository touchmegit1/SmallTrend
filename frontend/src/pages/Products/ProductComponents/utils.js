/**
 * utils.js
 * Chứa các hàm và tiện ích hỗ trợ dùng chung cho toàn bộ các Component Giao diện (UI).
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Hàm cn (ClassNames):
 * Giúp tự động hợp nhất các class của TailwindCSS.
 * Tác dụng: Ngăn chặn xung đột CSS khi kế thừa linh hoạt (ví dụ truyền p-4 đè lên p-2).
 * 
 * @param {...any} inputs Mảng các class string hoặc điều kiện logic
 * @returns {string} Chuỗi danh sách class đã được gạn lọc và làm sạch
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
