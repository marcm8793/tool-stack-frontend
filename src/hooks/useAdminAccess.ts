import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const useAdminAccess = (redirectPath: string = "/") => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        if (token.claims.admin) {
          setIsAdmin(true);
        } else {
          navigate(redirectPath);
        }
      } else {
        navigate(redirectPath);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, redirectPath]);

  return { isAdmin, loading };
};
