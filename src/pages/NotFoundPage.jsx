import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          Страница не найдена
        </h2>
        <p className="mt-2 text-gray-600">
          Извините, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiArrowLeft className="mr-2" />
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
