import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "../lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import ReminderCard from "./ReminderCard";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { listenForReminders } from "../api/reminders";
import { auth } from "../api/firebase";

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
function TeacherPersonalReminders() {
  const [reminders, setReminders] = useState([]);
  const [filteredReminders, setFilteredReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    const userId = auth.currentUser?.uid; // Get the logged-in user's ID
    if (!userId) {
      console.error("User not authenticated");
      setLoading(false);
      return;
    }

    const unsubscribe = listenForReminders(
      userId,
      "teacher",
      "personal",
      (updatedReminders) => {

        const filteredReminders = updatedReminders.filter((reminder) => {
          // Exclude reminders with studentIds or groupId (i.e., assigned reminders)
          return (
            (!reminder.studentIds || reminder.studentIds.length === 0) &&
            (!reminder.groupId || reminder.groupId.length === 0)
          );
        });
        const formattedReminders = filteredReminders.map((reminder) => {
          const dueDate = new Date(reminder.dueDate || Date.now());
          const endOfDay = new Date(dueDate);
endOfDay.setHours(23, 59, 59, 999);  // Force end of the day
          const status =
            reminder.status === "Completed"
              ? "Completed"
              : endOfDay < new Date()
              ? "Overdue"
              : "Upcoming";

          return {
            ...reminder,
            createdAt: reminder.createdAt?.toDate
              ? reminder.createdAt.toDate()
              : new Date(reminder.createdAt || Date.now()),
            dueDate,
            status, // Auto-update status
          };
        });
        setReminders(formattedReminders);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter logic
  useEffect(() => {
    const filtered = reminders.filter((reminder) => {
      return (
        (!search ||
          reminder.title.toLowerCase().includes(search.toLowerCase())) &&
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
    <div className="p-4">
      {" "}
      {/* Cards for smaller screens */}
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
            <Button
              variant="outline"
              className="w-full sm:max-w-xs justify-between"
            >
              {status
                ? statusOptions.find((opt) => opt.value === status)?.label
                : "Filter by Status"}
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
                    <CommandItem
                      key={opt.value}
                      onSelect={() => setStatus(opt.value)}
                    >
                      {opt.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          status === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
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
            <Button
              variant="outline"
              className="w-full sm:max-w-xs justify-between"
            >
              {category
                ? categoryOptions.find((opt) => opt.value === category)?.label
                : "Filter by Category"}
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
                    <CommandItem
                      key={opt.value}
                      onSelect={() => setCategory(opt.value)}
                    >
                      {opt.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          category === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
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
            <Button
              variant="outline"
              className="w-full sm:max-w-xs justify-between"
            >
              {priority
                ? priorityOptions.find((opt) => opt.value === priority)?.label
                : "Filter by Priority"}
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
                    <CommandItem
                      key={opt.value}
                      onSelect={() => setPriority(opt.value)}
                    >
                      {opt.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          priority === opt.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <ScrollArea>
        {filteredReminders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-5">No reminders found.</p>
        )}
      </ScrollArea>
    </div>
  );
}

export default TeacherPersonalReminders;
