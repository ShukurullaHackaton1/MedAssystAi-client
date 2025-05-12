import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiLock,
  FiMail,
  FiSave,
  FiMoon,
  FiSun,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Modal from "../components/Modal";

// API сервис для обновления данных пользователя
// Важно: этот сервис должен быть реализован на бэкенде
const userAPI = {
  updateProfile: async (userId, data) => {
    // Имитация API-запроса
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },

  changePassword: async (userId, data) => {
    // Имитация API-запроса
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },
};

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [generalData, setGeneralData] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Загружаем данные пользователя
  useEffect(() => {
    if (user) {
      setGeneralData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Обработчик изменения общих данных
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик изменения пароля
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Сохранение общих данных
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Здесь должен быть запрос к API для обновления данных
      await userAPI.updateProfile(user._id, generalData);

      setMessage({
        type: "success",
        text: "Данные профиля успешно обновлены!",
      });

      // Здесь можно обновить данные пользователя в контексте аутентификации
    } catch (error) {
      setMessage({
        type: "error",
        text: "Не удалось обновить данные профиля.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Изменение пароля
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Проверка на совпадение паролей
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Новый пароль и подтверждение не совпадают.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Здесь должен быть запрос к API для смены пароля
      await userAPI.changePassword(user._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({
        type: "success",
        text: "Пароль успешно изменен!",
      });

      // Очищаем поля пароля
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Не удалось изменить пароль. Проверьте правильность текущего пароля.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Заголовок */}
      <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="mr-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Настройки
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:gap-6">
          {/* Боковая навигация */}
          <div className="md:w-1/4 mb-6 md:mb-0">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg transition-colors duration-200">
              <div className="px-4 py-5 sm:p-6">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("general")}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "general"
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FiUser className="mr-3 h-5 w-5" />
                    Общие настройки
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "password"
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FiLock className="mr-3 h-5 w-5" />
                    Изменение пароля
                  </button>
                  <button
                    onClick={() => setActiveTab("appearance")}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === "appearance"
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {theme === "dark" ? (
                      <FiMoon className="mr-3 h-5 w-5" />
                    ) : (
                      <FiSun className="mr-3 h-5 w-5" />
                    )}
                    Внешний вид
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="md:w-3/4">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg transition-colors duration-200">
              {message.text && (
                <div
                  className={`px-4 py-3 ${
                    message.type === "success"
                      ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="px-4 py-5 sm:p-6">
                {activeTab === "general" && (
                  <form onSubmit={handleSaveGeneral}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                          Общие настройки
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Обновите свои персональные данные
                        </p>
                      </div>

                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-4">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Имя
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={generalData.name}
                            onChange={handleGeneralChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Email
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <div className="relative flex items-stretch flex-grow">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="text-gray-400" />
                              </div>
                              <input
                                type="email"
                                name="email"
                                id="email"
                                value={generalData.email}
                                onChange={handleGeneralChange}
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
                      >
                        <FiSave className="mr-2 -ml-1 h-5 w-5" />
                        Сохранить
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "password" && (
                  <form onSubmit={handleChangePassword}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                          Изменение пароля
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Обновите свой пароль для входа в систему
                        </p>
                      </div>

                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-4">
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Текущий пароль
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Новый пароль
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength="6"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Подтверждение пароля
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength="6"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
                      >
                        <FiSave className="mr-2 -ml-1 h-5 w-5" />
                        Изменить пароль
                      </button>
                    </div>
                  </form>
                )}
                {activeTab === "appearance" && (
                  <div>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                          Настройки внешнего вида
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Изменение темы приложения
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="flex items-center">
                          {theme === "dark" ? (
                            <FiMoon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <FiSun className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className="ml-3 text-gray-700 dark:text-gray-300">
                            {theme === "dark" ? "Темная тема" : "Светлая тема"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#6366f1" : "#d1d5db",
                          }}
                        >
                          <span
                            className={`${
                              theme === "dark"
                                ? "translate-x-5"
                                : "translate-x-0"
                            } relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                          >
                            <span
                              className={`${
                                theme === "dark"
                                  ? "opacity-0 ease-out duration-100"
                                  : "opacity-100 ease-in duration-200"
                              } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                            >
                              <FiSun className="h-3 w-3 text-gray-400" />
                            </span>
                            <span
                              className={`${
                                theme === "dark"
                                  ? "opacity-100 ease-in duration-200"
                                  : "opacity-0 ease-out duration-100"
                              } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                            >
                              <FiMoon className="h-3 w-3 text-primary-600" />
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Подтверждение"
        actions={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                // Действие подтверждения
                setShowModal(false);
              }}
              className="ml-3 px-4 py-2 bg-primary-600 dark:bg-primary-700 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Подтвердить
            </button>
          </>
        }
      >
        <p className="text-gray-700 dark:text-gray-300">
          Вы уверены, что хотите выполнить это действие?
        </p>
      </Modal>
    </div>
  );
};

export default SettingsPage;
