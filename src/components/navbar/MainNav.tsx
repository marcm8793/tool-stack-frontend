import { useNavigate } from "react-router-dom";
import { ModeToggle } from "./Mode-toggle";
import { Button } from "../ui/button";
import { UserNav } from "./user-nav";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const user = useAuth();
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

export default Navbar;
