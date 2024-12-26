import { Separator } from "@radix-ui/react-dropdown-menu"
import { SidebarTrigger } from "./ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb"
import { ModeToggle } from "./ModeToggle"
import NotificationBell from "./notifications/NotificationBell"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../api/firebase"

function Header({role, page}) {
  const [name, setName] = useState("");  // State to hold user name
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;  // Get the currently logged-in user
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setName(userDoc.data().name);  // Update state with user's name
          } else {
            console.error("User document not found.");
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    fetchUserName();
  }, []);
  return (
    <header className="flex bg-gradient-to-r from-[#1d1d46] to-[#3b4371] dark:bg-gradient-to-r dark:from-[#f3904f] dark:to-[#3b4371] rounded-lg px-5 h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
    <div className="flex items-center gap-2 px-4">
      <SidebarTrigger className="-ml-5 text-white" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <ModeToggle />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:flex items-center">
            <BreadcrumbLink href="#" className="text-lg font-bold text-white dark:text-white">
            {name || role}  {/* Display user name or fallback to 'role' */}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-lg font-bold text-muted-foreground text-white dark:text-white">{page}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <NotificationBell />
  </header>
  )
}

export default Header