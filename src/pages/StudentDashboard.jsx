import { columns } from "../components/student-columns";
import { DataTable } from "../components/student-data-table";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { deleteReminder, listenForReminders } from "../api/reminders";
import { auth } from "../api/firebase";
import LoadingSpinner from "../components/LoadingSpinner";
import ReminderCard from "../components/ReminderCard";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty, CommandInput } from "../components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "../hooks/use-toast";

const statusOptions = [
  { value: "", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const categoryOptions = [
  { value: "", label: "All" },
  { value: "assignment", label: "Assignment" },
  { value: "exam", label: "Exam" },
  { value: "event", label: "Event" },
  { value: "personal", label: "Personal" },
];

const priorityOptions = [
  { value: "", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];


function StudentDashboard() {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [loading, setLoading] = useState(true);

   // Filter states
   const [search, setSearch] = useState("");
   const [status, setStatus] = useState("");
   const [category, setCategory] = useState("");
   const [priority, setPriority] = useState("");
 


   useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("User not authenticated");
      setLoading(false);
      return;
    }
  
    // Use a Map to track all reminders by their ID
    const allReminders = new Map();
  
    // Fetch self-created reminders
    const unsubscribePersonal = listenForReminders(
      userId,
      "student",
      "personal",
      (updatedReminders) => {
        updatedReminders.forEach((reminder) => {
          const dueDate = new Date(reminder.dueDate || Date.now());
          const status =
            reminder.status === "Completed"
              ? "Completed"
              : dueDate < new Date()
              ? "Overdue"
              : "Upcoming";
  
          allReminders.set(reminder.id, {
            ...reminder,
            createdAt: reminder.createdAt?.toDate
              ? reminder.createdAt.toDate()
              : new Date(reminder.createdAt || Date.now()),
            dueDate,
            status,
          });
        });
  
        setReminders([...allReminders.values()]);
      }
    );
  
    // Fetch reminders assigned by teachers
    const unsubscribeAssigned = listenForReminders(
      userId,
      "student",
      "assigned",
      (assignedReminders) => {
        assignedReminders.forEach((reminder) => {
          const dueDate = new Date(reminder.dueDate || Date.now());
          const status =
            reminder.status === "Completed"
              ? "Completed"
              : dueDate < new Date()
              ? "Overdue"
              : "Upcoming";
  
          allReminders.set(reminder.id, {
            ...reminder,
            createdAt: reminder.createdAt?.toDate
              ? reminder.createdAt.toDate()
              : new Date(reminder.createdAt || Date.now()),
            dueDate,
            status,
          });
        });
  
        setReminders(
          [...allReminders.values()].sort((a, b) => a.createdAt - b.createdAt)
        );
      }
    );
  
    setLoading(false);
  
    return () => {
      unsubscribePersonal();
      unsubscribeAssigned();
    };
  }, []);

  const handleDeleteReminder = async (reminderId) => {
    try {
      // Perform deletion from Firestore
      await deleteReminder(reminderId, auth.currentUser.uid, auth.currentUser.role);
  
      // Update the local state to remove the deleted reminder
      setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId));
      
      toast({ description: "Reminder deleted successfully!" });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({ description: "Failed to delete reminder.", variant: "destructive" });
    }
  };
  // Filter logic
  useEffect(() => {
    const filtered = reminders.filter((reminder) => {
      return (
        (!search || reminder.title.toLowerCase().includes(search.toLowerCase())) &&
        (!status || reminder.status === status) &&
        (!category || reminder.category === category) &&
        (!priority || reminder.priority === priority)
      );
    });
    setFilteredReminders(filtered);
  }, [reminders, search, status, category, priority]);


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Header role="Student" page="Dashboard" />
      <div className="hidden xl:flex flex-col my-10 space-y-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-semibold">Welcome back!</h2>
          <p className="text-lg text-gray-700">
            Here&apos;s a list of your reminders!
          </p>
        </div>
        <div>
          {/* DataTable displays reminders for large screens */}
          <DataTable columns={columns} data={reminders} />
        </div>
      </div>

      <div className="p-4 xl:hidden"> {/* Cards for smaller screens */}
        <div className="space-y-2 my-5">
          <h2 className="text-4xl font-semibold">Welcome back!</h2>
          <p className="text-lg text-gray-700">
            Here&apos;s a list of your reminders!
          </p>
        </div>

         {/* Filters */}
         <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Search */}
          <Input
            placeholder="Search by Title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-sm"
          />

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:max-w-xs justify-between">
                {status ? statusOptions.find((opt) => opt.value === status)?.label : "Filter by Status"}
                <ChevronsUpDown className="ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput placeholder="Search Status..." />
                <CommandList>
                  <CommandEmpty>No status found.</CommandEmpty>
                  <CommandGroup>
                    {statusOptions.map((opt) => (
                      <CommandItem key={opt.value} onSelect={() => setStatus(opt.value)}>
                        {opt.label}
                        <Check className={cn("ml-auto", status === opt.value ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:max-w-xs justify-between">
                {category ? categoryOptions.find((opt) => opt.value === category)?.label : "Filter by Category"}
                <ChevronsUpDown className="ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput placeholder="Search Category..." />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {categoryOptions.map((opt) => (
                      <CommandItem key={opt.value} onSelect={() => setCategory(opt.value)}>
                        {opt.label}
                        <Check className={cn("ml-auto", category === opt.value ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Priority Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:max-w-xs justify-between">
                {priority ? priorityOptions.find((opt) => opt.value === priority)?.label : "Filter by Priority"}
                <ChevronsUpDown className="ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput placeholder="Search Priority..." />
                <CommandList>
                  <CommandEmpty>No priorities found.</CommandEmpty>
                  <CommandGroup>
                    {priorityOptions.map((opt) => (
                      <CommandItem key={opt.value} onSelect={() => setPriority(opt.value)}>
                        {opt.label}
                        <Check className={cn("ml-auto", priority === opt.value ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <ScrollArea>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onDelete={handleDeleteReminder}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default StudentDashboard;