import { toast } from "react-toastify";

// The same message is shown once: while a popup with that text is on screen, calling it again
// (for example clicking "Create Test" several times) does not add another copy.
// Imported once from App.jsx; applies to every toast.error / success / info / warning call.
["error", "success", "info", "warning", "warn"].forEach((type) => {
  const show = toast[type];
  toast[type] = (content, options = {}) => {
    const toastId = options.toastId ?? (typeof content === "string" ? `${type}:${content}` : undefined);
    if (toastId !== undefined && toast.isActive(toastId)) return toastId;
    return show(content, toastId === undefined ? options : { ...options, toastId });
  };
});
