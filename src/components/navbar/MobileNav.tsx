import { useAuth } from "@/hooks/useAuth";
import { ModeToggle } from "./Mode-toggle";
import { UserNav } from "./user-nav";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const MobileNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex space-x-2">
      <ModeToggle />
      {user ? (
        <UserNav />
      ) : (
        <Button onClick={() => navigate("/signin")}>Sign In</Button>
      )}
    </div>
  );
};

export default MobileNav;
