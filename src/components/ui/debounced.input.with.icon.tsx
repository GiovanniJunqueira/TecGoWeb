import { type ChangeEvent, useEffect, useState, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { InputWithIcon } from "@/components/ui/input.with.icon";
import { useDebounce } from "@/hooks/use.debounce";

export interface DebouncedInputWithIconProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  placeholder?: string;
  className?: string;
  iconClassName?: string;
  icon: LucideIcon;
  value: string;
  onChange?: (value: string) => void;
  debounceTime?: number;
}

export function DebouncedInputWithIcon({
  placeholder,
  className,
  iconClassName,
  icon,
  value,
  onChange,
  debounceTime = 600,
  ...restProps
}: DebouncedInputWithIconProps) {
  const [inputValue, setInputValue] = useState(value);

  const userHasTyped = useRef(false);

  const isFirstMount = useRef(true);

  const isExternalUpdate = useRef(false);

  const debouncedValue = useDebounce(inputValue, debounceTime);

  useEffect(() => {
    if (value !== inputValue && !userHasTyped.current) {
      isExternalUpdate.current = true;
      setInputValue(value);
    }
  }, [value, inputValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    userHasTyped.current = true;
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    if (onChange && debouncedValue !== value && userHasTyped.current) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <InputWithIcon
      placeholder={placeholder}
      className={className}
      iconClassName={iconClassName}
      icon={icon}
      value={inputValue}
      onChange={handleInputChange}
      {...restProps}
    />
  );
}
