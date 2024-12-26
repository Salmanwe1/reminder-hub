import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../../api/firebase";
import { useAuth } from "../../context/AuthContext";

// Define Zod schema for form validation
const securitySchema = z.object({
  currentPassword: z.string().nonempty("Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "New password must contain an uppercase letter, a lowercase letter, and a number."),
});

function SecurityForm() {
  const { user } = useAuth(); // Access authenticated user data
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const togglePasswordVisibility = (type) => {
    if (type === "current") {
      setShowCurrentPassword((prev) => !prev);
    } else if (type === "new") {
      setShowNewPassword((prev) => !prev);
    }
  };

  // Submit handler to update password
  const onSubmit = async (data) => {
    try {
      const { currentPassword, newPassword } = data;

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      toast({
        description: "Password updated successfully!",
      });

      reset(); // Reset form after successful update
    } catch (error) {
      console.error("Error updating password:", error.message);
      toast({
        description: error.message || "Failed to update password. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-[300px]">
      <h2 className="text-xl font-semibold">Account Security</h2>

      {/* Current Password */}
      <div className="relative">
        <Label htmlFor="currentPassword" className="block mb-2 font-medium">
          Current Password
        </Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            {...register("currentPassword")}
            className="w-full p-2 border rounded"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("current")}
            className="absolute inset-y-0 right-2 flex items-center"
          >
            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* New Password */}
      <div className="relative">
        <Label htmlFor="newPassword" className="block mb-2 font-medium">
          New Password
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            {...register("newPassword")}
            className="w-full p-2 border rounded"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("new")}
            className="absolute inset-y-0 right-2 flex items-center"
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
        )}
      </div>

      {/* Update Button */}
      <Button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded">
        {isSubmitting ? (<Loader className="w-6 h-6 animate-spin  mx-auto"/>) : ("Update Password")}
      </Button>
    </form>
  );
}

export default SecurityForm;
