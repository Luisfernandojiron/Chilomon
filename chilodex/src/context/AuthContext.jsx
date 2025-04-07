import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState({
    userId: null,
    username: null,
    email: null
  });

  useEffect(() => {
    // Verificar autenticación al cargar
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    
    if (userId) {
      setIsAuthenticated(true);
      setUserData({
        userId,
        username,
        email
      });
    }
  }, []);

  const login = (userId, username, email) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    setIsAuthenticated(true);
    setUserData({ userId, username, email });
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setUserData({
      userId: null,
      username: null,
      email: null
    });
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userData,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};