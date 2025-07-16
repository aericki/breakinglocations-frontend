// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/api/locationApi'; // Assuming api is exported from here
import { User as AppUser } from '@/types'; // Your backend user type

// Define the shape of the context data
interface AuthContextType {
  firebaseUser: FirebaseUser | null; // The user object from Firebase Auth
  appUser: AppUser | null; // The user object from your backend
  loading: boolean;
  refreshAppUser: () => Promise<void>; // Function to manually refresh appUser
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  appUser: null,
  loading: true,
  refreshAppUser: async () => {},
});

// Create a provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppUser = useCallback(async (user: FirebaseUser) => {
    try {
      const token = await user.getIdToken();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      const response = await api.get(`/api/users/${user.uid}`, { headers });
      setAppUser(response.data);
    } catch (error) {
      console.error("Error fetching app user profile:", error);
      setAppUser(null); // Clear appUser if fetch fails
    }
  }, []);

  const refreshAppUser = useCallback(async () => {
    if (firebaseUser) {
      await fetchAppUser(firebaseUser);
    }
  }, [firebaseUser, fetchAppUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        await fetchAppUser(currentUser);
      } else {
        setAppUser(null); // Clear appUser if no Firebase user
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAppUser]);

  const value = {
    firebaseUser,
    appUser,
    loading,
    refreshAppUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
