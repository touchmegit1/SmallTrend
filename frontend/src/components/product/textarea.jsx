/**
 * textarea.jsx
 * UI Box TextArea dành nội dung văn bản đoạn (Nhiều dòng Enter).
 * Áp dụng bo góc form focus ring đồng nhất.
 */
import * as React from "react";
import { cn } from "./utils";

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Khoá kích cỡ resize-none giúp UX khỏi bóp méo, 
        // focus-visible tự động phủ viền ngoài ring khi nhấp tab
        // field-sizing-content min-h-25 giữ 1 height cứng căn chỉnh padding
        "resize-none border-input placeholder:text-muted-foreground " +
        "focus-visible:border-ring focus-visible:ring-ring/50 " +
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 " +
        "aria-invalid:border-destructive dark:bg-input/30 " +
        "flex field-sizing-content min-h-25 w-full rounded-md border " +
        "bg-input-background px-3 py-2 text-base " +
        "transition-[color,box-shadow] outline-none focus-visible:ring-[3px] " +
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props} // Có thể đón row={6}, onChange event, name, id.
    />
  );
}

export { Textarea };