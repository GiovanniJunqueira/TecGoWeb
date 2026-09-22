import { AppSidebar } from "@/components/sidebar/app.sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex h-screen flex-col">
      <SidebarProvider>
        <div className="flex flex-1 h-full">
          <AppSidebar />

          <main className="flex-1 w-full min-w-0 relative">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
