
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "../hooks/use-toast";
import { updateReminder } from "../api/reminders";
import { Loader, Edit } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

export default function EditReminderDialog({ reminder, onReminderUpdate }) {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(reminder.title || "");
  const [description, setDescription] = useState(reminder.description || "");
  const [category, setCategory] = useState(reminder.category || "");
  const [priority, setPriority] = useState(reminder.priority || "medium");
  const [dueDate, setDueDate] = useState(
    reminder.dueDate && !isNaN(new Date(reminder.dueDate).getTime())
      ? new Date(reminder.dueDate)
      : null
  );

  const handleSave = async () => {
    // if (!title || !dueDate || !category || !priority) {
    //   toast({ description: "All fields are required!" });
    //   return;
    // }

    setIsSaving(true);
    try {
      const updatedReminder = {
        ...reminder,
        title,
        description,
        category,
        priority,
        dueDate: dueDate ? dueDate.toISOString() : reminder.dueDate,  // Fallback to original due date
      };

      await updateReminder(reminder.id, updatedReminder, reminder.assignedBy === "Teacher");
      onReminderUpdate(updatedReminder);
      toast({ description: "Reminder updated successfully!" });
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast({ description: "Failed to update reminder.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="w-full flex justify-start gap-5 pl-2">
        <Button variant="ghost"><Edit className="text-green-500"/><span>Edit</span></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Edit Reminder</DialogTitle>
          <DialogDescription>
            Make changes to your reminder. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

           {/* Due Date */}
           <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Priority</SelectLabel>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader className="w-6 h-6 animate-spin  mx-auto" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
