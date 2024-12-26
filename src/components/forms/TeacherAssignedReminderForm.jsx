import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { createReminder } from "../../api/reminders";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../../api/firebase";
import { useToast } from "../../hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import { format, isBefore } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Loader } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";

function TeacherAssignedReminderForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [date, setDate] = useState("");
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupStudents, setNewGroupStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsSnapshot = await getDocs(collection(db, "users"));
        const allStudents = studentsSnapshot.docs
          .filter((doc) => doc.data().role === "student")
          .map((doc) => ({ id: doc.id, ...doc.data() }));
        setStudents(allStudents);

        const groupsSnapshot = await getDocs(collection(db, "groups"));
        const allGroups = groupsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(allGroups);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !date ||
      (!selectedStudents.length && !selectedGroups.length) ||
      !category ||
      !priority
    ) {
      toast({ description: "Please complete all required fields." });
      return;
    }

    if (isBefore(new Date(date), new Date())) {
      toast({ description: "You cannot select a past date." });
      return;
    }

    setIsLoading(true);

    try {
      let expandedStudentIds = [...selectedStudents]; // Start with selected students

      // Expand groups to get individual student IDs
      if (selectedGroups.length) {
        const groupSnapshots = await getDocs(collection(db, "groups"));
        selectedGroups.forEach((groupId) => {
          const group = groupSnapshots.docs.find((doc) => doc.id === groupId);
          if (group) {
            expandedStudentIds.push(...group.data().studentIds);
          }
        });
        expandedStudentIds = [...new Set(expandedStudentIds)]; // Remove duplicates
      }
      const reminderData = {
        title,
        description,
        dueDate: new Date(date).toISOString(),
        category,
        priority,
        status: "Upcoming",
        assignedBy: "Teacher",
        creatorId: auth.currentUser.uid,
        studentIds: expandedStudentIds,
        groupId: selectedGroups,
      };

      await createReminder(reminderData, expandedStudentIds);
      toast({ description: "Reminder created successfully!" });

      setTitle("");
      setDescription("");
      setDate(null);
      setCategory("");
      setPriority("medium");
      setSelectedStudents([]);
      setSelectedGroups([]);
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({ description: "Failed to create reminder." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || newGroupStudents.length === 0) {
      toast({
        description: "Please provide a group name and select students.",
      });
      return;
    }

    try {
      const groupData = {
        groupName: newGroupName,
        studentIds: newGroupStudents,
      };
      const groupRef = await addDoc(collection(db, "groups"), groupData);

      setGroups([...groups, { id: groupRef.id, ...groupData }]);
      toast({ description: "Group created successfully!" });

      setNewGroupName("");
      setNewGroupStudents([]);
    } catch (error) {
      console.error("Error creating group:", error);
      toast({ description: "Failed to create group." });
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

      <Separator />

      <h3 className="font-semibold text-2xl">Assign to Students</h3>
      <div className="space-y-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4 ">
        <div className="col-span-full mb-5 flex items-center">
          <Checkbox
            id="selectAll"
            checked={
              selectedStudents.length === students.length && students.length > 0
            }
            onCheckedChange={(checked) =>
              setSelectedStudents(checked ? students.map((s) => s.id) : [])
            }
          />
          <Label
            htmlFor="selectAll"
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All
          </Label>
        </div>
        {students.map((student) => (
          <div key={student.id} className="flex items-center">
            <Checkbox
              id={`student-${student.id}`}
              checked={selectedStudents.includes(student.id)}
              onCheckedChange={(checked) =>
                setSelectedStudents((prev) =>
                  checked
                    ? [...prev, student.id]
                    : prev.filter((id) => id !== student.id)
                )
              }
            />
            <Label
              htmlFor={`student-${student.id}`}
              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {student.name}
            </Label>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-6">
        <h3 className="font-semibold text-2xl">Assign to Groups</h3>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Manage Groups</Button>
          </SheetTrigger>
          <SheetContent className="">
            <SheetHeader className="mt-5 mb-5">
              <SheetTitle>Create a Group</SheetTitle>
            </SheetHeader>
            <Label>Group Name:</Label>
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="mb-5"
            />

            <Label className="">Select Students</Label>
            {students.map((student) => (
              <div key={student.id} className="mt-2">
                <input
                  type="checkbox"
                  id={`newGroup-${student.id}`}
                  onChange={(e) =>
                    setNewGroupStudents((prev) =>
                      e.target.checked
                        ? [...prev, student.id]
                        : prev.filter((id) => id !== student.id)
                    )
                  }
                />
                <Label
                  htmlFor={`newGroup-${student.id}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {student.name}
                </Label>
              </div>
            ))}
            <Button onClick={handleCreateGroup} className="mt-5">
              Create Group
            </Button>
          </SheetContent>
        </Sheet>

        {/* Existing Groups Section */}
        <h3 className="font-semibold text-2xl">Existing Groups</h3>
        <div className="space-y-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4 ">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center">
              <Checkbox
                id={`group-${group.id}`}
                checked={selectedGroups.includes(group.id)}
                onCheckedChange={(checked) =>
                  setSelectedGroups((prev) =>
                    checked
                      ? [...prev, group.id]
                      : prev.filter((id) => id !== group.id)
                  )
                }
              />
              <Label
                htmlFor={`group-${group.id}`}
                className=" ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {group.groupName}
              </Label>
            </div>
          ))}
        </div>
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

export default TeacherAssignedReminderForm;
