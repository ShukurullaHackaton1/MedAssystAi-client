import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSend,
  FiPlusCircle,
  FiMenu,
  FiX,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { chatAPI } from "../api";
import Modal from "../components/Modal";
import DropdownMenu from "../components/DropdownMenu";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import toast, { Toaster } from "react-hot-toast";

const ChatPage = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingAnimationRef = useRef(null);

  // Chatlarni yuklash
  const fetchChats = async () => {
    try {
      const { data } = await chatAPI.getUserChats();
      setChats(data);
    } catch (err) {
      console.error("Error fetching chats:", err);
      toast.error("Не удалось загрузить историю чатов");
    }
  };
  useEffect(() => {
    if (isAdmin()) {
      navigate("/admin");
    }
  }, []);

  // Chatni yuklash
  const fetchChat = async (chatId) => {
    try {
      setLoading(true);
      const { data } = await chatAPI.getChatById(chatId);
      setCurrentChat(data);
    } catch (err) {
      console.error("Error fetching chat:", err);
      toast.error("Не удалось загрузить чат");
    } finally {
      setLoading(false);
    }
  };

  // Yangi chat yaratish
  const createNewChat = async (initialMessage = "") => {
    try {
      setLoading(true);
      const { data } = await chatAPI.createChat();
      setChats([data, ...chats]);
      setCurrentChat(data);

      if (initialMessage.trim()) {
        setTimeout(async () => {
          try {
            // Foydalanuvchi xabarini qo'shamiz
            const updatedChat = {
              ...data,
              messages: [
                ...data.messages,
                {
                  sender: "user",
                  content: initialMessage,
                  timestamp: new Date(),
                },
              ],
            };
            setCurrentChat(updatedChat);

            // Serverga yuboramiz
            const response = await chatAPI.sendMessage(
              data._id,
              initialMessage
            );

            // Javobni animatsiya bilan ko'rsatamiz
            await showTypingAnimation(response.data);

            fetchChats();
          } catch (err) {
            console.error("Error sending initial message:", err);
            toast.error(
              err.response?.data?.message || "Не удалось отправить сообщение"
            );
          }
        }, 500);
      }

      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error("Error creating chat:", err);
      toast.error("Не удалось создать новый чат");
    } finally {
      setLoading(false);
    }
  };

  // Yozish animatsiyasini ko'rsatish
  const showTypingAnimation = async (chatData) => {
    const systemMessage = chatData.messages[chatData.messages.length - 1];
    const fullText = systemMessage.content;

    // Xabarni animatsiyasiz versiyasini saqlaymiz
    const finalMessage = {
      ...systemMessage,
      isTyping: false,
      animatedText: fullText,
    };

    // Animatsiya uchun boshlang'ich xabar
    const initialMessage = {
      ...systemMessage,
      isTyping: true,
      animatedText: "",
    };

    // Xabarni chatga qo'shamiz
    setCurrentChat((prev) => ({
      ...prev,
      messages: [...prev.messages, initialMessage],
    }));

    // Scroll qilamiz
    scrollToBottom();

    // Animatsiyani boshlaymiz
    let displayedText = "";
    const typingSpeed = 10; // ms
    const charsPerChunk = 3; // Har iteratsiyada 3 ta belgi

    return new Promise((resolve) => {
      const typeNextChunk = () => {
        if (displayedText.length < fullText.length) {
          displayedText = fullText.substring(
            0,
            displayedText.length + charsPerChunk
          );

          setCurrentChat((prev) => {
            const messages = [...prev.messages];
            const lastIndex = messages.length - 1;
            messages[lastIndex] = {
              ...messages[lastIndex],
              animatedText: displayedText,
            };
            return { ...prev, messages };
          });

          scrollToBottom();
          typingAnimationRef.current = setTimeout(typeNextChunk, typingSpeed);
        } else {
          // Animatsiya tugaganda final versiyasini saqlaymiz
          setCurrentChat((prev) => {
            const messages = [...prev.messages];
            const lastIndex = messages.length - 1;
            messages[lastIndex] = finalMessage;
            return { ...prev, messages };
          });

          scrollToBottom();
          resolve();
        }
      };

      typeNextChunk();
    });
  };

  // Scrollni pastga olib borish
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Xabar yuborish
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setLoading(true);
      const messageText = message;
      setMessage("");

      // Agar chat yo'q bo'lsa, yangisini yaratamiz
      if (!currentChat) {
        await createNewChat(messageText);
        return;
      }

      // Foydalanuvchi xabarini qo'shamiz
      const userMessage = {
        sender: "user",
        content: messageText,
        timestamp: new Date(),
      };

      setCurrentChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      scrollToBottom();

      // Serverga yuboramiz
      const { data } = await chatAPI.sendMessage(currentChat._id, messageText);

      // Javobni animatsiya bilan ko'rsatamiz
      await showTypingAnimation(data);

      // Chatlar ro'yxatini yangilaymiz
      fetchChats();
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error(
        err.response?.data?.message || "Не удалось отправить сообщение"
      );
    } finally {
      setLoading(false);
    }
  };

  // Tizim xabarlarini render qilish
  const renderSystemMessage = (msg) => {
    return (
      <div
        className={`prose dark:prose-invert prose-sm max-w-none text-gray-800 dark:text-gray-50 `}
      >
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          remarkPlugins={[remarkGfm]}
        >
          {msg.isTyping ? msg.animatedText : msg.content}
        </ReactMarkdown>
        {msg.isTyping && <span className="animate-pulse">|</span>}
      </div>
    );
  };

  // Scrollni yangi xabarlar paytida boshqarish
  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  // Komponent unmount paytida animatsiyani to'xtatish
  useEffect(() => {
    return () => {
      if (typingAnimationRef.current) {
        clearTimeout(typingAnimationRef.current);
      }
    };
  }, []);

  // Dastlabki chatlarni yuklash
  useEffect(() => {
    fetchChats();
  }, []);

  // Chiqish funksiyalari
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  // Sozlamalar sahifasiga o'tish
  const goToSettings = () => navigate("/settings");

  // Yangi konsultatsiya boshlash
  const goToHome = () => {
    setCurrentChat(null);
    setSidebarOpen(false);
  };

  // Sana formati
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Foydalanuvchi menyusi
  const userMenuItems = [
    { label: "Настройки", icon: <FiSettings />, onClick: goToSettings },
    { label: "Выйти", icon: <FiLogOut />, onClick: handleLogout },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === "dark" ? "#374151" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#000000",
          },
        }}
      />

      {/* Mobile navigation */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between lg:hidden">
        <button
          className="p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          MedAssystAI
        </h1>
        <div className="flex items-center space-x-2">
          {isAdmin() && (
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <FiUser size={18} />
            </button>
          )}
          <DropdownMenu
            trigger={
              <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">
                <FiUser size={18} />
              </button>
            }
            items={userMenuItems}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transform transition-transform duration-300 fixed lg:relative z-10 
        ${sidebarCollapsed ? "w-16" : "w-72"} h-full pt-16 lg:pt-0
        bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}
      >
        {/* Sidebar header */}
        <div
          className={`${
            sidebarCollapsed ? "hidden" : "hidden lg:flex"
          } items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700`}
        >
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            MedAssystAI
          </h1>
          <div className="flex gap-3">
            <div className="flex items-center space-x-2">
              <DropdownMenu
                trigger={
                  <button
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Профиль пользователя"
                  >
                    <FiUser size={18} />
                  </button>
                }
                items={userMenuItems}
              />
            </div>
            <div
              className={`lg:block ${
                sidebarCollapsed
                  ? "absolute hidden top-4 right-2 z-10"
                  : "relative"
              }`}
            >
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {sidebarCollapsed ? (
                  <FiMenu size={18} />
                ) : (
                  <FiChevronLeft size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsed sidebar header */}
        <div
          className={`${
            sidebarCollapsed ? "flex" : "hidden"
          } items-center justify-center pt-4 pb-2 border-b border-gray-200 dark:border-gray-700`}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 justify-center w-100 rounded-full mb-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {sidebarCollapsed ? (
              <FiMenu size={18} />
            ) : (
              <FiChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* New consultation button */}
        <div className={`p-4 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={goToHome}
            disabled={loading}
            className={`${
              sidebarCollapsed
                ? "p-2 rounded-full"
                : "w-full flex items-center justify-center px-4 py-2 rounded-md"
            } shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600`}
          >
            <FiPlusCircle className={sidebarCollapsed ? "" : "mr-2"} />
            {!sidebarCollapsed && "Новая консультация"}
          </button>
        </div>

        {/* Chat history */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {chats.length === 0 ? (
            <div
              className={`p-4 text-center text-gray-500 dark:text-gray-400 ${
                sidebarCollapsed ? "hidden" : ""
              }`}
            >
              У вас пока нет чатов. Создайте новую консультацию.
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  fetchChat(chat._id);
                  setSidebarOpen(false);
                }}
                className={`${
                  currentChat?._id === chat._id
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                } cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  sidebarCollapsed ? "py-4 px-2 text-center" : "p-4"
                }`}
                title={sidebarCollapsed ? chat.title : ""}
              >
                {sidebarCollapsed ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-medium">
                      {chat.title.charAt(0)}
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {chat.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(chat.updatedAt)}
                    </p>
                    {chat.diagnosis && (
                      <p className="mt-1 text-xs text-primary-600 dark:text-primary-400 truncate">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {chat.diagnosis.slice(0, 60)}
                        </ReactMarkdown>
                      </p>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        {!currentChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-8">
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                  MedAssystAI
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Опишите ваши симптомы, и я помогу с предварительным диагнозом
                </p>
              </div>

              <div className="w-full max-w-xl mx-auto">
                <form onSubmit={sendMessage} className="flex items-center mb-6">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Опишите ваши симптомы..."
                    className="flex-1 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md sm:text-sm"
                    disabled={loading}
                    ref={inputRef}
                  />
                  <button
                    type="submit"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
                    disabled={loading || !message.trim()}
                  >
                    {loading ? "Отправка..." : <FiSend />}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Симптомы
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Опишите свои симптомы подробно для более точного анализа
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Консультация
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Получите предварительный диагноз на основе ваших симптомов
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    История
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Система запоминает ваши предыдущие симптомы для более
                    точного анализа
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center">
              <button
                className="lg:hidden mr-2 text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={20} />
              </button>
              <div>
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                  {currentChat.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(currentChat.updatedAt)}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {currentChat.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                        msg.sender === "user"
                          ? "bg-primary-600 dark:bg-primary-700 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <p>{msg.content}</p>
                      ) : (
                        renderSystemMessage(msg)
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "user"
                            ? "text-primary-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formatDate(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={sendMessage} className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите ваши симптомы..."
                  className="flex-1 border-gray-300 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md sm:text-sm"
                  disabled={loading}
                  ref={inputRef}
                />
                <button
                  type="submit"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
                  disabled={loading || !message.trim()}
                >
                  {loading ? "Отправка..." : <FiSend />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Logout confirmation modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Подтверждение выхода"
        actions={
          <>
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Отмена
            </button>
            <button
              onClick={confirmLogout}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Выйти
            </button>
          </>
        }
      >
        <p className="text-gray-700 dark:text-gray-300">
          Вы действительно хотите выйти из аккаунта?
        </p>
      </Modal>
    </div>
  );
};

export default ChatPage;
