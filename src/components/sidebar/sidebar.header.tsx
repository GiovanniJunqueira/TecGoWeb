import {
  SidebarHeader as UiSidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth/auth.context";

export function SidebarHeader() {
  const { school } = useAuth();

  return (
    <UiSidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="/" className="flex items-center gap-3">
              <img
                src={school?.logoUrl || ""}
                alt={school?.name || ""}
                className="size-8 rounded-lg"
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-semibold">
                  {school?.name || "" }
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
