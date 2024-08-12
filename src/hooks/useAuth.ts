import { auth } from "@/lib/firebase";
import { User } from "@/types";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

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

  return user;
};
