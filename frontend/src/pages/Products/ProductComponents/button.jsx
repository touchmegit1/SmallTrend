import React, { useMemo } from "react";
import PropTypes from "prop-types";

const baseClass =
    "inline-flex items-center justify-center rounded-md font-medium transition";

const variantClass = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
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
    onClick,
    disabled = false,
}) {
    const className = useMemo(() => {
        return `${baseClass} ${variantClass[variant] || variantClass.primary} ${sizeClass[size] || sizeClass.md} ${disabled ? "opacity-50 cursor-not-allowed" : ""
            }`.trim();
    }, [variant, size, disabled]);

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={className}
        >
            {children}
        </button>
    );
}

Button.propTypes = {
    children: PropTypes.node,
    variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
};

export default Button;
