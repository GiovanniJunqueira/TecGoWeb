import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { BreadCrumb } from "../breadcrumb/breadcrumb";

export function LayoutContentHeader() {
  const { open, isMobile } = useSidebar();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 flex h-16 items-center border-b z-20 bg-background",
        open && !isMobile ? "ml-64" : "md:ml-12 ml-0"
      )}
    >
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 bg-accent hidden md:flex"
          />
          <BreadCrumb />
        </div>
      </div>
    </header>
  );
}
