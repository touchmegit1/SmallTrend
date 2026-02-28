/**
 * card.jsx
 * Component UI kiến trúc dạng Khối Hộp (Card).
 * Cấu trúc bao gồm Container bao bọc, Header (chứa Title), Body content, và Footer (Nút Submit).
 */
import React from "react";
import { cn } from "./utils";

/**
 * Component Wrapper chứa tổng viền.
 */
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className
      )}
      {...props}
    />
  );
}

/**
 * Phần đầu khung (Chứa Nút Tool/Tiêu đề).
 */
function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

/**
 * Chữ tiêu đề nổi bật cấu hình h4 HTML
 */
function CardTitle({ className, ...props }) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

/**
 * Text text-muted font nhỏ, nhằm giải thích mô tả khối block
 */
function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * Chứa Menu tuỳ chọn hoặc Group Button mở góc trên phải (Self-start justify-end)
 */
function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

/**
 * Phần lõi Content chính ôm lấy nội dung (Padding trong)
 */
function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

/**
 * Đáy Box chân thẻ Card (Padding)
 */
function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
