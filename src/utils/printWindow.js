// Where a PDF report is written and printed from. A new tab when the browser allows it; when
// pop-ups are blocked, a hidden frame in this page, so the print dialog still opens.
// Callers use it like the window.open() result: document.write(), document.close(), onload, print().
let lastFrame = null;

const removeFrame = (frame) => {
  if (frame?.parentNode) frame.parentNode.removeChild(frame);
};

export function openPrintWindow() {
  const popup = window.open("", "_blank");
  if (popup) return popup;

  // document.write() clears the frame's listeners, so the old frame goes when the next report starts
  removeFrame(lastFrame);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(frame);
  lastFrame = frame;
  setTimeout(() => removeFrame(frame), 10 * 60 * 1000);
  return frame.contentWindow;
}
