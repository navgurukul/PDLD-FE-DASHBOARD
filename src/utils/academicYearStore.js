import { useEffect, useRef, useState } from "react";
import { getAcademicYearStart, getAcademicYearStarts } from "./academicYear";

// The academic year chosen in the dashboard header. Pages that have a year box follow it: when it
// changes in the header they switch too, and when they change their own box the header follows.
const KEY = "pdld:academicYear";
const EVENT = "pdld:academicYearChanged";

export const getGlobalYear = () => {
  try {
    const stored = Number(localStorage.getItem(KEY));
    return getAcademicYearStarts().includes(stored) ? stored : getAcademicYearStart();
  } catch {
    return getAcademicYearStart();
  }
};

export const setGlobalYear = (year) => {
  if (!getAcademicYearStarts().includes(year) || year === getGlobalYear()) return;
  try {
    localStorage.setItem(KEY, String(year));
  } catch {
    // storage blocked: the year still changes for this page view through the event
  }
  window.dispatchEvent(new Event(EVENT));
};

export function useGlobalYear() {
  const [year, setYear] = useState(getGlobalYear);
  useEffect(() => {
    const sync = () => setYear(getGlobalYear());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return year;
}

// For a page with its own year state: calls apply(year) when the header's year changes (not on first
// load). The page reports its own choices with setGlobalYear so the header stays in step.
export function useFollowGlobalYear(apply) {
  const year = useGlobalYear();
  const seen = useRef(year);
  const latest = useRef(apply);
  latest.current = apply;
  useEffect(() => {
    if (seen.current === year) return;
    seen.current = year;
    latest.current(year);
  }, [year]);
}
