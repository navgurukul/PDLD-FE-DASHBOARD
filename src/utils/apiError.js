import { toast } from "react-toastify";

// One place that turns a failed API call into a sentence the user can act on.
// The server's own reason (response.data.error) is shown when it has one; otherwise a clear
// message for the kind of failure, or the screen's fallback ("Could not save the test...").

const EMPTY = new Set(["error", "success", "internal server error", "something went wrong", "unknown error", "missing authentication token"]);
const TECHNICAL = /undefined|cannot read|is not a function|is not defined|unexpected token|exception|econn|stack|\bat \w+ \(/i;

const clean = (text) => {
  const out = String(text).replace(/^(Error|ValidationError|Validation error):\s*/i, "").trim();
  if (!out || EMPTY.has(out.toLowerCase()) || TECHNICAL.test(out) || out.length > 400) return null;
  return out.charAt(0).toUpperCase() + out.slice(1);
};

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const res = error?.response;
  if (!res) {
    if (error?.code === "ECONNABORTED") return "The server took too long to answer. Please try again.";
    if (typeof navigator !== "undefined" && navigator.onLine === false) return "You are offline. Check your internet connection and try again.";
    if (error?.request) return "Can't reach the server. Check your internet connection and try again.";
    return fallback;
  }

  const body = res.data && typeof res.data === "object" ? res.data : {};
  const server = [body.error, body.message].map((t) => (typeof t === "string" ? clean(t) : null)).find(Boolean);
  const status = res.status;

  if (status === 401) return server || "Your session has expired. Please log in again.";
  if (status === 403) return server && server.toLowerCase() !== "forbidden" ? server : "You don't have permission to do this.";
  if (status === 404) return server || "This item was not found. It may have been deleted.";
  if (status === 413) return "The file is too large to upload.";
  if (status === 429) return server || "Too many attempts. Please wait a few minutes and try again.";
  if (status === 502 || status === 503 || status === 504) return "The server took too long to answer. Please try again in a minute.";
  return server || fallback;
}

// Shows the message as an error popup. Errors stay longer than success popups so they can be read
// (the same message is never stacked twice: see toastSetup.js)
export function showApiError(error, fallback) {
  const message = getErrorMessage(error, fallback);
  toast.error(message, { autoClose: 8000 });
  return message;
}
