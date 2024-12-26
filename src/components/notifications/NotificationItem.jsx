import { X } from "lucide-react";
import { deleteNotification, markNotificationAsRead } from "../../api/notifications";

export default function NotificationItem({ notification, setNotifications }) {
  const handleDelete = async () => {
    await deleteNotification(notification.id);
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
  };

  return (
    <div className="flex justify-between items-center p-2 rounded-sm bg-gray-100 dark:bg-gray-800">
      <div>
        <p className="font-medium">{notification.title}</p>
        <p className="text-sm">{notification.message}</p>
      </div>
      <X className="w-4 h-4 cursor-pointer" onClick={handleDelete} />
    </div>
  );
}
