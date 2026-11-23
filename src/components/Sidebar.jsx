import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import {
  HideSidebar,
  CloseSidebarIcon,
  SelReports,
  SelTests,
  SelUsers,
  UNSelUsers,
  UNSelTests,
  UNSelReports,
  school,
  unselectedschool,
} from "../utils/imagePath";

const OPEN_KEY = "pdld:sidebarOpen";

// Remembered between visits; on a first visit a narrow screen starts collapsed
const initialOpen = () => {
  try {
    const saved = localStorage.getItem(OPEN_KEY);
    if (saved === "1" || saved === "0") return saved === "1";
  } catch {
    // storage blocked: use the default below
  }
  return typeof window === "undefined" || window.innerWidth >= 1024;
};

const LEARNING_PATH = "/reports/learning-progress";

// Small line icons for the two shortcuts (the main four keep their existing pictures)
const LineIcon = ({ children }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
    {children}
  </svg>
);
LineIcon.propTypes = { children: PropTypes.node.isRequired };

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, isOpen ? "1" : "0");
    } catch {
      // nothing to remember it in
    }
  }, [isOpen]);

  const inLearning = path.startsWith(LEARNING_PATH);

  // Main menu: path, label, pictures, and when it counts as the current page
  const mainItems = [
    {
      to: "/allTest",
      label: "Tests",
      selectedImage: SelTests,
      unselectedImage: UNSelTests,
      active: path === "/allTest" || path === "/" || path === "/testCreationForm" || path.includes("/editTest/") || path.startsWith("/allTest/"),
    },
    {
      to: "/schools",
      label: "Schools",
      selectedImage: unselectedschool,
      unselectedImage: school,
      active: path.startsWith("/schools"),
    },
    {
      to: "/users",
      label: "Users",
      selectedImage: SelUsers,
      unselectedImage: UNSelUsers,
      active: path.startsWith("/users"),
    },
    {
      to: "/reports",
      label: "Reports",
      selectedImage: SelReports,
      unselectedImage: UNSelReports,
      // Learning Progress has its own shortcut below, so Reports is current for the other reports
      active: path.startsWith("/reports") && !inLearning,
    },
  ];

  const shortcuts = [
    {
      to: LEARNING_PATH,
      label: "Learning Progress",
      icon: (
        <LineIcon>
          <path d="M3 3v18h18" />
          <path d="M7 15l4-5 3 3 5-7" />
        </LineIcon>
      ),
      active: inLearning,
    },
  ];

  const itemClass = (active) =>
    `flex items-center gap-3 rounded-md p-2 min-h-11 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD700] ${
      active ? "bg-white text-[#2F4F4F]" : "text-white hover:bg-white/15"
    } ${isOpen ? "" : "justify-center"}`;
  const labelStyle = (active) => ({
    fontFamily: "'Work Sans', sans-serif",
    fontSize: "18px",
    fontWeight: active ? 600 : 400,
  });

  return (
    <aside
      className={`bg-[#2F4F4F] text-white overflow-x-hidden overflow-y-auto transition-all duration-300 flex flex-col shrink-0 ${isOpen ? "w-[236px]" : "w-16"}`}
      style={{ borderRadius: "0px 8px 8px 0px" }}
    >
      <button
        type="button"
        className={`m-2 p-2 rounded-md hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD700] ${isOpen ? "text-left" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide menu" : "Show menu"}
        title={isOpen ? undefined : "Show menu"}
      >
        <div className="flex items-center pl-1">
          <img src={isOpen ? HideSidebar : CloseSidebarIcon} alt="" className={`w-5 h-5 ${isOpen ? "mr-4" : ""}`} />
          {isOpen && <span style={{ fontFamily: "Karla, sans-serif", fontSize: "18px", fontWeight: 600 }}>Hide</span>}
        </div>
      </button>

      <nav aria-label="Main menu" className="mt-4 px-2 flex flex-col flex-1">
        <ul className="m-0 p-0 list-none flex flex-col gap-2">
          {mainItems.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={itemClass(item.active)} aria-current={item.active ? "page" : undefined} aria-label={item.label} title={isOpen ? undefined : item.label}>
                <img src={item.active ? item.selectedImage : item.unselectedImage} alt="" className="shrink-0" />
                {isOpen && <span style={labelStyle(item.active)}>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-white/20" />
        <ul className="m-0 p-0 list-none flex flex-col gap-2 mb-4">
          {shortcuts.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={itemClass(item.active)} aria-current={item.active ? "page" : undefined} aria-label={item.label} title={isOpen ? undefined : item.label}>
                {item.icon}
                {isOpen && <span style={labelStyle(item.active)}>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
