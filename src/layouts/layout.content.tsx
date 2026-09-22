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
    <div className="flex flex-col h-full min-w-0">
      <LayoutContentHeader  />

      <div className="flex flex-col h-full mt-16 overflow-auto min-w-0">
        <div className="flex-1 p-6 min-w-0">
          <div className={cn("flex flex-col min-w-0", className)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
