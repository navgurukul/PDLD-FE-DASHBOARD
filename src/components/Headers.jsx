import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";
import pdldLogo from "../assets/pdld-badge.svg";
import useAuth, { getUserName } from "../customHook/useAuth";
import apiInstance from "../../api";
import Breadcrumb from "./Breadcrumb";
import { formatAcademicYear, getAcademicYearStarts } from "../utils/academicYear";
import { setGlobalYear, useGlobalYear } from "../utils/academicYearStore";

// ---------- page title (phones, and pages without a breadcrumb) ----------
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
  [/^\/reports\/SchoolPerformanceReports/, "School performance"],
  [/^\/reports\/StreamVocationalReport/, "Stream & vocational"],
  [/^\/reports/, "Reports"],
  [/^\/school\/studentReport|student-profile/, "Student report"],
  [/^\/help/, "Help & support"],
];
const titleFor = (path) => (TITLES.find(([re]) => re.test(path)) || [null, ""])[1];

// Pages the search can jump to
const PAGES = [
  { to: "/allTest", label: "Tests" },
  { to: "/testCreationForm", label: "Create test" },
  { to: "/schools", label: "Schools" },
  { to: "/users", label: "Users" },
  { to: "/reports", label: "All reports" },
  { to: "/reports/learning-progress", label: "Learning Progress" },
  { to: "/reports/EnrollmentReports", label: "Enrollment reports" },
  { to: "/reports/SchoolPerformanceReports", label: "School performance reports" },
  { to: "/reports/StreamVocationalReport", label: "Stream & vocational report" },
];

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");
const SHORTCUT = isMac ? "⌘K" : "Ctrl K";

// A form field (or editable text) has the keyboard: shortcuts must not steal keys from it
const typingInField = (el) => !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
SearchIcon.propTypes = { size: PropTypes.number };

// ---------- search: schools and pages; Ctrl/⌘ K opens it from anywhere ----------
function SearchBox({ onDone, autoFocus = false, shortcut = false }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [schools, setSchools] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const box = useRef(null);
  const input = useRef(null);

  const query = text.trim();
  const pages = query ? PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : [];
  const items = [...schools.map((s) => ({ kind: "school", s })), ...pages.map((p) => ({ kind: "page", p }))];

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  // The shortcut, on every page; only the desktop box listens
  useEffect(() => {
    if (!shortcut) return undefined;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        if (typingInField(document.activeElement) && document.activeElement !== input.current) return;
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  useEffect(() => {
    if (query.length < 2) {
      setSchools([]);
      setState("idle");
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState("loading");
      try {
        const res = await apiInstance.get(`/schools/search?page=1&pageSize=6&query=${encodeURIComponent(query)}`, { signal: controller.signal });
        setSchools(res.data?.data?.schools || []);
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
  }, [query]);

  useEffect(() => {
    const away = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const close = () => {
    setOpen(false);
    setText("");
    input.current?.blur();
    onDone?.();
  };
  const choose = (item) => {
    navigate(item.kind === "school" ? `/schools/schoolDetail/${item.s.id}` : item.p.to);
    close();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && items[active >= 0 ? active : 0] && query) {
      e.preventDefault();
      choose(items[active >= 0 ? active : 0]);
    } else if (e.key === "Escape") {
      close();
    }
  };

  const showList = open && query.length >= 1;
  const schoolCount = schools.length;
  return (
    <div ref={box} className="relative w-full" role="search">
      <div className="flex items-center gap-2 h-9 rounded-lg border border-[#D5DDDD] bg-[#F6F8F8] px-2.5 text-[#2F4F4F] focus-within:border-[#2F4F4F] focus-within:bg-white focus-within:outline focus-within:outline-1 focus-within:outline-[#2F4F4F]">
        <span className="text-[#6B7878] shrink-0"><SearchIcon /></span>
        <input
          ref={input}
          type="search"
          data-testid="school-search"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Find a school or page"
          aria-label="Find a school by name or UDISE code, or go to a page"
          role="combobox"
          aria-expanded={showList}
          aria-controls="header-search-list"
          aria-activedescendant={active >= 0 ? `search-hit-${active}` : undefined}
          aria-keyshortcuts={shortcut ? (isMac ? "Meta+K" : "Control+K") : undefined}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-[#6B7878]"
        />
        {shortcut && !text && (
          <kbd data-testid="search-shortcut" className="hidden lg:inline shrink-0 rounded border border-[#D5DDDD] bg-white px-1.5 text-[11px] font-sans text-[#556464]">
            {SHORTCUT}
          </kbd>
        )}
      </div>
      {showList && (
        <ul id="header-search-list" role="listbox" className="absolute left-0 right-0 mt-1 max-h-[70vh] overflow-auto rounded-lg border border-[#D5DDDD] bg-white p-1 shadow-lg z-30 list-none m-0">
          {query.length >= 2 && <li role="presentation" className="px-2.5 pt-1.5 pb-1 text-[11px] tracking-wider text-[#556464]">SCHOOLS</li>}
          {query.length < 2 && <li role="presentation" className="px-2.5 py-2 text-sm text-[#556464]">Type 2 letters to find a school</li>}
          {state === "loading" && <li role="presentation" className="px-2.5 py-2 text-sm text-[#556464]">Searching…</li>}
          {state === "error" && <li role="presentation" className="px-2.5 py-2 text-sm text-red-700">Could not search. Try again.</li>}
          {state === "done" && schoolCount === 0 && <li role="presentation" className="px-2.5 py-2 text-sm text-[#556464]">No school matches “{query}”.</li>}
          {schools.map((s, i) => (
            <li key={s.id} id={`search-hit-${i}`} role="option" aria-selected={i === active} data-testid="school-hit">
              <button type="button" onClick={() => choose({ kind: "school", s })} onMouseEnter={() => setActive(i)} className={`block w-full text-left rounded-md px-2.5 py-2 ${i === active ? "bg-[#EAEDED]" : "bg-white"}`}>
                <span className="block text-sm font-medium text-[#2F4F4F]">{s.schoolName}</span>
                <span className="block text-xs text-[#556464]">
                  UDISE {s.udiseCode}
                  {s.blockName ? ` · ${s.blockName}` : ""}
                  {s.clusterName ? ` · ${s.clusterName}` : ""}
                </span>
              </button>
            </li>
          ))}
          {pages.length > 0 && <li role="presentation" className="px-2.5 pt-2.5 pb-1 text-[11px] tracking-wider text-[#556464]">GO TO</li>}
          {pages.map((p, j) => {
            const i = schoolCount + j;
            return (
              <li key={p.to} id={`search-hit-${i}`} role="option" aria-selected={i === active} data-testid="page-hit">
                <button type="button" onClick={() => choose({ kind: "page", p })} onMouseEnter={() => setActive(i)} className={`block w-full text-left rounded-md px-2.5 py-2 text-sm text-[#2F4F4F] ${i === active ? "bg-[#EAEDED]" : "bg-white"}`}>
                  → {p.label}
                </button>
              </li>
            );
          })}
          <li role="presentation" className="hidden md:block border-t border-[#EEF2F2] mt-1 px-2.5 pt-2 pb-1 text-[11px] text-[#556464]">↑ ↓ to move · Enter to open · Esc to close</li>
        </ul>
      )}
    </div>
  );
}
SearchBox.propTypes = { onDone: PropTypes.func, autoFocus: PropTypes.bool, shortcut: PropTypes.bool };

// ---------- submission status ----------
const STRIP_KEY = "pdld:submissionStrip";
const STRIP_FRESH_MS = 5 * 60 * 1000;

function useSubmissionStatus() {
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
        // a convenience: nothing shown if the report cannot be read
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return info;
}

function PendingPill({ info }) {
  if (!info || info.eligible == null) return null;
  const pending = Math.max(info.eligible - info.entered, 0);
  const full = `${info.label}: ${info.entered.toLocaleString("en-IN")} of ${info.eligible.toLocaleString("en-IN")} schools have entered marks. Open Learning Progress to see who is pending.`;
  return (
    <Link
      to="/reports/learning-progress"
      data-testid="submission-strip"
      title={full}
      aria-label={full}
      className={`hidden lg:flex items-center gap-1.5 h-8 shrink-0 rounded-full px-3 text-[13px] font-semibold no-underline whitespace-nowrap ${pending > 0 ? "bg-[#FFF6CC] text-[#5A4A00] hover:bg-[#FFEFA6]" : "bg-[#E6F4EC] text-[#1F5F3A]"}`}
    >
      <span aria-hidden="true" className={`w-2 h-2 rounded-full ${pending > 0 ? "bg-[#E0B400]" : "bg-[#1F7A4D]"}`} />
      {pending > 0 ? `${pending.toLocaleString("en-IN")} pending` : "All entered"}
    </Link>
  );
}
PendingPill.propTypes = { info: PropTypes.object };

// ---------- academic year: the only year box in the dashboard ----------
function YearChip() {
  const year = useGlobalYear();
  return (
    <label className="flex items-center h-9 shrink-0 rounded-lg border border-[#D5DDDD] bg-white pl-2.5 text-[#2F4F4F] focus-within:outline focus-within:outline-2 focus-within:outline-[#2F4F4F]" title="Academic year used by Tests, School Performance and student profiles">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
      <span className="sr-only">Academic year</span>
      <select
        data-testid="year-chip"
        aria-label="Academic year"
        value={year}
        onChange={(e) => setGlobalYear(Number(e.target.value))}
        className="h-full bg-transparent pl-1.5 pr-2 text-[13px] font-medium outline-none cursor-pointer"
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

// ---------- account menu ----------
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
    <div className="relative shrink-0" ref={ref} onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name || "your account"}`}
        data-testid="user-menu-button"
        className="rounded-full w-9 h-9 bg-[#FFD700] flex items-center justify-center text-black text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4F4F]"
      >
        {initials}
      </button>
      {open && (
        <div role="menu" data-testid="user-menu" className="absolute right-0 mt-2 w-64 rounded-lg border border-[#D5DDDD] bg-white py-2 shadow-lg z-30">
          <div className="px-4 pb-2 border-b border-[#EEF2F2]">
            <div className="text-sm font-semibold text-[#2F4F4F]">{name || "Signed in"}</div>
            {user.role && <div className="text-xs text-[#556464]">{prettyRole(user.role)}</div>}
            {area && <div className="text-xs text-[#556464]">{area}</div>}
          </div>
          <button type="button" role="menuitem" onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-[#2F4F4F] hover:bg-[#F6F8F8] focus-visible:bg-[#F6F8F8]">
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
UserMenu.propTypes = { onLogout: PropTypes.func.isRequired };

// ---------- header: sits over the page, beside the left bar ----------
const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const status = useSubmissionStatus();
  const [phoneSearch, setPhoneSearch] = useState(false);
  const title = titleFor(pathname);

  useEffect(() => setPhoneSearch(false), [pathname]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <header className="sticky top-0 z-20 h-[60px] shrink-0 bg-white border-b border-[#E2E8E8] flex items-center gap-3 px-3 md:px-6">
      {/* phones: logo and page name (the left bar is a bottom bar there) */}
      <Link to="/allTest" className="md:hidden shrink-0" aria-label="PDLD home">
        <img src={pdldLogo} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: "contain" }} />
      </Link>
      <div data-testid="page-title" className="md:hidden flex-1 min-w-0 truncate text-[17px] font-bold text-[#2F4F4F]" style={{ fontFamily: "Karla, sans-serif" }}>
        {title}
      </div>

      {/* larger screens: where you are, as a breadcrumb */}
      <div data-testid="header-breadcrumb" className="hidden md:flex flex-1 min-w-0 items-center overflow-hidden">
        {pathname === "/reports" ? (
          <span className="text-base font-bold text-[#2F4F4F]" style={{ fontFamily: "Karla, sans-serif" }}>Reports</span>
        ) : (
          <Breadcrumb inHeader />
        )}
      </div>

      <div className="hidden md:block w-[280px] lg:w-[320px] shrink">
        <SearchBox shortcut />
      </div>
      <button
        type="button"
        onClick={() => setPhoneSearch(true)}
        aria-label="Search schools and pages"
        data-testid="phone-search-button"
        className="md:hidden shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-[#2F4F4F] hover:bg-[#F6F8F8]"
      >
        <SearchIcon size={20} />
      </button>
      <PendingPill info={status} />
      <YearChip />
      <UserMenu onLogout={handleLogout} />

      {phoneSearch && (
        <div className="md:hidden absolute inset-x-0 top-0 h-[60px] bg-white flex items-center gap-2 px-3 z-30">
          <div className="flex-1">
            <SearchBox autoFocus onDone={() => setPhoneSearch(false)} />
          </div>
          <button type="button" onClick={() => setPhoneSearch(false)} className="shrink-0 px-2 h-10 text-sm font-medium text-[#2F4F4F]">
            Cancel
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
