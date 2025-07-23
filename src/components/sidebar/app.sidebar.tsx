import * as React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "./sidebar.header";
import { SidebarContent } from "./sidebar.content";
import { SidebarFooter } from "./sidebar.footer";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} collapsible="icon" data-state="collapsed">
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
    </Sidebar>
  );
}
