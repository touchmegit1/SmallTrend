import React, { useMemo } from "react";
import PropTypes from "prop-types";

const baseClass =
  "inline-flex items-center justify-center rounded-md font-medium transition";

const variantClass = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  secondary: "bg-gray-200 text-black hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
};

const sizeClass = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4",
  lg: "h-10 px-6 text-lg",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const finalClassName = useMemo(() => {
    return [
      baseClass,
      variantClass[variant] || variantClass.primary,
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
