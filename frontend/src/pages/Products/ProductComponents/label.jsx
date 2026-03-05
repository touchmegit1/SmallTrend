/**
 * label.jsx
 * Component hỗ trợ định nghĩa UI / Liên kết chuỗi cho Form Input Field.
 * Radix-UI Label Primitive giúp Accessibilty bằng cách gắn label kết nối htmlFor.
 */
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "./utils";

function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // Căn flex, không cho chọn văn bản text-select, định dạng padding chuẩn
        "flex items-center gap-2 text-md leading-none font-medium select-none " +
        "group-data-[disabled=true]:pointer-events-none " + // Ẩn click khi form disabled nguyên cụm group
        "group-data-[disabled=true]:opacity-50 " + // Khử màu chữ 
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className // Các bổ sung từ bên ngoài (Như text-red-500, hay margin tự do...)
      )}
      {...props} // Đón nhận htmlFor truyền vào
    />
  );
}

export { Label };
