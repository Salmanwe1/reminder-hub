import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { Toaster } from "../components/ui/toaster";
import { TeacherSidebar } from "../components/teacher-sidebar";

const TeacherDashboardLayout = () => (
  <SidebarProvider>
    <TeacherSidebar className="" />
    <SidebarInset>
      <main className="flex-1 p-6 dark:bg-background">
        <Outlet />
      </main>
      <Toaster />
    </SidebarInset>
  </SidebarProvider>
);

export default TeacherDashboardLayout;
