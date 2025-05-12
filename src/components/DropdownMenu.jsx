import { useState, useRef, useEffect } from "react";

const DropdownMenu = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
          {items.map((item, index) => (
            <div
              key={index}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              <div className="flex items-center">
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
