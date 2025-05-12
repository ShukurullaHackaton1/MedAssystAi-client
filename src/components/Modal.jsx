import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  const modalRef = useRef(null);

  // Обработка нажатия клавиши Escape для закрытия модального окна
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Блокировка прокрутки основного содержимого
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto"; // Восстановление прокрутки
    };
  }, [isOpen, onClose]);

  // Обработка клика за пределами модального окна
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-colors duration-200"
        aria-modal="true"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4">{children}</div>

        {actions && (
          <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
