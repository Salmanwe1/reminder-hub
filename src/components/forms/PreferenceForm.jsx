import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModeToggle } from "../ModeToggle";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../api/firebase";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "lucide-react";

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.enum(["in-app", "email", "both"]),
});

function PreferenceForm() {
  const { user, preferences, setPreferences } = useAuth(); // Get live preferences
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: preferences.theme || "system",
      notifications: preferences.notifications || "in-app",
    },
  });

  // Sync with AuthProvider (handle live changes)
  useEffect(() => {
    reset({
      theme: preferences.theme,
      notifications: preferences.notifications,
    });
  }, [preferences, reset]);

  // Submit Handler to update Firestore
  const onSubmit = async (data) => {
    // Skip Firestore update if no changes
    if (
      data.theme === preferences.theme &&
      data.notifications === preferences.notifications
    ) {
      toast({ description: "No changes detected." });
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        theme: data.theme,
        notifications: data.notifications,
      });

      // Update context with new preferences
      setPreferences(data);

      toast({ description: "Preferences updated successfully!" });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({ description: "Failed to update preferences." });
    } finally {
      setLoading(false);
    }
  };

  const selectedTheme = watch("theme");
  const selectedNotification = watch("notifications");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 mb-8">
      <h2 className="text-xl font-semibold">Preferences</h2>

      {/* Theme Toggle */}
      <div>
        <Label className="block font-medium mb-2">Theme</Label>
        <ModeToggle />
        <div className="hidden">
          <input type="hidden" value={selectedTheme} {...register("theme")} />
        </div>
      </div>

      {/* Notifications */}
      <div className="max-w-[200px]">
        <Label className="block font-medium mb-3">
          Notification Preferences
        </Label>
        <Select
          value={selectedNotification}
          onValueChange={(value) => setValue("notifications", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select notification type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Notification Types</SelectLabel>
              <SelectItem value="in-app">In-App</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.notifications && (
          <p className="text-red-500 text-sm mt-1">
            {errors.notifications.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting || loading}>
        {loading ? (
          <Loader className="w-6 h-6 animate-spin mx-auto" />
        ) : (
          "Save Preferences"
        )}
      </Button>
    </form>
  );
}

export default PreferenceForm;
