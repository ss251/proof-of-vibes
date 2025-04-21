import React from "react";
import { cn } from "~/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({ 
  children, 
  className = "", 
  isLoading = false, 
  variant = "default",
  size = "default",
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variantStyles = {
    default: "bg-[#B69BC7] text-white hover:bg-[#a78ab6]",
    outline: "border border-gray-600 bg-transparent hover:bg-gray-800 text-white",
    ghost: "hover:bg-gray-800 text-white",
    link: "underline-offset-4 hover:underline text-white"
  };
  
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-lg",
    icon: "h-10 w-10"
  };
  
  return (
    <button
      className={cn(
        baseStyles, 
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{typeof children === 'string' ? 'Loading...' : children}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
