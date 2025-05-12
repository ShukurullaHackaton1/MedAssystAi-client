import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://med-assyst-ai-server.vercel.app/api/";

// Создаем инстанс axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (userData) => api.post("/auth/login", userData),
  getProfile: () => api.get("/auth/profile"),
};

// Chat API
export const chatAPI = {
  createChat: () => api.post("/chat"),
  getUserChats: () => api.get("/chat"),
  getChatById: (id) => api.get(`/chat/${id}`),
  sendMessage: (id, content) => api.post(`/chat/${id}/messages`, { content }),
  closeChat: (id) => api.put(`/chat/${id}/close`),
};

// Stats API (только для администраторов)
export const statsAPI = {
  getSymptomStats: (period = "month") =>
    api.get(`/stats/symptoms?period=${period}`),
  getDailyStats: (period = "month") => api.get(`/stats/daily?period=${period}`),
  getDiagnosisStats: (period = "month") =>
    api.get(`/stats/diagnosis?period=${period}`),
  getOverallStats: () => api.get("/stats/overall"),
};

export default api;
