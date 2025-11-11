import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = "http://localhost:5000";

interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin" | "repairer";
  roomNo?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("access_token");

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
    }

    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }
  }, []);

  const fetchProfile = async (tokenToUse?: string) => {
    const token = tokenToUse || localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Profile failed");

      const profile: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        roomNo: data.roomNo || "",
      };
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (err) {
    }
  };


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;

      const data = await res.json();
      localStorage.setItem("access_token", data.access);
      setToken(data.access);

      await fetchProfile();

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const signup = async (form: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.name,
          email: form.email,
          password: form.password,
          role: form.role || "student",
          roomNo: form.roomNo,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error("Signup failed:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
