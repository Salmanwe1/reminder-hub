import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../api/firebase";
import { Toast } from "./ui/toast";
import EditReminderDialog from "./EditReminderDialog";
import ViewReminderDialog from "./ViewReminderDialog";
import DeleteReminderDialog from "./DeleteReminderDialog";
import { deleteReminder } from "../api/reminders";
import { useAuth } from "../context/AuthContext";  // Import useAuth

export const columns = [
  {
    id: "statusToggle",
    header: "Completed?",
    cell: ({ row }) => {
      const reminder = row.original; // Access the full reminder object
      const isCompleted = reminder.status === "Completed";

      const handleStatusToggle = async () => {
        const newStatus = isCompleted
          ? new Date(reminder.dueDate) < new Date()
            ? "Overdue"
            : "Upcoming"
          : "Completed";

        try {
          // Update Firestore
          const reminderRef = doc(db, "reminders", reminder.id);
          await updateDoc(reminderRef, { status: newStatus });

          // Optimistically update the local row data
          row.original.status = newStatus;
          Toast({ description: `Status updated to ${newStatus}!` });
        } catch (error) {
          console.error("Error updating status:", error);
          Toast({
            description: "Failed to update status.",
            variant: "destructive",
          });
        }
      };

      return (
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleStatusToggle}
          aria-label="Toggle reminder status"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const reminder = row.original;
      return (
        <div className="flex items-center gap-2">
           {reminder.assignedBy === "Teacher" && (
          <Badge className="ml-1 bg-red-500 text-white">
            {reminder.assignedBy}
          </Badge>
        )}
          {reminder.title}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.category}</span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority || "Unknown";
      const priorityColor =
        priority === "high"
          ? "text-red-500"
          : priority === "medium"
          ? "text-yellow-500"
          : priority === "low"
          ? "text-green-500"
          : "text-gray-500";

      return <span className={`capitalize ${priorityColor}`}>{priority}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Start Date",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      if (!createdAt || isNaN(new Date(createdAt))) {
        return "Invalid Date"; // Fallback for invalid or missing dates
      }
      return format(new Date(createdAt), "EEE dd MMM, yyyy");
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      if (!dueDate || isNaN(new Date(dueDate))) {
        return "Invalid Date"; // Fallback
      }
      return format(new Date(dueDate), "EEE dd MMM, yyyy");
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "Unknown";
      const statusColor =
        status === "Completed"
          ? "text-green-500"
          : status === "Overdue"
          ? "text-red-500"
          : status === "Upcoming"
          ? "text-yellow-500"
          : "text-gray-500";

      return <span className={`capitalize ${statusColor}`}>{status}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const reminder = row.original;
      const { user, role } = useAuth();  // Fetch user and role
      const isStudentAssigned = reminder.assignedBy === "Teacher";  // Flag for teacher-assigned reminders

      const handleDelete = () => {
        deleteReminder(reminder.id, user.uid, role);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             {/* View Action */}
             <DropdownMenuItem asChild>
              <ViewReminderDialog reminder={reminder} />
            </DropdownMenuItem>
             {/* Conditionally Render Edit for Student's Own Reminders */}
          {!isStudentAssigned && (
            <DropdownMenuItem asChild>
                <EditReminderDialog
                  reminder={reminder}
                  onReminderUpdate={(updatedReminder) => {
                    // Update the row data after editing
                    row.original = updatedReminder;
                  }}
                />
            </DropdownMenuItem>
          )}
             {/* Delete Reminder */}
             <DropdownMenuItem asChild>
              <DeleteReminderDialog reminder={reminder} onDelete={handleDelete} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
