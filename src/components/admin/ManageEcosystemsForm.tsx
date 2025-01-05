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
import { EcoSystem } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ecosystemSchema = z.object({
  id: z.string().min(1, "Ecosystem ID is required"),
  name: z.string().min(1, "Ecosystem name is required"),
});

type EcosystemFormData = z.infer<typeof ecosystemSchema>;

const ManageEcosystemsForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ecosystems, setEcosystems] = useState<EcoSystem[]>([]);
  const [selectedEcosystem, setSelectedEcosystem] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EcosystemFormData>({
    resolver: zodResolver(ecosystemSchema),
  });

  useEffect(() => {
    const fetchEcosystems = async () => {
      const snapshot = await getDocs(collection(db, "ecosystems"));
      setEcosystems(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as EcoSystem))
      );
    };

    fetchEcosystems();
  }, []);

  const handleEcosystemSelect = (ecosystemId: string) => {
    const selectedEcosystem = ecosystems.find(
      (ecosystem) => ecosystem.id === ecosystemId
    );
    if (selectedEcosystem) {
      setSelectedEcosystem(ecosystemId);
      reset({
        id: selectedEcosystem.id,
        name: selectedEcosystem.name,
      });
    }
  };

  const onSubmit = async (data: EcosystemFormData) => {
    if (!selectedEcosystem) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      // Create new document with new ID
      const newEcosystemRef = doc(db, "ecosystems", data.id);
      batch.set(newEcosystemRef, {
        id: data.id,
        name: data.name,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Delete old document
      const oldEcosystemRef = doc(db, "ecosystems", selectedEcosystem);
      batch.delete(oldEcosystemRef);

      // Update all tools that reference this ecosystem
      const toolsSnapshot = await getDocs(
        query(
          collection(db, "tools"),
          where("ecosystem", "==", oldEcosystemRef)
        )
      );

      toolsSnapshot.forEach((toolDoc) => {
        batch.update(toolDoc.ref, {
          ecosystem: newEcosystemRef,
        });
      });

      await batch.commit();

      toast({
        title: "Success",
        description: "Ecosystem updated successfully",
      });

      setEcosystems(
        ecosystems.map((eco) =>
          eco.id === selectedEcosystem
            ? { ...eco, id: data.id, name: data.name }
            : eco
        )
      );
      setSelectedEcosystem(data.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ecosystem",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEcosystem = async () => {
    if (!selectedEcosystem) return;
    setIsSubmitting(true);
    try {
      // Check if any tools are using this ecosystem
      const toolsSnapshot = await getDocs(
        query(
          collection(db, "tools"),
          where("ecosystem", "==", doc(db, "ecosystems", selectedEcosystem))
        )
      );

      if (!toolsSnapshot.empty) {
        toast({
          title: "Cannot Delete",
          description: `This ecosystem is being used by ${toolsSnapshot.size} tool(s). Please reassign or delete these tools first.`,
          variant: "destructive",
        });
        return;
      }

      // If no tools are using it, proceed with deletion
      await deleteDoc(doc(db, "ecosystems", selectedEcosystem));
      toast({
        title: "Success",
        description: "Ecosystem deleted successfully",
      });
      setEcosystems(ecosystems.filter((eco) => eco.id !== selectedEcosystem));
      setSelectedEcosystem(null);
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ecosystem",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Edit Ecosystem</h2>
      <Select onValueChange={handleEcosystemSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select an ecosystem to edit" />
        </SelectTrigger>
        <SelectContent>
          {ecosystems
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((ecosystem) => (
              <SelectItem key={ecosystem.id} value={ecosystem.id}>
                {ecosystem.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register("id")} placeholder="Ecosystem ID" />
        {errors.id && <p className="text-red-500">{errors.id.message}</p>}

        <Input {...register("name")} placeholder="Ecosystem Name" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        <Button type="submit" disabled={isSubmitting || !selectedEcosystem}>
          {isSubmitting ? "Updating..." : "Update Ecosystem"}
        </Button>
      </form>

      <Button
        onClick={handleDeleteEcosystem}
        disabled={isSubmitting || !selectedEcosystem}
        variant="destructive"
      >
        {isSubmitting ? "Deleting..." : "Delete Ecosystem"}
      </Button>
    </div>
  );
};

export default ManageEcosystemsForm;
