import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Eye } from "lucide-react";

export default function ViewReminderDialog({ reminder }) {
  if (!reminder) return null; // Prevent rendering if no reminder is passed

  const {
    title,
    description,
    dueDate,
    category,
    priority,
    status,
    createdAt,
    assignedBy,
  } = reminder;

  return (
    <Dialog>
      <DialogTrigger asChild className="w-full flex justify-start gap-4 pl-2">
        <Button variant="ghost"><Eye className="text-blue-500"/><span>View</span></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-auto">
        <DialogHeader>
          <DialogTitle>Reminder Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <strong>Title:</strong> <span>{title}</span>
          </div>

          {/* Description */}
          <div>
            <strong>Description:</strong>{" "}
            <p>{description || "No description provided."}</p>
          </div>

          {/* Created At */}
          <div>
            <strong>Created At:</strong>{" "}
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>

          {/* Due Date */}
          <div>
            <strong>Due Date:</strong>{" "}
            <span>{new Date(dueDate).toLocaleDateString()}</span>
          </div>

          {/* Category */}
          <div>
            <strong>Category:</strong> <span>{category}</span>
          </div>

          {/* Priority */}
          <div>
            <strong>Priority:</strong> <span>{priority}</span>
          </div>

          {/* Status */}
          <div>
            <strong>Status:</strong> <span>{status}</span>
          </div>

          {/* Assigned By */}
          <div>
            <strong>Assigned By:</strong> <span>{assignedBy}</span>
          </div>

          
        </div>
      </DialogContent>
    </Dialog>
  );
}
