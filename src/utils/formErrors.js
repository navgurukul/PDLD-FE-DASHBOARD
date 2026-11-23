import { toast } from "react-toastify";

// Form checks show the problem on the field itself (red border + message underneath).
// After a failed check: one short popup, then the page scrolls to the first field marked in red.
// A field is found by aria-invalid="true" (inputs, MUI fields with `error`) or data-invalid="true" (groups of cards).

export const FIELD_ERROR_STYLE = { color: "#D32F2F", fontSize: "13px", marginTop: "4px", fontFamily: "'Work Sans', sans-serif" };

export function scrollToFirstError() {
  // Runs after React has drawn the red fields
  setTimeout(() => {
    const el = document.querySelector('[aria-invalid="true"], [data-invalid="true"]');
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof el.focus === "function" && el.matches("input, textarea, select, [tabindex]")) el.focus({ preventScroll: true });
  }, 50);
}

// errors: { key: message }. One problem: its own message. Several: a count, the details are on the fields.
export function showFormErrors(errors) {
  const messages = Object.values(errors).filter(Boolean);
  if (!messages.length) return false;
  toast.error(messages.length === 1 ? messages[0] : `${messages.length} fields need fixing. They are marked in red.`, { autoClose: 6000 });
  scrollToFirstError();
  return true;
}

// Removes one key from an errors state object (no new object when nothing changes)
export const withoutError = (errors, key) => {
  if (!errors[key]) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
};
