import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../api/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add states to store user metadata and preferences
  const [userMetadata, setUserMetadata] = useState(null);
  const [preferences, setPreferences] = useState({
    theme: "system",
    notifications: "in-app",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();

            setRole(data?.role || null);
            setUserMetadata(data);

             // Extract and set preferences if available
             const updatedPreferences = {
              theme: data?.theme || "system",
              notifications: data?.notifications || "in-app",
            };

            setPreferences(updatedPreferences);

            // **Patch missing preferences** to Firestore
            if (!data?.theme || !data?.notifications) {
              await updateDoc(userRef, {
                theme: updatedPreferences.theme,
                notifications: updatedPreferences.notifications,
              });
              console.log("User preferences backfilled.");
            }
          } else {
            console.error("User document does not exist in Firestore.");
            setRole(null);
            setPreferences({
              theme: "system",
              notifications: "in-app",
            });
          }
        } else {
          setRole(null);
          setPreferences({
            theme: "system",
            notifications: "in-app",
          });
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user role: ", error.message);
        setRole(null);
        setPreferences({
          theme: "system",
          notifications: "in-app",
        });
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Context value includes preferences
  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        userMetadata,
        preferences,
        setPreferences, // Provide a setter to update preferences globally
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
