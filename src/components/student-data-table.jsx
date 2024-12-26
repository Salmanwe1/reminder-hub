/* eslint-disable react/prop-types */

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "../lib/utils";
import { ScrollArea, ScrollBar } from "./ui/scroll-area"; // Import ScrollArea and ScrollBar
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { useEffect, useState } from "react";

const statusOptions = [
  { value: "", label: "All" }, // Added "All" option
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const categoryOptions = [
  { value: "", label: "All" }, // Added "All" option
  { value: "assignment", label: "Assignment" },
  { value: "exam", label: "Exam" },
  { value: "event", label: "Event" },
  { value: "personal", label: "Personal" },
];

const priorityOptions = [
  { value: "", label: "All" }, // Added "All" option
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function DataTable({ columns, data }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  // const [rowSelection, setRowSelection] = useState({}); // row selection

  const [openStatus, setOpenStatus] = useState(false);
  const [valueStatus, setValueStatus] = useState("");
  const [openCategory, setOpenCategory] = useState(false);
  const [valueCategory, setValueCategory] = useState("");
  const [openPriority, setOpenPriority] = useState(false);
  const [valuePriority, setValuePriority] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    // onRowSelectionChange: setRowSelection, // row selection
    state: {
      sorting,
      columnFilters,
      // rowSelection, // row selection
    },
  });

  // Handle filters
  const applyFilters = () => {
    const filters = [];

    if (valueStatus) {
      filters.push({ id: "status", value: valueStatus });
    }
    if (valueCategory) {
      filters.push({ id: "category", value: valueCategory });
    }

    if (valuePriority) {
      filters.push({ id: "priority", value: valuePriority });
    }

    setColumnFilters(filters);
  };

  useEffect(() => {
    applyFilters();
  }, [valueStatus, valueCategory, valuePriority]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center py-4 gap-4">
        {/* Search by Title */}
        <Input
          placeholder="Search by Title..."
          value={table.getColumn("title")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* Status Filter */}
        <Popover open={openStatus} onOpenChange={setOpenStatus}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-between"
            >
              {valueStatus
                ? statusOptions.find((stat) => stat.value === valueStatus)?.label
                : "Filter by Status"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search Status..." className="h-9" />
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {statusOptions.map((stat) => (
                    <CommandItem
                      key={stat.value}
                      value={stat.value}
                      onSelect={(currentValue) => {
                        setValueStatus(
                          currentValue === valueStatus ? "" : currentValue
                        );
                        setOpenStatus(false);
                      }}
                    >
                      {stat.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          valueStatus === stat.value
                            ? "opacity-100"
                            : "opacity-0"
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
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[200px] justify-between"
            >
              {valueCategory
                ? categoryOptions.find((cat) => cat.value === valueCategory)
                    ?.label
                : "Filter by Category"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search Category..." className="h-9" />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categoryOptions.map((cat) => (
                    <CommandItem
                      key={cat.value}
                      value={cat.value}
                      onSelect={(currentValue) => {
                        setValueCategory(
                          currentValue === valueCategory ? "" : currentValue
                        );
                        setOpenCategory(false);
                      }}
                    >
                      {cat.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          valueCategory === cat.value
                            ? "opacity-100"
                            : "opacity-0"
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
        <Popover open={openPriority} onOpenChange={setOpenPriority}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              {valuePriority
                ? priorityOptions.find((pri) => pri.value === valuePriority)
                    ?.label
                : "Filter by Priority"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search Priority..." className="h-9" />
              <CommandList>
                <CommandEmpty>No priority found.</CommandEmpty>
                <CommandGroup>
                  {priorityOptions.map((pri) => (
                    <CommandItem
                      key={pri.value}
                      value={pri.value}
                      onSelect={(currentValue) => {
                        setValuePriority(
                          currentValue === valuePriority ? "" : currentValue
                        );
                        setOpenPriority(false);
                      }}
                    >
                      {pri.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          valuePriority === pri.value
                            ? "opacity-100"
                            : "opacity-0"
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

      {/* Table with ScrollArea */}
      <ScrollArea className="rounded-md border">
        <Table className="min-w-[800px]"> {/* Adjust min-width for horizontal scroll */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" /> {/* Horizontal ScrollBar */}
      </ScrollArea>
    </div>
  );
}
