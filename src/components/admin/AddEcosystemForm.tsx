import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addNewEcosystem } from "@/lib/firebaseEcosystemFunctions";

const ecosystemSchema = z.object({
  id: z.string().min(1, "Ecosystem ID is required"),
  name: z.string().min(1, "Ecosystem name is required"),
});

type EcosystemFormData = z.infer<typeof ecosystemSchema>;

const AddEcosystemForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EcosystemFormData>({
    resolver: zodResolver(ecosystemSchema),
  });

  const onSubmit = async (data: EcosystemFormData) => {
    setIsSubmitting(true);
    try {
      await addNewEcosystem(data.id, data.name);
      toast({
        title: "Success",
        description: "Ecosystem added successfully",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ecosystem. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register("id")} placeholder="Ecosystem ID" />
        {errors.id && <p className="text-red-500">{errors.id.message}</p>}
      </div>
      <div>
        <Input {...register("name")} placeholder="Ecosystem Name" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Ecosystem"}
      </Button>
    </form>
  );
};

export default AddEcosystemForm;
