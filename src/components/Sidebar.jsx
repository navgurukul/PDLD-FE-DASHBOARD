import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import pdldLogo from "../assets/pdld-badge.svg";

// Expanded or not, remembered between visits. The rail (icon + label) is the default.
const OPEN_KEY = "pdld:sidebarOpen";
const initialOpen = () => {
  try {
    return localStorage.getItem(OPEN_KEY) === "1";
  } catch {
    return false;
  }
};

const LEARNING_PATH = "/reports/learning-progress";

const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
    {children}
  </svg>
);
Icon.propTypes = { children: PropTypes.node.isRequired, size: PropTypes.number };

const ICONS = {
  tests: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  schools: (
    <>
      <path d="M3 10l9-6 9 6" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 4.5a3.5 3.5 0 010 7M21 20c0-2.6-1.6-4.8-4-5.6" />
    </>
  ),
  reports: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  learning: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-7" />
    </>
  ),
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const path = useLocation().pathname;

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, isOpen ? "1" : "0");
    } catch {
      // nothing to remember it in
    }
  }, [isOpen]);

  const inLearning = path.startsWith(LEARNING_PATH);
  const groups = [
    [
      { to: "/allTest", label: "Tests", short: "Tests", icon: "tests", active: path === "/allTest" || path === "/" || path === "/testCreationForm" || path.includes("/editTest/") || path.startsWith("/allTest/") },
      { to: "/schools", label: "Schools", short: "Schools", icon: "schools", active: path.startsWith("/schools") },
      { to: "/users", label: "Users", short: "Users", icon: "users", active: path.startsWith("/users") || path.startsWith("/userCreationForm") },
    ],
    [
      // Learning Progress has its own entry, so Reports is current for the other reports
      { to: "/reports", label: "Reports", short: "Reports", icon: "reports", active: path.startsWith("/reports") && !inLearning },
      { to: LEARNING_PATH, label: "Learning Progress", short: "Learning", icon: "learning", active: inLearning },
    ],
  ];
  const items = groups.flat();
  const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD700]";

  return (
    <>
      {/* tablets and computers: a rail (icon + short label) that the edge arrow widens into a full menu */}
      <aside
        data-testid="side-bar"
        data-expanded={isOpen ? "true" : "false"}
        className={`relative hidden md:flex shrink-0 flex-col bg-[#2F4F4F] text-white transition-[width] duration-200 ${isOpen ? "w-[232px]" : "w-[84px]"}`}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="main-menu"
          aria-label={isOpen ? "Collapse menu" : "Expand menu"}
          title={isOpen ? "Collapse menu" : "Expand menu"}
          data-testid="side-bar-toggle"
          className={`absolute -right-3.5 top-[22px] z-30 w-7 h-7 rounded-full bg-white border border-[#D5DDDD] text-[#2F4F4F] shadow flex items-center justify-center hover:bg-[#F6F8F8] ${focusRing}`}
        >
          <Icon size={14}>{isOpen ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}</Icon>
        </button>

        <Link to="/allTest" className={`flex items-center gap-2.5 h-[60px] shrink-0 rounded-lg ${isOpen ? "px-4" : "justify-center"} ${focusRing}`} aria-label="PDLD home">
          <img src={pdldLogo} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "contain", background: "#ffffff" }} />
          {isOpen && (
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-extrabold text-base" style={{ fontFamily: "Karla, sans-serif" }}>PDLD</span>
              <span className="text-[11px] text-[#C9D6D6] truncate">Dantewada dashboard</span>
            </span>
          )}
        </Link>

        <nav id="main-menu" aria-label="Main menu" className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 pt-3 pb-4">
          {groups.map((group, g) => (
            <ul key={g} className={`m-0 p-0 list-none flex flex-col gap-1 ${g > 0 ? "mt-2 pt-2 border-t border-white/20" : ""}`}>
              {group.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={item.active ? "page" : undefined}
                    title={isOpen ? undefined : item.label}
                    className={`group flex rounded-[10px] transition-colors ${focusRing} ${item.active ? "bg-white/15 font-semibold" : "text-[#E6EEEE] hover:bg-white/10"} ${
                      isOpen ? "items-center gap-3 px-2.5 py-2" : "flex-col items-center gap-1 py-2 text-[11px] text-center"
                    }`}
                  >
                    <span className={`flex items-center justify-center rounded-full ${isOpen ? "w-9 h-7" : "w-11 h-7"} ${item.active ? "bg-[#FFD700] text-[#2F4F4F]" : ""}`}>
                      <Icon size={item.active ? 18 : 20}>{ICONS[item.icon]}</Icon>
                    </span>
                    <span className={isOpen ? "text-[15px]" : "leading-tight"}>{isOpen ? item.label : item.short}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </nav>
      </aside>

      {/* phones: a bottom bar with the same five entries */}
      <nav aria-label="Main menu" data-testid="bottom-bar" className="md:hidden fixed inset-x-0 bottom-0 z-40 h-16 bg-[#2F4F4F] text-white grid grid-cols-5" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={item.active ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] ${focusRing} ${item.active ? "font-bold" : "text-[#E6EEEE]"}`}
          >
            <span className={`flex items-center justify-center w-10 h-6 rounded-full ${item.active ? "bg-[#FFD700] text-[#2F4F4F]" : ""}`}>
              <Icon size={18}>{ICONS[item.icon]}</Icon>
            </span>
            {item.short}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
