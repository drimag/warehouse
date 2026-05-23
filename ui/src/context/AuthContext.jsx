import { createContext, useState, useEffect } from 'react';

// 1. Create and export the raw context object itself
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (import.meta.env.DEV) { 
      const mockAdminUser = {
        name: "Test Admin Account",
        email: "admin@company.com",
        role: "ADMIN"
      };
      localStorage.setItem('token', 'dev_testing_mock_jwt_token_payload');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));
      setUser(mockAdminUser);
      setLoading(false);
      return;
    }

    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};