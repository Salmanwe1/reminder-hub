import NotificationItem from "./NotificationItem";
import { Button } from "../ui/button";
import { clearAllNotifications, markNotificationAsRead } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";

export default function NotificationList({ notifications, setNotifications }) {
  const { user } = useAuth();

  const handleClearAll = async () => {
    await clearAllNotifications(user.uid);
    setNotifications([]);
  };

  const handleMarkAsRead = async () => {
    notifications.forEach((notification) => {
      if (!notification.isRead) {
        markNotificationAsRead(notification.id);
      }
    });

    setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    };

  return (
    <div className="space-y-4 p-2 md:p-4">
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-lg">Notifications</h3>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleMarkAsRead}>
          Mark All as Read
        </Button>
        <Button variant="destructive" onClick={handleClearAll}>
          Clear All
        </Button>
      </div>
    </div>
    {notifications.length > 0 ? (
      notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          setNotifications={setNotifications}
        />
      ))
    ) : (
      <p className="text-gray-500 text-center">No notifications</p>
    )}
  </div>
  );
}
