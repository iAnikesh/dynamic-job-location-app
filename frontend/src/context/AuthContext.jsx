import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { name, email, role, ... }
  const API = import.meta.env.VITE_API_URL;

  // updater exposed to components to update selectedLocation locally
  const updateLocation = (loc) => {
    setUser((prev) => (prev ? { ...prev, selectedLocation: loc } : prev));
  };

  useEffect(() => {
    // Try to fetch current user (server should expose /api/auth/me)
    async function loadUser() {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) return setUser(null);
        const data = await res.json();
        setUser({ ...data.user, selectedLocation: data.user?.selectedLocation || "" });
      } catch (err) {
        setUser(null);
      }
    }
    loadUser();
  }, [API]);

  const login = (userData) => setUser(userData);
  const logout = async () => {
    // call logout route to clear cookie
    await fetch(`${API}/api/auth/logout`, {
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateLocation }}>
      {children}
    </AuthContext.Provider>
  );
}