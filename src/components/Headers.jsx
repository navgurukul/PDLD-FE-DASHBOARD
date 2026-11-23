import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import pdldLogo from "../assets/pdld-badge.svg";
import useAuth, { getUserName } from "../customHook/useAuth";
import apiInstance from "../../api";
import { formatAcademicYear, getAcademicYearStarts } from "../utils/academicYear";
import { setGlobalYear, useGlobalYear } from "../utils/academicYearStore";

// ---------- page title ----------
const TITLES = [
  [/^\/allTest\/schoolSubmission/, "Test submission"],
  [/^\/(allTest)?$/, "Tests"],
  [/^\/allTest/, "Tests"],
  [/^\/testCreationForm/, "Create test"],
  [/^\/editTest/, "Edit test"],
  [/^\/schools\/schoolDetail/, "School details"],
  [/^\/schools\/(bulk-upload|upload)/, "Bulk upload"],
  [/^\/schools/, "Schools"],
  [/^\/(users|userCreationForm)/, "Users"],
  [/^\/reports\/learning-progress/, "Learning Progress"],
  [/^\/reports\/EnrollmentReports/, "Enrollment reports"],
  [/^\/reports\/SchoolPerformanceReports/, "School performance reports"],
  [/^\/reports\/StreamVocationalReport/, "Stream & vocational report"],
  [/^\/reports/, "Reports"],
  [/^\/school\/studentReport|student-profile/, "Student report"],
  [/^\/help/, "Help & support"],
];
const titleFor = (path) => (TITLES.find(([re]) => re.test(path)) || [null, ""])[1];

// ---------- school search ----------
function SchoolSearch() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const box = useRef(null);

  useEffect(() => {
    const query = text.trim();
    if (query.length < 2) {
      setResults([]);
      setState("idle");
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState("loading");
      try {
        const res = await apiInstance.get(`/schools/search?page=1&pageSize=6&query=${encodeURIComponent(query)}`, { signal: controller.signal });
        setResults(res.data?.data?.schools || []);
        setActive(-1);
        setState("done");
      } catch (error) {
        if (error?.code !== "ERR_CANCELED") setState("error");
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  useEffect(() => {
    const away = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const go = (school) => {
    setOpen(false);
    setText("");
    navigate(`/schools/schoolDetail/${school.id}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && active >= 0 && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && text.trim().length >= 2;
  return (
    <div ref={box} className="relative w-full max-w-md" role="search">
      <input
        type="search"
        data-testid="school-search"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Find a school by name or UDISE code"
        aria-label="Find a school by name or UDISE code"
        role="combobox"
        aria-expanded={showList}
        aria-controls="school-search-list"
        aria-activedescendant={active >= 0 ? `school-hit-${active}` : undefined}
        autoComplete="off"
        className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-[#2F4F4F] focus:outline focus:outline-2 focus:outline-[#2F4F4F]"
      />
      {showList && (
        <ul id="school-search-list" role="listbox" className="absolute left-0 right-0 mt-1 max-h-80 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-20 list-none m-0 p-0">
          {state === "loading" && <li className="px-3 py-2 text-sm text-gray-500">Searching…</li>}
          {state === "error" && <li className="px-3 py-2 text-sm text-red-700">Could not search. Try again.</li>}
          {state === "done" && results.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No school matches “{text.trim()}”.</li>}
          {results.map((s, i) => (
            <li key={s.id} id={`school-hit-${i}`} role="option" aria-selected={i === active} data-testid="school-hit">
              <button
                type="button"
                onClick={() => go(s)}
                onMouseEnter={() => setActive(i)}
                className={`block w-full text-left px-3 py-2 ${i === active ? "bg-[#EAEDED]" : "bg-white"}`}
              >
                <span className="block text-sm font-medium text-[#2F4F4F]">{s.schoolName}</span>
                <span className="block text-xs text-gray-500">
                  UDISE {s.udiseCode}
                  {s.blockName ? ` · ${s.blockName}` : ""}
                  {s.clusterName ? ` · ${s.clusterName}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------- submission status ----------
const STRIP_KEY = "pdld:submissionStrip";
const STRIP_FRESH_MS = 5 * 60 * 1000;

function SubmissionStrip() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const saved = JSON.parse(sessionStorage.getItem(STRIP_KEY) || "null");
      if (saved && Date.now() - saved.at < STRIP_FRESH_MS) {
        setInfo(saved.info);
        return undefined;
      }
    } catch {
      // no saved copy
    }
    apiInstance
      .get("/report/learning-progress")
      .then((res) => {
        const d = res.data?.data;
        if (cancelled || !d?.summary || !d.testLabel) return;
        const next = { label: d.testLabel, year: d.year, entered: d.summary.entered, eligible: d.summary.eligible };
        setInfo(next);
        try {
          sessionStorage.setItem(STRIP_KEY, JSON.stringify({ at: Date.now(), info: next }));
        } catch {
          // fine without it
        }
      })
      .catch(() => {
        // the strip is a convenience: no strip if the report cannot be read
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!info) return null;
  const pending = info.eligible != null ? Math.max(info.eligible - info.entered, 0) : null;
  const pct = info.eligible ? Math.round((info.entered / info.eligible) * 100) : null;
  return (
    <Link
      to="/reports/learning-progress"
      data-testid="submission-strip"
      title="Open Learning Progress to see which schools still have to enter marks"
      className="hidden xl:flex items-center gap-2 rounded-lg bg-[#EAEDED] px-3 h-10 text-sm text-[#2F4F4F] no-underline hover:bg-[#dfe4e4] whitespace-nowrap"
    >
      <span className="font-semibold">{info.label}</span>
      <span>
        {info.eligible != null ? `${info.entered.toLocaleString("en-IN")} of ${info.eligible.toLocaleString("en-IN")} schools entered${pct != null ? ` (${pct}%)` : ""}` : `${info.entered.toLocaleString("en-IN")} schools entered`}
      </span>
      {pending != null && pending > 0 && <span className="rounded-full bg-[#FFD700] px-2 py-0.5 text-xs font-semibold text-black">{pending.toLocaleString("en-IN")} pending</span>}
    </Link>
  );
}

// ---------- academic year ----------
function YearChip() {
  const year = useGlobalYear();
  return (
    <label className="hidden md:flex items-center gap-2 text-sm text-[#2F4F4F]">
      <span className="sr-only">Academic year</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
      <select
        data-testid="year-chip"
        aria-label="Academic year"
        value={year}
        onChange={(e) => setGlobalYear(Number(e.target.value))}
        className="h-10 rounded-lg border border-gray-300 bg-white px-2 text-sm font-medium text-[#2F4F4F] focus:outline focus:outline-2 focus:outline-[#2F4F4F]"
      >
        {getAcademicYearStarts().map((y) => (
          <option key={y} value={y}>
            {formatAcademicYear(y)}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------- user menu ----------
const prettyRole = (role) =>
  String(role || "")
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("userData") || "{}") || {};
  } catch {
    return {};
  }
};

function UserMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const button = useRef(null);
  const user = readUser();
  const name = getUserName();
  const initials = (() => {
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    return (parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();
  const area = [user.district, user.block, user.cluster].filter(Boolean).join(" · ");

  useEffect(() => {
    const away = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      button.current?.focus();
    }
  };

  return (
    <div className="relative" ref={ref} onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name || "your account"}`}
        data-testid="user-menu-button"
        className="rounded-full w-10 h-10 bg-[#FFD700] flex items-center justify-center text-black font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4F4F]"
      >
        {initials}
      </button>
      {open && (
        <div role="menu" data-testid="user-menu" className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg z-20">
          <div className="px-4 pb-2 border-b border-gray-100">
            <div className="text-sm font-semibold text-[#2F4F4F]">{name || "Signed in"}</div>
            {user.role && <div className="text-xs text-gray-600">{prettyRole(user.role)}</div>}
            {area && <div className="text-xs text-gray-600">{area}</div>}
          </div>
          <button type="button" role="menuitem" onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:bg-gray-100">
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
UserMenu.propTypes = { onLogout: PropTypes.func.isRequired };

// ---------- header ----------
const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const title = titleFor(pathname);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <header className="w-full fixed z-10000 bg-white shadow-md px-4 py-4 flex items-center gap-4">
      <Link to="/allTest" className="shrink-0">
        <img src={pdldLogo} alt="PDLD dashboard home" style={{ width: "40px", height: "40px", borderRadius: "9px", objectFit: "contain", cursor: "pointer" }} />
      </Link>
      {title && (
        <div data-testid="page-title" className="hidden sm:block shrink-0 text-lg font-semibold text-[#2F4F4F]" style={{ fontFamily: "Karla, sans-serif" }}>
          {title}
        </div>
      )}
      <div className="flex-1 min-w-0 flex justify-center">
        <SchoolSearch />
      </div>
      <SubmissionStrip />
      <YearChip />
      <UserMenu onLogout={handleLogout} />
    </header>
  );
};

export default Header;
