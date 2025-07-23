import { LayoutContentHeader } from "@/components/header/layout.content.header";
import { cn } from "@/lib/utils";

type LayoutContentProps = {
  children: React.ReactNode;
  className?: string;
  process?: () => void;
  csvName?: string;
  label?: string;
};

export function LayoutContent({
  children,
  className,
}: LayoutContentProps) {
  return (
    <div className="flex flex-col h-full">
      <LayoutContentHeader  />

      <div className="flex flex-col h-full mt-16 overflow-auto">
        <div className="flex-1 p-6">
          <div className={cn("flex flex-col", className)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
