import { FilePlus2, Home, LogOut, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "./ui/sidebar";
// Modal-related imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../api/firebase";
import { useState } from "react";
import logoTransparent from "../assets/images/logo_transparent.png"


// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/teacher/dashboard",
    icon: Home,
  },
  {
    title: "Create a Reminder",
    url: "/teacher/create-reminder",
    icon: FilePlus2,
  },
  {
    title: "Settings",
    url: "/teacher/settings",
    icon: Settings,
  },
];

export function TeacherSidebar() {
  const [isOpen, setIsOpen] = useState(false); // State for modal visibility

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login"; // Redirect to login after logout
  };

  return (
    <Sidebar variant="floating" collapsible="icon" className="">
      <SidebarHeader className="">
          <img src={logoTransparent} alt="" />
      </SidebarHeader>
      <SidebarContent className="">
        <SidebarGroup className="">
          <SidebarGroupLabel className="text-white">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} onClick={item.onclick} className="font-semibold text-white">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuAction className="peer-data-[active=true]/menu-button:opacity-100" />
                </SidebarMenuItem>
              ))}
               {/* Logout Item with Modal Trigger */}
               <SidebarMenuItem>
                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton
                      className="flex items-center  rounded-lg hover:text-white hover:bg-red-700"
                      onClick={() => setIsOpen(true)}
                    >
                      <LogOut className="text-white" />
                      <span className="font-semibold text-white">Logout</span>
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to logout? You will need to log in again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setIsOpen(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Yes, logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
