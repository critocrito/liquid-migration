import c from "clsx";
import React from "react";

interface ButtonProps {
  onClick: () => void;
  label: string;
  type?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
  ref?: React.MutableRefObject<null>;
}

const Button = ({
  onClick,
  label,
  type = "primary",
  disabled = false,
  className,
  ref,
}: ButtonProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      className={c(
        "rounded-md py-2 px-4 text-sm font-medium shadow-sm disabled:opacity-50 disabled:pointer-none",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        {
          "border border-transparent bg-gray-900 text-white hover:bg-gray-700 hover:text-white":
            type === "primary",
          "border border-gray-300 bg-white  text-gray-700 hover:bg-gray-50":
            type === "secondary",
        },
        className,
      )}
    >
      {label}
    </button>
  );
};

export default Button;
