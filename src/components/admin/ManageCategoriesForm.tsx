import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { Category } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Category name is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const ManageCategoriesForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      setCategories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category))
      );
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    const selectedCategory = categories.find(
      (category) => category.id === categoryId
    );
    if (selectedCategory) {
      setSelectedCategory(categoryId);
      reset({
        id: selectedCategory.id,
        name: selectedCategory.name,
      });
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      // Create new document with new ID
      const newCategoryRef = doc(db, "categories", data.id);
      batch.set(newCategoryRef, {
        id: data.id,
        name: data.name,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Delete old document
      const oldCategoryRef = doc(db, "categories", selectedCategory);
      batch.delete(oldCategoryRef);

      // Update all tools that reference this category
      const toolsSnapshot = await getDocs(
        query(collection(db, "tools"), where("category", "==", oldCategoryRef))
      );

      toolsSnapshot.forEach((toolDoc) => {
        batch.update(toolDoc.ref, {
          category: newCategoryRef,
        });
      });

      await batch.commit();

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory
            ? { ...cat, id: data.id, name: data.name }
            : cat
        )
      );
      setSelectedCategory(data.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      // Check if any tools are using this category
      const toolsSnapshot = await getDocs(
        query(
          collection(db, "tools"),
          where("category", "==", doc(db, "categories", selectedCategory))
        )
      );

      if (!toolsSnapshot.empty) {
        toast({
          title: "Cannot Delete",
          description: `This category is being used by ${toolsSnapshot.size} tool(s). Please reassign or delete these tools first.`,
          variant: "destructive",
        });
        return;
      }

      // If no tools are using it, proceed with deletion
      await deleteDoc(doc(db, "categories", selectedCategory));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setCategories(categories.filter((cat) => cat.id !== selectedCategory));
      setSelectedCategory(null);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Edit Category</h2>
      <Select onValueChange={handleCategorySelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a category to edit" />
        </SelectTrigger>
        <SelectContent>
          {categories
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register("id")} placeholder="Category ID" />
        {errors.id && <p className="text-red-500">{errors.id.message}</p>}

        <Input {...register("name")} placeholder="Category Name" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        <Button type="submit" disabled={isSubmitting || !selectedCategory}>
          {isSubmitting ? "Updating..." : "Update Category"}
        </Button>
      </form>

      <Button
        onClick={handleDeleteCategory}
        disabled={isSubmitting || !selectedCategory}
        variant="destructive"
      >
        {isSubmitting ? "Deleting..." : "Delete Category"}
      </Button>
    </div>
  );
};

export default ManageCategoriesForm;
