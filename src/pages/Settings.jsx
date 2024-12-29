import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import Header from "../components/Header";
import ProfileForm from "../components/forms/ProfileForm";
import PreferenceForm from "../components/forms/PreferenceForm";
import SecurityForm from "../components/forms/SecurityForm";

function Settings() {
  return (
    <div className="space-y-10">
      <Header role="Student" page="Settings" />
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">
          Manage your profile, preferences, and account security.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-10">
        <TabsList className="bg-blue-950 text-white dark:bg-emerald-900 dark:text-white w-full">
          <TabsTrigger value="profile" className="w-full">Profile</TabsTrigger>
          <TabsTrigger value="preference" className="w-full">Preferences</TabsTrigger>
          <TabsTrigger value="security" className="w-full">Account Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="ml-5">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="preference" className="ml-5">
          <PreferenceForm />
        </TabsContent>
        <TabsContent value="security" className="ml-5">
          <SecurityForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings;
