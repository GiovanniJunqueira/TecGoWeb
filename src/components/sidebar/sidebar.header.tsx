import {
  SidebarHeader as UiSidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarHeader() {
  return (
    <UiSidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="/" className="flex items-center gap-3">
              <img
                src="logos/opencollective-svgrepo-com.svg"
                alt="TechGo Logo"
                className="size-8 rounded-lg"
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-semibold">TechGo</span>
                <span className="truncate text-xs text-muted-foreground">
                  Painel operacional
                </span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </UiSidebarHeader>
  );
}
