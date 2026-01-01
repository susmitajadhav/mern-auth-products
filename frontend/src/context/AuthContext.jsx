import { createContext, useContext, useEffect, useState } from "react";
import { createAuthFetch } from "../utils/authFetch";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          credentials: "include", // IMPORTANT: allow HttpOnly cookie
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };
  const refresh = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Refresh Failed");
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.accessToken;
    } catch (error) {
      throw error;
    }
  };

  // inside AuthProvider
const authFetch = createAuthFetch({
  getAccessToken: () => accessToken,
  refresh,
  logout,
});

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refresh();
      } catch (error) {
        // not logged in
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, login, logout, refresh ,authFetch,}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
