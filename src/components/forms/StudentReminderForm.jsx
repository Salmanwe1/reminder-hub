import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { format, isBefore } from "date-fns";
import { Calendar as CalendarIcon, Loader } from "lucide-react";
import { cn } from "../../lib/utils";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { createReminder } from "../../api/reminders";
import { auth } from "../../api/firebase";

function ReminderForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium"); // Default priority
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!title || !date || !category || !priority) {
      toast({ description: "All fields are required!" });
      return;
    }

    if (isBefore(new Date(date), new Date())) {
      toast({ description: "You cannot select a past date." });
      return;
    }

    setIsLoading(true);

    try {
      const reminderData = {
        title,
        description,
        dueDate: new Date(date).toISOString(),
        category,
        priority, // Add priority
        status: "Upcoming", // Default status
        assignedBy: "Self",
        creatorId: auth.currentUser.uid,
        // studentIds: [auth.currentUser.uid], 
        // groupId: [], 
      };

      await createReminder(reminderData);
      toast({ description: "Reminder created successfully!" });

      // Reset form fields
      setTitle("");
      setDescription("");
      setDate(null);
      setCategory("");
      setPriority("medium");
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({ description: "Failed to create reminder. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          placeholder="Add title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="max-w-[500px]"
        />
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="max-w-[600px]"
        />
      </div>

      {/* Date Picker */}
      <div className="space-y-2 flex flex-col">
        <Label htmlFor="dueDate">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(day) => isBefore(day, new Date())} // Disable past dates
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value)}
          required
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="exam">Exam</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Selector */}
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={priority}
          onValueChange={(value) => setPriority(value)}
          required
        >
          <SelectTrigger className="w-[180px]">
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

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <Loader className="w-6 h-6 animate-spin mx-auto" />
        ) : (
          "Create Reminder"
        )}
      </Button>
    </form>
  );
}

export default ReminderForm;
