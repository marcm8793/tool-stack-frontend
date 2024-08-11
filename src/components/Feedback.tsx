import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Send, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useToast } from "./ui/use-toast";
import { Label } from "./ui/label";
import { z } from "zod";

const feedbackSchema = z.object({
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

const Feedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; message?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const validateForm = () => {
    if (form.current) {
      const formData = new FormData(form.current);
      const email = formData.get("from_name") as string;
      const message = formData.get("message") as string;

      try {
        feedbackSchema.parse({ email, message });
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: { email?: string; message?: string } = {};
          error.errors.forEach((err) => {
            if (err.path[0] === "email") newErrors.email = err.message;
            if (err.path[0] === "message") newErrors.message = err.message;
          });
          setErrors(newErrors);
        }
        return false;
      }
    }
    return false;
  };

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const result = await emailjs.sendForm(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          form.current!,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        console.log(result.text);
        toast({
          title: "Success!",
          description: "Your feedback has been sent successfully.",
        });
        setIsOpen(false);
        if (form.current) form.current.reset();
      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description: "Failed to send feedback. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Feedback</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Feedback Form</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Help us improve by sharing your thoughts and suggestions.
          </DialogDescription>

          <form ref={form} onSubmit={sendEmail}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Your email"
                  type="email"
                  name="from_name"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <div className="grid w-full gap-2">
                <Textarea
                  placeholder="Type your message here."
                  name="message"
                  className="min-h-[100px]"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm">{errors.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Feedback
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Feedback;
