import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  changeType,
  message,
  fromValue,
  toValue,
}) => {
  if (!isOpen) return null;

  // Default message if not provided
  const defaultMessage =
    "Selecting a new " + changeType.toLowerCase() + " will erase the current progress";
  const displayMessage = message || defaultMessage;

  return (
    // Modal overlay with rgba background for transparency
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 12000 }} // overlay par z-index
    >
      {/* Modal content */}
      <div
        className="bg-white rounded-lg shadow-lg w-[540px] max-w-[95vw] p-6"
        style={{ zIndex: 12001, position: "relative" }} // modal box par z-index
      >
        {/* Modal header */}
        <h2
          style={{
            fontFamily: "'Philosopher', sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            color: "#2F4F4F",
            marginBottom: "18px",
          }}
        >
          {title}
        </h2>

        <div className="mb-6">
          <p className="text-[#2F4F4F] mb-3" style={{ fontSize: "18px", fontFamily: "Work Sans" }}>
            {fromValue && toValue && (
              <>
                You are changing {changeType?.toLowerCase()} from&nbsp;
                <span style={{ fontWeight: 600 }}>{fromValue}</span>
                &nbsp;to&nbsp;
                <span style={{ fontWeight: 600 }}>{toValue}</span>.{" "}
              </>
            )}
            {displayMessage}
          </p>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end space-x-3">
          {/* Change button - light gray button */}
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-gray-200 text-[#2F4F4F] rounded-md hover:bg-gray-300 font-medium transition-colors"
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            {changeType === "Page" ? "Discard" : `Change ${changeType}`}
          </button>

          {/* Keep editing button - yellow button */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-400 text-[#2F4F4F] rounded-md hover:bg-yellow-500 font-medium transition-colors"
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            Keep Editing
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
