import { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authAPI.getProfile();
        setUser(data);
      } catch (err) {
        console.error("Auth check error:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Регистрация
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem("token", data.token);
      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Ошибка регистрации";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Вход
  const login = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await authAPI.login(userData);
      localStorage.setItem("token", data.token);
      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Ошибка входа";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Выход
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Проверка роли администратора
  const isAdmin = () => {
    return user?.role === "admin";
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
