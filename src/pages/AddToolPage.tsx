import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { addNewTool } from "@/lib/firebaseToolFuctions";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Category, DevTool, EcoSystem } from "@/types";
import {
  collection,
  doc,
  DocumentReference,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const toolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  ecosystem: z.string().min(1, "Ecosystem is required"),
  github_link: z.string().url("Must be a valid URL"),
  website_url: z.string().url("Must be a valid URL"),
  logo_url: z.string().url("Must be a valid URL"),
  github_stars: z
    .number()
    .int()
    .nonnegative("GitHub stars must be a non-negative integer"),
  badges: z.array(z.string()),
});

type ToolFormData = z.infer<typeof toolSchema>;
const AddToolPage = () => {
  const { isAdmin, loading } = useAdminAccess();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBadge, setNewBadge] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [ecosystems, setEcosystems] = useState<EcoSystem[]>([]);

  useEffect(() => {
    const fetchCategoriesAndEcosystems = async () => {
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const ecosystemsSnapshot = await getDocs(collection(db, "ecosystems"));

      setCategories(
        categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }))
      );
      setEcosystems(
        ecosystemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }))
      );
    };

    fetchCategoriesAndEcosystems();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      badges: [],
    },
  });

  const badges = watch("badges");

  const addBadge = () => {
    if (newBadge.trim() !== "" && !badges.includes(newBadge.trim())) {
      setValue("badges", [...badges, newBadge.trim()]);
      setNewBadge("");
    }
  };

  const removeBadge = (badge: string) => {
    setValue(
      "badges",
      badges.filter((b) => b !== badge)
    );
  };

  const onSubmit = async (data: ToolFormData) => {
    if (!isAdmin) return;
    setIsSubmitting(true);
    try {
      const toolData: Omit<DevTool, "id" | "like_count"> = {
        ...data,
        category: doc(
          db,
          "categories",
          data.category
        ) as DocumentReference<Category>,
        ecosystem: doc(
          db,
          "ecosystems",
          data.ecosystem
        ) as DocumentReference<EcoSystem>,
        github_stars: Number(data.github_stars),
      };
      await addNewTool(toolData);
      toast({
        title: "Success",
        description: "Tool added successfully",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tool. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Tool</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register("name")} placeholder="Tool Name" />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Textarea {...register("description")} placeholder="Description" />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-red-500">{errors.category.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="ecosystem">Ecosystem</Label>
          <Controller
            name="ecosystem"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an ecosystem" />
                </SelectTrigger>
                <SelectContent>
                  {ecosystems.map((ecosystem) => (
                    <SelectItem key={ecosystem.id} value={ecosystem.id}>
                      {ecosystem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.ecosystem && (
            <p className="text-red-500">{errors.ecosystem.message}</p>
          )}
        </div>
        <div>
          <Input {...register("github_link")} placeholder="GitHub Link" />
          {errors.github_link && (
            <p className="text-red-500">{errors.github_link.message}</p>
          )}
        </div>
        <div>
          <Input {...register("website_url")} placeholder="Website URL" />
          {errors.website_url && (
            <p className="text-red-500">{errors.website_url.message}</p>
          )}
        </div>
        <div>
          <Input {...register("logo_url")} placeholder="Logo URL" />
          {errors.logo_url && (
            <p className="text-red-500">{errors.logo_url.message}</p>
          )}
        </div>
        <div>
          <Input
            {...register("github_stars", { valueAsNumber: true })}
            type="number"
            placeholder="GitHub Stars"
          />
          {errors.github_stars && (
            <p className="text-red-500">{errors.github_stars.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="badges">Badges</Label>
          <div className="flex items-center space-x-2 mb-2">
            <Input
              id="newBadge"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              placeholder="Enter a badge"
            />
            <Button type="button" onClick={addBadge}>
              Add Badge
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Controller
              name="badges"
              control={control}
              render={({ field }) => (
                <>
                  {field.value.map((badge, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center"
                    >
                      {badge}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeBadge(badge)}
                      />
                    </Badge>
                  ))}
                </>
              )}
            />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Tool"}
        </Button>
      </form>
    </div>
  );
};

export default AddToolPage;