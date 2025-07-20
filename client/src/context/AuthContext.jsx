import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();


axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 
  const saveUserData = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

 
  const clearUserData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    if (storedUser) {
      try {
        
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, userData);
      localStorage.setItem('token', data.token);
      console.log('AuthContext: User data received after registration:', data.user); 
      saveUserData(data.user);
      return data;
    } catch (error) {
      if (error.response?.data?.user) {
        console.log('AuthContext: Partial user data received after failed registration:', error.response.data.user); 
        saveUserData(error.response.data.user);
      }
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Login credentials:', credentials); 
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, credentials);
      localStorage.setItem('token', data.token);
      console.log('AuthContext: User data received after login:', data.user); 
      saveUserData(data.user); 
      return data;
    } catch (error) {
      console.error('AuthContext: Login error:', error.response?.data || error.message); 
      if (error.response?.data?.user) {
        console.log('AuthContext: Partial user data received after failed login:', error.response.data.user); 
        saveUserData(error.response.data.user);
      }
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = () => {
    clearUserData();
  };

  const updateUser = (updatedUserData) => {
    saveUserData(updatedUserData);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, hasRole, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
