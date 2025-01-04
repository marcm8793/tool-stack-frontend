import { useCallback, useEffect, useState, useRef } from "react";
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
import { Category, EcoSystem, NewToolData } from "@/types";
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
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import OpenAI from "openai";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const toolSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    ecosystem: z.string().min(1, "Ecosystem is required"),
    noGithubRepo: z.boolean(),
    github_link: z.string().url("Must be a valid URL").nullable(),
    website_url: z.string().url("Must be a valid URL"),
    logo_image: z
      .any()
      .refine((file) => file && file.type.startsWith("image/"), {
        message: "Please upload a valid image file",
      }),
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

const AddToolPage = () => {
  const { isAdmin, loading } = useAdminAccess();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBadge, setNewBadge] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [ecosystems, setEcosystems] = useState<EcoSystem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategoriesAndEcosystems = async () => {
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      const ecosystemsSnapshot = await getDocs(collection(db, "ecosystems"));

      setCategories(
        categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          created_at: doc.data().created_at,
          updated_at: doc.data().updated_at,
        }))
      );
      setEcosystems(
        ecosystemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          created_at: doc.data().created_at,
          updated_at: doc.data().updated_at,
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
      noGithubRepo: false,
    },
  });

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const generateAIContent = useCallback(async () => {
    const websiteUrl = watch("website_url");
    if (!websiteUrl) {
      toast({
        title: "Error",
        description: "Please enter a website URL first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a web developer that analyzes developer tools and provides descriptions and relevant tags for each tool. Always format your response with '### Description:' followed by the description, and '### Tags:' followed by a numbered list of tags.",
          },
          {
            role: "user",
            content: `Analyze the developer tool by reading the website URL at${websiteUrl}. Provide a long and precise description and 10 relevant tags or keywords. Format your response as instructed. Read the URL before providing the description and tags.`,
          },
        ],
      });

      const aiResponse = response.choices[0].message.content;
      console.log("AI Response:", aiResponse);

      // Extract description and tags
      const descriptionMatch = aiResponse?.match(
        /### Description:([\s\S]*?)(?=### Tags:|$)/i
      );
      const tagsMatch = aiResponse?.match(/### Tags:([\s\S]*)/i);

      const description = descriptionMatch ? descriptionMatch[1].trim() : "";
      const tags = tagsMatch
        ? tagsMatch[1]
            .split(/\n/)
            .map((tag) => tag.replace(/^\d+\.\s*/, "").trim())
            .filter((tag) => tag !== "")
        : [];

      console.log("Extracted Description:", description);
      console.log("Extracted Tags:", tags);

      if (description) {
        setValue("description", description);
      }
      if (tags.length > 0) {
        setNewBadge(tags.join(", ")); // Put tags in the input field
        // Add dashs between each word in each tag
        const tagsWithDashes = tags.map((tag) => tag.replace(/ /g, "-"));
        setValue("badges", tagsWithDashes);
      }

      toast({
        title: "Success",
        description:
          "AI-generated content added successfully. Review the description and suggested badges.",
      });
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [watch, toast, openai.chat.completions, setValue, setNewBadge]);

  const badges = watch("badges");

  // Modify the addBadge function to handle multiple badges
  const addBadge = () => {
    const badgesToAdd = newBadge
      .split(",")
      .map((badge) => badge.trim())
      .filter((badge) => badge !== "");
    if (badgesToAdd.length > 0) {
      setValue("badges", [...watch("badges"), ...badgesToAdd]);
      setNewBadge("");
    }
  };

  const removeBadge = (badge: string) => {
    const newBadges = badges.filter((b) => b !== badge);
    setValue("badges", newBadges);
  };

  const noGithubRepo = watch("noGithubRepo");

  const handleLogoChange = useCallback(
    (file: File) => {
      if (file) {
        setLogoFile(file);
        setValue("logo_image", file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleLogoChange(file);
      setValue("logo_image", file);
    }
  };

  // Handle paste functionality
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleLogoChange(file);
            setValue("logo_image", file);
          }
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [setValue, handleLogoChange]);

  const onSubmit = async (data: ToolFormData) => {
    if (!isAdmin) return;
    setIsSubmitting(true);
    try {
      let logo_url = "";

      // Upload logo if a file is selected
      if (logoFile) {
        const filename = `tool-logos/${Date.now()}_${data.name
          .replace(/\s+/g, "-")
          .toLowerCase()}`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, logoFile);
        logo_url = await getDownloadURL(storageRef);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { noGithubRepo, logo_image, ...restData } = data;

      const toolData: NewToolData = {
        ...restData,
        logo_url,
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
        github_link: data.noGithubRepo ? null : data.github_link,
        github_stars: data.noGithubRepo ? null : data.github_stars,
      };

      await addNewTool(toolData);
      toast({
        title: "Success",
        description: "Tool added successfully",
      });
      reset();
      setNewBadge("");
      setLogoFile(null);
      setLogoPreview(null);
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
      <Button onClick={() => navigate("/admin")} className="mb-6">
        Back to Admin
      </Button>
      <h1 className="text-3xl font-bold mb-6">Add New Tool</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Tool Name</Label>
          <Input {...register("name")} placeholder="Tool Name" />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  key={field.value}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <Select
                  key={field.value}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
        </div>

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
                  }
                }}
              />
            )}
          />
          <Label htmlFor="noGithubRepo">No GitHub repo</Label>
        </div>
        {!noGithubRepo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github_link">GitHub Link</Label>
              <Input {...register("github_link")} placeholder="GitHub Link" />
              {errors.github_link && (
                <p className="text-red-500">{errors.github_link.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="github_stars">GitHub Stars</Label>
              <Controller
                name="github_stars"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="GitHub Stars"
                    value={field.value === null ? "" : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                )}
              />
              {errors.github_stars && (
                <p className="text-red-500">{errors.github_stars.message}</p>
              )}
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="logo_url">Logo Upload</Label>
          <div
            className="border-2 border-dashed rounded-lg p-4 hover:border-primary cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleLogoChange(file);
                  setValue("logo_image", file);
                }
              }}
            />

            {logoPreview ? (
              <div className="flex items-center gap-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoFile(null);
                    setLogoPreview(null);
                    setValue("logo_image", null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p>
                  Drag and drop an image here, click to browse, or paste from
                  clipboard
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: PNG, JPG, GIF
                </p>
              </div>
            )}
          </div>
          {errors.logo_image && (
            <p className="text-red-500">
              {errors.logo_image?.message?.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-grow">
              <Label htmlFor="website_url">Website URL</Label>
              <Input {...register("website_url")} placeholder="Website URL" />
              {errors.website_url && (
                <p className="text-red-500">{errors.website_url.message}</p>
              )}
            </div>
            <div className="sm:flex-shrink-0">
              <Button
                type="button"
                onClick={generateAIContent}
                disabled={isGenerating || !watch("website_url")}
                className="w-full sm:w-auto"
              >
                {isGenerating ? "Generating..." : "AI Generate"}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Description"
              className="h-64"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="badges">Badges</Label>

          <div className="flex items-center space-x-2 mt-2">
            <Input
              id="newBadge"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              placeholder="Enter badges (comma-separated)"
            />
            <Button type="button" onClick={addBadge}>
              Add Badges
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            AI-suggested badges will appear here. Review and click 'Add Badges'
            to confirm.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {watch("badges").map((badge, index) => (
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
