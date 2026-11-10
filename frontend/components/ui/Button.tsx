"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-px";

    const variantClasses = {
      primary:
        "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/25 focus:ring-indigo-500 border border-transparent",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 focus:ring-slate-400 border border-slate-200 dark:border-slate-700",
      outline:
        "border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 focus:ring-indigo-500",
      ghost:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-slate-400 border border-transparent",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/25 focus:ring-rose-500 border border-transparent",
      success:
        "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25 focus:ring-emerald-500 border border-transparent",
    }[variant];

    const sizeClasses = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs md:text-sm px-4 py-2.5 gap-2",
      lg: "text-sm md:text-base px-6 py-3.5 gap-2.5",
      icon: "p-2 aspect-square",
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
