import { Separator } from "../components/ui/separator";
import Header from "../components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import TeacherPersonalReminders from "../components/TeacherPersonalReminders";
import AssignedReminders from "../components/AssignedReminders";

function TeacherDashboard() {
  return (
    <div className="space-y-10">
      <Header role="Teacher" page="dashboard" />
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      </div>
      <Separator />

      <Tabs defaultValue="personal" className="space-y-10">
        <TabsList className="dark:bg-emerald-900 dark:text-white w-full">
          <TabsTrigger value="personal" className="w-full">Personal reminders</TabsTrigger>
          <TabsTrigger value="assigned" className="w-full">Reminders Assign to Students</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="ml-5">
          <TeacherPersonalReminders />
        </TabsContent>
        <TabsContent value="assigned" className="ml-5">
          <AssignedReminders />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TeacherDashboard;
