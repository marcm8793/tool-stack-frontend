import { useNavigate } from "react-router-dom";
import { ModeToggle } from "./Mode-toggle";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { User } from "@/types";
import { UserNav } from "./user-nav";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: User | null) => {
      if (firebaseUser) {
        const user: User = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          isAnonymous: firebaseUser.isAnonymous,
          phoneNumber: firebaseUser.phoneNumber,
        };
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="flex space-x-2">
      <UserNav />
      <ModeToggle />
      {user ? (
        <div className="flex items-center space-x-2">
          <span>{user.email}</span>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      ) : (
        <Button onClick={() => navigate("/signin")}>Sign In</Button>
      )}
    </div>
  );
};

export default Navbar;
