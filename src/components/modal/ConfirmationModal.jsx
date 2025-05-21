import React from "react";

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  changeType, 
  fromValue, 
  toValue, 
  message 
}) => {
  if (!isOpen) return null;

  // Default message if not provided
  const defaultMessage = "Selecting a new " + changeType.toLowerCase() + " will erase the current progress";
  const displayMessage = message || defaultMessage;

  return (
    // Modal overlay with rgba background for transparency
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      {/* Modal content */}
      <div className="bg-white rounded-lg shadow-lg w-[540px] max-w-[95vw] p-6">
        {/* Modal header */}
        <h3 className="text-xl font-semibold text-[#2F4F4F] mb-4">
          {title}
        </h3>

        {/* Modal body */}
        <div className="mb-6">
          <p className="text-[#2F4F4F] mb-3">
            You are changing {changeType.toLowerCase()} from <strong>{fromValue}</strong> to <strong>{toValue}</strong>
          </p>
          <p className="text-[#2F4F4F]">{displayMessage}</p>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end space-x-3">
          {/* Change button - light gray button */}
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-gray-200 text-[#2F4F4F] rounded-md hover:bg-gray-300 font-medium transition-colors"
          >
            {`Change ${changeType}`}
          </button>

          {/* Keep editing button - yellow button */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-400 text-[#2F4F4F] rounded-md hover:bg-yellow-500 font-medium transition-colors"
          >
            Keep Editing
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;