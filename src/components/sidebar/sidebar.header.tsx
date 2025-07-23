import {
  SidebarHeader as UiSidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { environment } from "@/config";

export function SidebarHeader() {
  return (
    <UiSidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="/" className="flex items-center gap-3">
              <img
                src={environment.DEALERSHIP.LOGO}
                alt={environment.DEALERSHIP.NAME}
                className="size-8 rounded-lg"
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-semibold">
                  {environment.DEALERSHIP.NAME}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Painel Operacional
                </span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </UiSidebarHeader>
  );
}
