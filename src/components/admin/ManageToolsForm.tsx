import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DevTool, Category, EcoSystem } from "@/types/index";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

const toolSchema = z
  .object({
    id: z.string().min(1, "Tool ID is required"),
    name: z.string().min(1, "Name is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    ecosystem: z.string().min(1, "Ecosystem is required"),
    noGithubRepo: z.boolean(),
    github_link: z.string().url("Must be a valid URL").nullable(),
    website_url: z.string().url("Must be a valid URL"),
    logo_url: z.string().url("Must be a valid URL"),
    github_stars: z
      .number()
      .int()
      .nonnegative("GitHub stars must be a non-negative integer")
      .nullable(),
    badges: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (data.noGithubRepo) {
        return data.github_link === null && data.github_stars === null;
      }
      return data.github_link !== null && data.github_stars !== null;
    },
    {
      message:
        "GitHub link and stars are required if 'No GitHub repo' is not checked",
      path: ["github_link", "github_stars"],
    }
  );

type ToolFormData = z.infer<typeof toolSchema>;

const ManageToolsForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tools, setTools] = useState<DevTool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ecosystems, setEcosystems] = useState<EcoSystem[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      noGithubRepo: false,
      github_link: null,
      github_stars: null,
    },
  });

  const noGithubRepo = watch("noGithubRepo");

  useEffect(() => {
    const fetchData = async () => {
      const toolsSnapshot = await getDocs(collection(db, "tools"));
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const ecosystemsSnapshot = await getDocs(collection(db, "ecosystems"));

      setTools(
        toolsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as DevTool)
        )
      );
      setCategories(
        categoriesSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Category)
        )
      );
      setEcosystems(
        ecosystemsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as EcoSystem)
        )
      );
    };

    fetchData();
  }, []);

  const badges = watch("badges") || [];

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
    setIsSubmitting(true);
    try {
      const toolRef = doc(db, "tools", data.id);
      const oldToolData = (await getDoc(toolRef)).data() as DevTool;

      let newLogoUrl = data.logo_url;

      // Check if the logo URL has changed
      if (data.logo_url !== oldToolData.logo_url) {
        // Delete the old logo from storage if it exists
        if (oldToolData.logo_url) {
          const oldLogoRef = ref(storage, oldToolData.logo_url);
          await deleteObject(oldLogoRef).catch(console.error);
        }

        // Fetch and upload the new logo
        const response = await fetch(data.logo_url);
        const blob = await response.blob();
        const filename = `tool-logos/${Date.now()}_${data.name
          .replace(/\s+/g, "-")
          .toLowerCase()}`;
        const newLogoRef = ref(storage, filename);
        await uploadBytes(newLogoRef, blob);
        newLogoUrl = await getDownloadURL(newLogoRef);
      }

      const { noGithubRepo, id, ...dataToUpdate } = data;

      await updateDoc(toolRef, {
        ...dataToUpdate,
        logo_url: newLogoUrl,
        category: doc(db, "categories", data.category),
        ecosystem: doc(db, "ecosystems", data.ecosystem),
        github_link: data.noGithubRepo ? null : data.github_link,
        github_stars: data.noGithubRepo ? null : Number(data.github_stars),
      });

      toast({
        title: "Success",
        description: "Tool updated successfully",
      });
      reset();
      setSelectedTool(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tool. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToolSelect = (toolId: string) => {
    const selectedTool = tools.find((tool) => tool.id === toolId);
    if (selectedTool) {
      setSelectedTool(toolId);
      const noGithubRepo =
        !selectedTool.github_link && selectedTool.github_stars === null;
      reset({
        ...selectedTool,
        category: selectedTool.category.id,
        ecosystem: selectedTool.ecosystem.id,
        noGithubRepo,
        github_link: selectedTool.github_link || null,
        github_stars: selectedTool.github_stars || null,
        badges: selectedTool.badges || [],
      });
      setNewBadge("");
    }
  };

  const handleDeleteTool = async () => {
    if (!selectedTool) return;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      // Get the tool data
      const toolDoc = await getDoc(doc(db, "tools", selectedTool));
      const toolData = toolDoc.data() as DevTool;

      // Delete the tool's image from Firebase Storage
      if (toolData.logo_url) {
        const imageRef = ref(storage, toolData.logo_url);
        await deleteObject(imageRef).catch((error) => {
          console.error("Error deleting image:", error);
          // Continue with deletion even if image deletion fails
        });
      }

      // Delete the tool
      const toolRef = doc(db, "tools", selectedTool);
      batch.delete(toolRef);

      // Delete related likes
      const likesQuery = query(
        collection(db, "likes"),
        where("tool_id", "==", selectedTool)
      );
      const likesSnapshot = await getDocs(likesQuery);
      likesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete related comments
      const commentsQuery = query(
        collection(db, "comments"),
        where("tool_id", "==", selectedTool)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      commentsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      toast({
        title: "Success",
        description: "Tool, related data, and image deleted successfully",
      });
      reset();
      setSelectedTool(null);
      setTools(tools.filter((tool) => tool.id !== selectedTool));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tool. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Edit Tool</h2>
      </div>
      <div className="space-y-4">
        <Select onValueChange={handleToolSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a tool to edit" />
          </SelectTrigger>
          <SelectContent>
            {tools.map((tool) => (
              <SelectItem key={tool.id} value={tool.id}>
                {tool.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("id")} placeholder="Tool ID" disabled />
          <Input {...register("name")} placeholder="Tool Name" />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          <Textarea {...register("description")} placeholder="Description" />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
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
          <Controller
            name="ecosystem"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
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
          <div className="flex items-center space-x-2">
            <Controller
              name="noGithubRepo"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="noGithubRepo"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      setValue("github_link", null);
                      setValue("github_stars", null);
                    } else {
                      trigger(["github_link", "github_stars"]);
                    }
                  }}
                />
              )}
            />
            <Label htmlFor="noGithubRepo">No GitHub repo</Label>
          </div>
          {!noGithubRepo && (
            <>
              <Input {...register("github_link")} placeholder="GitHub Link" />
              {errors.github_link && (
                <p className="text-red-500">{errors.github_link.message}</p>
              )}
              <Input
                {...register("github_stars", {
                  setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
                  valueAsNumber: true,
                })}
                type="number"
                placeholder="GitHub Stars"
              />
              {errors.github_stars && (
                <p className="text-red-500">{errors.github_stars.message}</p>
              )}
            </>
          )}
          <Input {...register("website_url")} placeholder="Website URL" />
          {errors.website_url && (
            <p className="text-red-500">{errors.website_url.message}</p>
          )}
          <Input {...register("logo_url")} placeholder="Logo URL" />
          {errors.logo_url && (
            <p className="text-red-500">{errors.logo_url.message}</p>
          )}
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
                    {field.value?.map((badge, index) => (
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
          <Button type="submit" disabled={isSubmitting || !selectedTool}>
            {isSubmitting ? "Updating..." : "Update Tool"}
          </Button>
        </form>

        <Button
          onClick={handleDeleteTool}
          disabled={isSubmitting || !selectedTool}
          variant="destructive"
        >
          {isSubmitting ? "Deleting..." : "Delete Tool"}
        </Button>
      </div>
    </>
  );
};

export default ManageToolsForm;
