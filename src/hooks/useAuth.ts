import { auth } from "@/lib/firebase";
import { User } from "@/types";
import { useEffect, useMemo, useState } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthContextType>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (firebaseUser) => {
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
          setAuthState({ user, loading: false, error: null });
        } else {
          setAuthState({ user: null, loading: false, error: null });
        }
      },
      (error) => {
        setAuthState({ user: null, loading: false, error });
      }
    );

    return () => unsubscribe();
  }, []);

  return useMemo(() => authState, [authState]);
};
