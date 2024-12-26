import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { StudentSidebar } from "../components/student-sidebar";
import { Toaster } from "../components/ui/toaster";

const StudentDashboardLayout = () => (
  <SidebarProvider>
    <StudentSidebar className="" />
    <SidebarInset>
      <main className="flex-1 p-6 bg-blue-50/5 dark:bg-background">
        <Outlet className=""/>
      </main>
      <Toaster />
    </SidebarInset>
  </SidebarProvider>
);

export default StudentDashboardLayout;
