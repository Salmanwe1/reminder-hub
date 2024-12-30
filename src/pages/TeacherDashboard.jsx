import { Separator } from "../components/ui/separator";
import Header from "../components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import TeacherPersonalReminders from "../components/TeacherPersonalReminders";
import AssignedReminders from "../components/AssignedReminders";

function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <Header role="Teacher" page="dashboard" />
      <div className="space-y-2">
          <h2 className="text-4xl font-semibold">Welcome back!</h2>
          <p className="text-lg text-gray-700">
            Here&apos;s a list of your reminders!
          </p>
        </div>
      <Separator />

      <Tabs defaultValue="personal" className="space-y-10">
        <TabsList className="bg-blue-950 text-white dark:bg-emerald-900 dark:text-white w-full">
          <TabsTrigger value="personal" className="w-full">Personal</TabsTrigger>
          <TabsTrigger value="assigned" className="w-full">Assigned</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="">
          <TeacherPersonalReminders />
        </TabsContent>
        <TabsContent value="assigned" className="">
          <AssignedReminders />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TeacherDashboard;
