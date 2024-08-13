import { auth, db, storage } from "@/lib/firebase";
import { User } from "@/types";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
      async (firebaseUser) => {
        if (firebaseUser) {
          let photoURL = firebaseUser.photoURL;

          // Determine the displayName: if not provided, use the part before the @ in the email
          let displayName = firebaseUser.displayName;
          if (!displayName && firebaseUser.email) {
            displayName = firebaseUser.email.split("@")[0];
          }

          // Check if the user document already exists in Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!photoURL && !userDocSnapshot.exists()) {
            // Generate a random avatar using the Dicebear API
            const response = await fetch(
              `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${firebaseUser.uid}`
            );
            if (response.ok) {
              const blob = await response.blob();
              const storageRef = ref(
                storage,
                `users_avatar/${firebaseUser.uid}.svg`
              );

              // Upload the avatar to Firebase Storage
              await uploadBytes(storageRef, blob);

              // Get the download URL
              photoURL = await getDownloadURL(storageRef);

              // Store the user in the database with the generated avatar URL
              const user: User = {
                email: firebaseUser.email,
                uid: firebaseUser.uid,
                displayName,
                photoURL,
                emailVerified: firebaseUser.emailVerified,
                isAnonymous: firebaseUser.isAnonymous,
                phoneNumber: firebaseUser.phoneNumber,
              };

              await setDoc(userDocRef, user, { merge: true });
            }
          } else if (userDocSnapshot.exists()) {
            // Use the photoURL from Firestore if it exists
            const userData = userDocSnapshot.data() as User;
            photoURL = userData.photoURL;
          }

          const user: User = {
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            displayName,
            photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
            phoneNumber: firebaseUser.phoneNumber,
          };

          setAuthState({ user, loading: false, error: null });

          // Always ensure the Firestore document is up-to-date
          await setDoc(userDocRef, user, { merge: true });
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
