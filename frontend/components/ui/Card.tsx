import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "interactive";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  const baseClasses = "rounded-2xl transition-all duration-150";

  const variantClasses = {
    default:
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs",
    elevated:
      "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md shadow-slate-900/5",
    flat:
      "bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60",
    interactive:
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-md cursor-pointer",
  }[variant];

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-base font-bold text-slate-900 dark:text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`p-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
