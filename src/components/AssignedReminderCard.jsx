import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import { MoreHorizontal, Users, User } from "lucide-react";
import EditReminderDialog from "./EditReminderDialog";
import DeleteReminderDialog from "./DeleteReminderDialog";
import { updateReminder, deleteReminder } from "../api/reminders";
import { useState } from "react";
import { auth } from "../api/firebase";
import { useAuth } from "../context/AuthContext";
import ViewReminderDialog from "./ViewReminderDialog";

function AssignedReminderCard({ reminder }) {
  const [status, setStatus] = useState(reminder.status);
  const { user, role } = useAuth(); // Use role from context

  const handleStatusChange = async () => {
    const newStatus =
      status === "Completed"
        ? new Date(reminder.dueDate) < new Date()
          ? "Overdue"
          : "Upcoming"
        : "Completed";

    setStatus(newStatus);
    try {
      await updateReminder(reminder.id, { status: newStatus }, true);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (reminderId) => {
    try {
      await deleteReminder(
        reminderId,
        user.uid,
        role,
        reminder.studentIds || []
      );
    } catch (error) {
      console.error("Failed to delete reminder", error);
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case "Completed":
        return "bg-green-200 text-black";
      case "Overdue":
        return "bg-red-300 text-black";
      case "Upcoming":
      default:
        return "bg-yellow-200 text-black";
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm relative">
      {/* Three-dot menu for actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* View Action */}
          <DropdownMenuItem asChild>
            <ViewReminderDialog reminder={reminder} />
          </DropdownMenuItem>
          {/* Edit Action */}
          <DropdownMenuItem asChild>
            <EditReminderDialog
              reminder={reminder}
              onReminderUpdate={(updatedReminder) =>
                updateReminder(updatedReminder.id, updatedReminder, true)
              }
            >
              Edit
            </EditReminderDialog>
          </DropdownMenuItem>

          {/* Delete Action */}
          <DropdownMenuItem asChild>
            <DeleteReminderDialog reminder={reminder} onDelete={handleDelete} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Switch */}
      <div className="absolute top-4 right-11">
        <Switch
          checked={status === "Completed"}
          onCheckedChange={handleStatusChange}
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 line-clamp-1">
        {reminder.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {reminder.description || "No description provided"}
      </p>

      {/* Metadata */}
      <div className="flex items-center flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold">Due Date:</span>
          <Badge variant="outline" className="ml-1">
            {new Date(reminder.dueDate).toLocaleDateString()}
          </Badge>
        </div>

        <div>
          <span className="text-xs font-bold">Category:</span>
          <Badge variant="outline" className="ml-2 capitalize">
            {reminder.category}
          </Badge>
        </div>

        <div>
          <span className="text-xs font-bold">Priority:</span>
          <Badge variant="outline" className="ml-1 capitalize">
            {reminder.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">Status:</span>
          <Badge className={`ml-1 capitalize ${getStatusStyles()}`}>
            {status}
          </Badge>
        </div>

        {/* Assigned To Section */}
        <div className="flex items-center">
          <span className="text-xs font-bold flex items-center gap-1">
            Assigned to:
            {reminder.groupId?.length > 0 ? (
              <Users className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </span>
          <Badge variant="outline" className="ml-1 capitalize">
            {reminder.groupId?.length > 0
              ? `Group (${reminder.groupId.length})`
              : `${reminder.studentIds?.length || 0} students`}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default AssignedReminderCard;
