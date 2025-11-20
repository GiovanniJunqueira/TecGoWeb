import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputWithIconProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  altIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconClassName?: string;
  iconPosition?: "left" | "right";

  onIconClick?: () => void;
  toggleIcon?: boolean;
  iconState?: boolean;

  containerClassName?: string;
  leadingText?: string;
  trailingText?: string;
  error?: boolean;
  iconDisabled?: boolean;
}

export function InputWithIcon({
  icon: Icon = Search,
  altIcon: AltIcon,
  placeholder,
  className = "",
  iconClassName = "h-4 w-4",
  iconPosition = "left",

  onIconClick,
  toggleIcon = false,
  iconState = false,

  containerClassName = "",
  leadingText,
  trailingText,
  error = false,
  iconDisabled = false,
  disabled = false,

  ...props
}: InputWithIconProps) {
  const CurrentIcon = toggleIcon && iconState && AltIcon ? AltIcon : Icon;

  const leftPadding = iconPosition === "left" || leadingText ? "pl-9" : "";
  const rightPadding = iconPosition === "right" || trailingText ? "pr-9" : "";

  const iconAlignment = iconPosition === "left" ? "left-3" : "right-3";

  const errorClasses = error
    ? "border-destructive focus-visible:ring-destructive"
    : "";

  const isIconClickable = onIconClick && !disabled && !iconDisabled;

  return (
    <div
      className={cn("relative flex items-center w-full", containerClassName)}
    >
      {leadingText && (
        <span className="absolute left-3 text-sm text-acen-font-semibold">
          {leadingText}
        </span>
      )}

      <CurrentIcon
        className={cn(
          `absolute ${iconAlignment}`,
          iconClassName,
          isIconClickable ? "cursor-pointer" : "",
          disabled || iconDisabled ? "opacity-50" : ""
        )}
        onClick={isIconClickable ? onIconClick : undefined}
        aria-hidden={!isIconClickable}
        role={isIconClickable ? "button" : "presentation"}
      />

      <Input
        placeholder={placeholder}
        className={cn(leftPadding, rightPadding, errorClasses, className)}
        disabled={disabled}
        aria-invalid={error}
        {...props}
      />

      {trailingText && (
        <span className="absolute text-sm text-accent-foreground">
          {trailingText}
        </span>
      )}
    </div>
  );
}
