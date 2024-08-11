import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/assets/Icons";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate } from "react-router-dom";

type SignInFormProps = React.HTMLAttributes<HTMLDivElement>;

export function SignInForm({ className, ...props }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "You have successfully signed in.",
      });
      navigate("/tools");
    } catch (error) {
      console.error("Error signing in with email and password", error);
      toast({
        title: "Error",
        description: "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithProvider(providerName: string) {
    setIsLoading(true);
    let provider;

    switch (providerName) {
      case "google":
        provider = new GoogleAuthProvider();
        break;
      case "github":
        provider = new GithubAuthProvider();
        break;
      case "apple":
        provider = new OAuthProvider("apple.com");
        break;
      default:
        setIsLoading(false);
        return;
    }

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Success",
        description: `You have successfully signed in with ${providerName}.`,
      });
      navigate("/tools");
    } catch (error) {
      console.error(`Error signing in with ${providerName}`, error);
      toast({
        title: "Error",
        description: `Failed to sign in with ${providerName}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                autoCapitalize="none"
                autoComplete="current-password"
                autoCorrect="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Login
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => signInWithProvider("google")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => signInWithProvider("apple")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.apple className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => signInWithProvider("github")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.GithubIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <svg
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill="none"
          viewBox="0 0 1920 1080"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* SVG content remains unchanged */}
        </svg>
      </div>
    </div>
  );
}