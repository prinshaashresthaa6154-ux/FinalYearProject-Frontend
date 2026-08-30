import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
};

const variants = {
  primary: "border border-brand bg-brand text-white hover:border-brand-dark hover:bg-brand-dark",
  secondary: "border border-accent bg-white text-accent hover:bg-accent hover:text-white",
  danger: "border border-brand bg-white text-brand hover:bg-brand hover:text-white",
  ghost: "border border-transparent text-muted hover:bg-black/[0.05] hover:text-black",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
