import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle, Camera } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

interface FormData {
  displayName: string;
}

const ProfilePage: React.FC = () => {
  const { user, loading, error, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    values: {
      displayName: user?.displayName || "",
    },
  });

  const { toast } = useToast();

  useEffect(() => {
    if (newProfilePic) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(newProfilePic);
    } else {
      setPreviewUrl(null);
    }
  }, [newProfilePic]);

  const deleteOldProfilePicture = async (photoURL: string) => {
    if (!photoURL) return;

    try {
      // Extract the file path from the photoURL
      const filePathMatch = photoURL.match(/o\/(.+?)\?/);
      if (filePathMatch && filePathMatch[1]) {
        const filePath = decodeURIComponent(filePathMatch[1]);
        const oldFileRef = ref(storage, filePath);
        await deleteObject(oldFileRef);
        console.log("Old profile picture deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting old profile picture:", error);
      // We don't throw here to avoid interrupting the update process
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) return;

    try {
      let photoURL = user.photoURL;
      let updatedDisplayName = user.displayName;

      if (newProfilePic) {
        // Delete the old profile picture
        if (user.photoURL) {
          await deleteOldProfilePicture(user.photoURL);
        }

        // Upload the new profile picture
        const storageRef = ref(storage, `users_avatar/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, newProfilePic);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      // Only update display name if it has changed and is not empty
      if (
        data.displayName &&
        data.displayName !== user.displayName &&
        data.displayName.trim() !== ""
      ) {
        updatedDisplayName = data.displayName.trim();
      } else if (!updatedDisplayName) {
        // If there's no existing display name and the input is empty, show an error
        toast({
          title: "Invalid Display Name",
          description: "Display name cannot be empty.",
          variant: "destructive",
        });
        return;
      }

      // Update auth profile
      await updateProfile(auth.currentUser!, {
        displayName: data.displayName,
        photoURL: photoURL,
      });

      // Update Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: updatedDisplayName,
        photoURL: photoURL,
      });

      // Update local user state
      setUser({
        ...user,
        displayName: data.displayName,
        photoURL: photoURL,
      });

      setIsEditing(false);
      setNewProfilePic(null);
      setPreviewUrl(null);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description:
          "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProfilePic(e.target.files[0]);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Please log in to view this page.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">{user.displayName}</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32">
                  <AvatarImage
                    src={previewUrl || user.photoURL || undefined}
                    alt={user.displayName || ""}
                  />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="mt-4">
                    <Label htmlFor="profile-picture" className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <Camera className="w-6 h-6" />
                        <span>Change Profile Picture</span>
                      </div>
                    </Label>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  {...register("displayName", {
                    required: "Display name is required",
                    validate: (value) =>
                      value.trim() !== "" || "Display name cannot be empty",
                  })}
                  disabled={!isEditing}
                />
                {errors.displayName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.displayName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || ""} disabled />
              </div>

              {!user.emailVerified && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Email not verified</AlertTitle>
                  <AlertDescription>
                    Please verify your email address to access all features.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setNewProfilePic(null);
                  setPreviewUrl(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmit(onSubmit)}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;
