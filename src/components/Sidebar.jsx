import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import chevronLeftIcon from "../assets/chevron_left.svg"

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation(); // Detects current route

  // Menu data (path + label)
  const menuItems = [
    { to: "/createTest", label: "Test" },
    { to: "/users", label: "Users" },
    { to: "/reports", label: "Reports" },
    { to: "/help", label: "Help and Support" },
  ];

  return ( 
    <div
      className={`bg-[#2F4F4F] text-white   ${
        isOpen ? "w-60" : "w-16"
      } transition-all duration-300 overflow-y-auto`}
      style={{
        marginTop: "0px",
        height: "calc(100vh - 72px)",
      }}
    >
      {/* Toggle Button */}
      <button className="p-2 m-2" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <div className="flex items-center">
            <img src={chevronLeftIcon} alt="Hide" className="w-4 h-4 mr-1" />
            <span>Hide</span>
          </div>
        ) : (
          <span className="text-xl">▶</span>
        )}
      </button>

      {/* Navigation */}
      <nav className="mt-4 flex flex-col space-y-2 px-2">
        {menuItems.map((item) => {
          // Determine if this item is currently active
          const isActive = location.pathname === item.to;

          return (
            <Link key={item.to} to={item.to}>
              <li
                className={`list-none flex items-center rounded-md p-2 cursor-pointer
                  ${
                    isActive
                      ? "bg-white text-[#2F4F4F]"
                      : "bg-transparent hover:bg-white hover:text-[#2F4F4F]"
                  }
                `}
              >
                {/* Circle Icon (Always Visible) */}
                <span className="w-6 h-6 bg-gray-300 rounded-full mr-2"></span>

                {/* Text (Visible only when isOpen is true) */}
                {isOpen && <span className="font-medium">{item.label}</span>}
              </li>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
