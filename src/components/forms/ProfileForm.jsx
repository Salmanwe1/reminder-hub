import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useToast } from "../../hooks/use-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../api/firebase";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "lucide-react";

// Define validation schema using Zod
const profileSchema = z.object({
  name: z
    .string()
    .nonempty("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must not exceed 50 characters"),
  bio: z.string().max(200, "Bio must not exceed 200 characters").optional(),
  avatar: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "You must upload exactly one file")
    .optional(),
});

function ProfileForm() {
  const { toast } = useToast();
  const { user } = useAuth(); // Access authenticated user data
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData || {
      name: "",
      bio: "",
      // avatar: undefined,
    },
  });

  // Fetch user data from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setInitialData(data);
          reset({
            name: data.name || "",
            bio: data.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({ description: "Failed to fetch profile data." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, reset, toast]);

  // Submit handler to update Firestore and Firebase Storage
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const userRef = doc(db, "users", user.uid);

      // Update Firestore fields
      const updateData = {
        name: data.name,
        bio: data.bio,
      };

      // Handle avatar upload
      //   if (data.avatar && data.avatar[0]) {
      //     const avatarFile = data.avatar[0];
      //     const avatarRef = ref(storage, `avatars/${user.uid}`);
      //     await uploadBytes(avatarRef, avatarFile);
      //     const avatarURL = await getDownloadURL(avatarRef);
      //     updateData.avatar = avatarURL;
      //   }

      await updateDoc(userRef, updateData);

      toast({ description: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ description: "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
      <h2 className="text-xl font-semibold">Profile</h2>

      {/* Name Field */}
      <div>
        <Label htmlFor="name" className="block mb-2 font-medium">
          Name
        </Label>
        <Input
          {...register("name")}
          id="name"
          placeholder="Your name"
          type="text"
          className="max-w-[300px]"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Bio Field */}
      <div>
        <Label htmlFor="bio" className="block mb-2 font-medium">
          Bio
        </Label>
        <Textarea
          {...register("bio")}
          id="bio"
          placeholder="Tell us about yourself"
          className="max-w-[500px]"
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
        )}
      </div>

      {/* Avatar Field
      <div>
        <Label htmlFor="avatar" className="block mb-2 font-medium">
          Avatar
        </Label>
        <Input
          {...register("avatar")}
          id="avatar"
          type="file"
          accept="image/*"
          className="max-w-[300px]"
        />
        {errors.avatar && (
          <p className="text-red-500 text-sm mt-1">{errors.avatar.message}</p>
        )}
      </div> */}

      <Button type="submit" disabled={isSubmitting || loading}>
        {loading ? (
          <Loader className="w-6 h-6 animate-spin  mx-auto" /> 
        ) : ("Save changes")}
      </Button>
    </form>
  );
}

export default ProfileForm;
