import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Starts true to prevent premature redirects

  useEffect(() => {
    // Check if a session already exists on application boot
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Corrupted auth data, clearing session.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false); // Auth status is now verified!
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Hit your backend login endpoint
      const response = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      const { token, user: userData } = response.data;

      // 2. Save tokens securely to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // 3. Update global React state
      setUser(userData);
      return { success: true };
    } catch (error) {
      setUser(null);
      return { 
        success: false, 
        message: error.response?.data?.error || "Login failed. Check your network or credentials." 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
};