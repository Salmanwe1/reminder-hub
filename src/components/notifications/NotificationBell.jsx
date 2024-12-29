import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import NotificationList from "./NotificationList";
import { useAuth } from "../../context/AuthContext";
import { fetchNotifications } from "../../api/notifications";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../api/firebase";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Real-time listener for notifications
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter((n) => !n.isRead).length);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Popover className="">
      <PopoverTrigger asChild>
        <Button className="relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-11/12 mx-auto md:w-[500px]">
        <ScrollArea className="max-h-80">
          <NotificationList notifications={notifications} setNotifications={setNotifications} />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
