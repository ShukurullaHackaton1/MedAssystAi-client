import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBarChart2,
  FiCalendar,
  FiPieChart,
  FiActivity,
  FiSun,
  FiMoon,
  FiLogOut,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { statsAPI } from "../api";
import { useTheme } from "../context/ThemeContext";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

// Регистрация компонентов ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale
);

// Функция для обработки симптомов (улучшенная логика)
const processSymptoms = (symptoms) => {
  // Словарь для группировки похожих симптомов
  const symptomGroups = {
    "Головная боль": [
      "головная боль",
      "болит голова",
      "голова болит",
      "мигрень",
      "головные боли",
    ],
    "Боль в горле": [
      "горло болит",
      "боль в горле",
      "болит горло",
      "першит в горле",
      "болезненное глотание",
    ],
    Насморк: [
      "насморк",
      "заложенный нос",
      "течет из носа",
      "ринит",
      "заложенность носа",
    ],
    Кашель: ["кашель", "кашляю", "сухой кашель", "мокрый кашель", "кашляет"],
    Температура: [
      "температура",
      "лихорадка",
      "жар",
      "температурю",
      "повышенная температура",
      "фебрильная",
    ],
    "Боль в животе": [
      "боль в животе",
      "болит живот",
      "живот болит",
      "спазмы в животе",
      "боли в животе",
    ],
    Тошнота: ["тошнота", "тошнит", "рвота", "рвет", "позывы к рвоте"],
    Диарея: [
      "диарея",
      "понос",
      "жидкий стул",
      "частый стул",
      "расстройство стула",
    ],
    Сыпь: [
      "сыпь",
      "высыпания",
      "крапивница",
      "красные пятна",
      "зуд кожи",
      "чешется кожа",
    ],
    "Боль в суставах": [
      "боль в суставах",
      "болят суставы",
      "артралгия",
      "ломота в суставах",
    ],
    Головокружение: [
      "головокружение",
      "кружится голова",
      "чувство вращения",
      "неустойчивость",
    ],
    Слабость: ["слабость", "утомляемость", "вялость", "упадок сил", "астения"],
    Одышка: [
      "одышка",
      "тяжело дышать",
      "нехватка воздуха",
      "затрудненное дыхание",
    ],
    "Боль в груди": [
      "боль в груди",
      "грудная боль",
      "давит грудь",
      "сдавливание в груди",
    ],
    Аллергия: ["аллергия", "аллергическая реакция", "отек", "зуд и сыпь"],
  };

  // Обработка и группировка симптомов
  const groupedSymptoms = {};

  symptoms.forEach((symptom) => {
    // Приведение текста к нижнему регистру для сравнения
    const lowerCaseSymptom = symptom.toLowerCase();

    // Поиск соответствующей группы
    let matched = false;

    for (const [group, keywords] of Object.entries(symptomGroups)) {
      if (keywords.some((keyword) => lowerCaseSymptom.includes(keyword))) {
        // Увеличиваем счетчик для этой группы
        groupedSymptoms[group] = (groupedSymptoms[group] || 0) + 1;
        matched = true;
        break;
      }
    }

    // Если не найдена группа, считаем как "Другие симптомы"
    if (!matched) {
      groupedSymptoms["Другие симптомы"] =
        (groupedSymptoms["Другие симптомы"] || 0) + 1;
    }
  });

  // Преобразуем в массив объектов для диаграммы
  return Object.entries(groupedSymptoms)
    .map(([symptom, count]) => ({
      symptom,
      count,
    }))
    .sort((a, b) => b.count - a.count); // Сортировка по убыванию
};

// Компонент со статистикой по симптомам
const SymptomStatsChart = ({ period }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: rawData } = await statsAPI.getSymptomStats(period);

        // Обработка данных с улучшенной логикой
        const processedData = processSymptoms(
          rawData.map((item) => item.symptom)
        );

        const chartData = {
          labels: processedData.map((item) => item.symptom),
          datasets: [
            {
              label: "Количество",
              data: processedData.map((item) => item.count),
              backgroundColor: "rgba(99, 102, 241, 0.8)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 1,
            },
          ],
        };

        setData(chartData);
      } catch (err) {
        console.error("Error fetching symptom stats:", err);
        setError("Не удалось загрузить статистику по симптомам");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) return <div className="text-center p-4">Загрузка...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  if (!data || data.labels.length === 0)
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        Нет данных
      </div>
    );

  return (
    <Bar
      data={data}
      options={{
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: theme === "dark" ? "#e2e8f0" : "#1e293b",
            },
          },
          title: {
            display: true,
            text: "Частота симптомов",
            color: theme === "dark" ? "#e2e8f0" : "#1e293b",
          },
        },
        scales: {
          x: {
            ticks: {
              color: theme === "dark" ? "#cbd5e1" : "#475569",
            },
            grid: {
              color:
                theme === "dark"
                  ? "rgba(203, 213, 225, 0.1)"
                  : "rgba(71, 85, 105, 0.1)",
            },
          },
          y: {
            ticks: {
              color: theme === "dark" ? "#cbd5e1" : "#475569",
            },
            grid: {
              color:
                theme === "dark"
                  ? "rgba(203, 213, 225, 0.1)"
                  : "rgba(71, 85, 105, 0.1)",
            },
          },
        },
      }}
    />
  );
};

// Компонент со статистикой по дням
const DailyStatsChart = ({ period }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await statsAPI.getDailyStats(period);

        const chartData = {
          labels: data.map((item) => item.date),
          datasets: [
            {
              label: "Количество обращений",
              data: data.map((item) => item.count),
              fill: false,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              tension: 0.1,
            },
          ],
        };

        setData(chartData);
      } catch (err) {
        console.error("Error fetching daily stats:", err);
        setError("Не удалось загрузить статистику по дням");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) return <div className="text-center p-4">Загрузка...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  if (!data || data.labels.length === 0)
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        Нет данных
      </div>
    );

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: theme === "dark" ? "#e2e8f0" : "#1e293b",
            },
          },
          title: {
            display: true,
            text: "Обращения по дням",
            color: theme === "dark" ? "#e2e8f0" : "#1e293b",
          },
        },
        scales: {
          x: {
            ticks: {
              color: theme === "dark" ? "#cbd5e1" : "#475569",
            },
            grid: {
              color:
                theme === "dark"
                  ? "rgba(203, 213, 225, 0.1)"
                  : "rgba(71, 85, 105, 0.1)",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: theme === "dark" ? "#cbd5e1" : "#475569",
            },
            grid: {
              color:
                theme === "dark"
                  ? "rgba(203, 213, 225, 0.1)"
                  : "rgba(71, 85, 105, 0.1)",
            },
          },
        },
      }}
    />
  );
};

// Компонент со статистикой по диагнозам
const DiagnosisStatsChart = ({ period }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await statsAPI.getDiagnosisStats(period);

        // Генерация случайных цветов для диаграммы
        const colors = data.map(() => {
          const r = Math.floor(Math.random() * 255);
          const g = Math.floor(Math.random() * 255);
          const b = Math.floor(Math.random() * 255);
          return `rgba(${r}, ${g}, ${b}, 0.8)`;
        });

        const chartData = {
          labels: data.map((item) => item.diagnosis),
          datasets: [
            {
              label: "Количество",
              data: data.map((item) => item.count),
              backgroundColor: colors,
              borderColor: colors.map((c) => c.replace("0.8", "1")),
              borderWidth: 1,
            },
          ],
        };

        setData(chartData);
      } catch (err) {
        console.error("Error fetching diagnosis stats:", err);
        setError("Не удалось загрузить статистику по диагнозам");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) return <div className="text-center p-4">Загрузка...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  if (!data || data.labels.length === 0)
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        Нет данных
      </div>
    );

  return (
    <Pie
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: theme === "dark" ? "#e2e8f0" : "#1e293b",
            },
          },
          title: {
            display: true,
            text: "Распределение диагнозов",
            color: theme === "dark" ? "#e2e8f0" : "#1e293b",
          },
        },
      }}
    />
  );
};

// Компонент с общей статистикой
const StatsOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await statsAPI.getOverallStats();
        setData(data);
      } catch (err) {
        console.error("Error fetching overall stats:", err);
        setError("Не удалось загрузить общую статистику");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center p-4">Загрузка...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  if (!data)
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        Нет данных
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <FiActivity className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Всего консультаций
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {data.totalChats}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <FiCalendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Консультаций сегодня
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {data.todayChats}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <FiPieChart className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Уникальных диагнозов
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {data.uniqueDiagnoses}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <FiBarChart2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Активных пользователей
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {data.activeUsers}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const { logout } = useAuth();
  const [period, setPeriod] = useState("month");
  const { theme, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Панель администратора
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              title={
                theme === "dark"
                  ? "Переключить на светлую тему"
                  : "Переключить на темную тему"
              }
            >
              {theme === "dark" ? (
                <FiSun className="mr-2" />
              ) : (
                <FiMoon className="mr-2" />
              )}
              {theme === "dark" ? "Светлая тема" : "Темная тема"}
            </button>
            <button
              onClick={() => handleLogout()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              title={
                theme === "dark"
                  ? "Переключить на светлую тему"
                  : "Переключить на темную тему"
              }
            >
              {theme === "dark" ? (
                <FiLogOut className="" color="#fff" />
              ) : (
                <FiLogOut className="" color="#000" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 shadow rounded-lg transition-colors duration-200">
          <label
            htmlFor="period"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Период:
          </label>
          <select
            id="period"
            name="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-colors duration-200"
          >
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </div>

        <div className="mb-6">
          <StatsOverview />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg transition-colors duration-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Обращения по дням
            </h2>
            <DailyStatsChart period={period} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg transition-colors duration-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Распределение диагнозов
            </h2>
            <DiagnosisStatsChart period={period} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg lg:col-span-2 transition-colors duration-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Популярные симптомы
            </h2>
            <SymptomStatsChart period={period} />
          </div>
        </div>
      </main>
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

export default AdminPage;
