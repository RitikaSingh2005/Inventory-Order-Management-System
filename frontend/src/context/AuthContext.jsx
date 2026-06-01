import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dummyUser = { email: 'admin@shopverse.com', role: 'Admin', full_name: 'Shopverse Admin' };
  const [user, setUser] = useState(dummyUser);
  const [token, setToken] = useState("dummy-token");
  const loading = false;

  const login = (data) => {
    // No-op
  };

  const logout = () => {
    // No-op
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
