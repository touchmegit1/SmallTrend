/**
 * table.jsx
 * Xây dựng UI kiến trúc Bảng lưới (Table) hiển thị Data List chuẩn hệ thống.
 * Chia Component thành từng Node nhỏ (Thead, Tbody, Tr, Td) để điều khiển linh hoạt.
 */
import React from "react";
import { cn } from "./utils";

/**
 * Box bao bọc (Container). Ngăn tràn bằng thanh cuộn dọc (X-auto).
 */
function Table({ className, ...props }) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

/**
 * Ngăn tiêu đề bảng (Thường chứa tên các cột table). 
 */
function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

/**
 * Vùng chứa khối data nội dung kết xuất.
 */
function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

/**
 * Đáy bảng chứa Summary (Vd Tổng tiền, phân trang cuối cùng).
 */
function TableFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

/**
 * Dòng kẻ ngang, hỗ trợ Hover hiệu ứng màu nền để rõ ràng dòng cho User.
 */
function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

/**
 * Từng cục ô tên cột trên Header. Đổ nền tối hơn bảng để tách biệt khu vực
 */
function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "bg-gray-100 text-foreground h-10 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Từng Cell ô Data hiển thị Content, có padding chuẩn giãn cách không dính lưới table.
 */
function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "text-sm p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Ghi chú caption giải thích cả table
 */
function TableCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
