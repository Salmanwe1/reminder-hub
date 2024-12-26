import { useState } from "react";
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
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";
import { deleteReminder } from "../api/reminders";
import { Loader, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DeleteReminderDialog({ reminder, onDelete }) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, role } = useAuth();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
       // Ensure we pass studentIds to trigger notifications
    await deleteReminder(reminder.id, user.uid, role, reminder.studentIds || []);

    // Call the onDelete to remove from UI
    onDelete(reminder.id);
      toast({ description: "Reminder deleted successfully!" });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        description: "Failed to delete reminder.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        asChild
        className="w-full flex justify-start gap-5 pl-2"
      >
        <Button variant="ghost">
          <Trash2 className="text-red-500" />
          <span>Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this reminder? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin  mx-auto" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
