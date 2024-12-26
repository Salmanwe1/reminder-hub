import { Separator } from "../components/ui/separator";
import Header from "../components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import TeacherPersonalReminderForm from "../components/forms/TeacherPersonalReminderForm";
import TeacherAssignedReminderForm from "../components/forms/TeacherAssignedReminderForm";

function CreateTeacherReminder() {
  return (
    <div className="space-y-10">
      <Header role="Teacher" page="Create Reminder" />
      <div>
        <h1 className="text-3xl font-bold mb-2">Create a Reminder</h1>
      </div>
      <Separator />

      <Tabs defaultValue="personal" className="space-y-10">
        <TabsList className="dark:bg-emerald-900 dark:text-white w-full">
          <TabsTrigger value="personal" className="w-full">Personal</TabsTrigger>
          <TabsTrigger value="assigned" className="w-full">Assign to Students</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="ml-5">
            <TeacherPersonalReminderForm />
        </TabsContent>
        <TabsContent value="assigned" className="ml-5">
            <TeacherAssignedReminderForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CreateTeacherReminder;
