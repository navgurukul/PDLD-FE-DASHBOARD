import React, { useState } from "react";
import { FileText, FileSpreadsheet, Database } from "lucide-react";
import ButtonCustom from "../ButtonCustom";

const DownloadModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentPageCount = 15,
  totalRecords = 0,
  subject = "English",
  tableType, // New prop to indicate table type - no default
}) => {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedRows, setSelectedRows] = useState("current");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      format: selectedFormat,
      rows: selectedRows,
      count: getRowCount(),
      ...(tableType && { tableType: tableType }),
    });
    onClose();
  };

  const getRowCount = () => {
    switch (selectedRows) {
      case "current":
        return currentPageCount;
      case "hundred":
        return Math.min(100, totalRecords);
      case "all":
        return totalRecords;
      default:
        return currentPageCount;
    }
  };

  const getRowDisplayText = () => {
    const recordType = tableType === "aggregate" || tableType === "subjectwise" ? 
      (tableType === "aggregate" ? "records" : "subject records") : 
      (tableType === "enrollment" ? "enrollment records" : "records");
    switch (selectedRows) {
      case "current":
        return `Current page (${currentPageCount} ${recordType})`;
      case "hundred":
        return `First 100 ${recordType}`;
      case "all":
        return `All ${recordType} (${totalRecords} ${recordType})`;
      default:
        return `${currentPageCount} ${recordType}`;
    }
  };

  const getTableTypeIcon = () => {
    return <Database size={20} className="text-[#2F4F4F]" />;
  };

  const getTableTypeDisplayName = () => {
    if (!tableType) return "";
    switch (tableType) {
      case "aggregate":
        return "Aggregate Performance Data";
      case "subjectwise":
        return "Subject-wise Performance Data";
      case "enrollment":
        return "Student Enrollment Data";
      default:
        return "Academic Performance Data";
    }
  };

  return (
    // Modal overlay with rgba background for transparency
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 12000 }}
    >
      {/* Modal content */}
      <div className="bg-white rounded-lg shadow-lg w-[540px] max-w-[95vw] p-6">
        {/* Modal header */}
        <h3 className="text-xl font-semibold text-[#2F4F4F] mb-2">
          Download {subject} Report
        </h3>
        
        {/* Table type indicator - only show for aggregate, subjectwise, and enrollment */}
        {(tableType === "aggregate" || tableType === "subjectwise" || tableType === "enrollment") && (
          <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            {getTableTypeIcon()}
            <div>
              <p className="text-sm font-medium text-[#2F4F4F]">Data Source:</p>
              <p className="text-sm text-[#2F4F4F]">{getTableTypeDisplayName()}</p>
            </div>
          </div>
        )}

        {/* Modal body */}
        <div className="mb-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h4 className="text-[#2F4F4F] font-medium mb-3">Select Format:</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={selectedFormat === "csv"}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="text-[#2F4F4F] focus:ring-[#2F4F4F] accent-[#2F4F4F]"
                />
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet size={20} className="text-[#2F4F4F]" />
                  <span className="text-[#2F4F4F]">CSV (Excel compatible)</span>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={selectedFormat === "pdf"}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="text-[#2F4F4F] focus:ring-[#2F4F4F] accent-[#2F4F4F]"
                />
                <div className="flex items-center space-x-2">
                  <FileText size={20} className="text-[#2F4F4F]" />
                  <span className="text-[#2F4F4F]">PDF (Printable format)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Row Selection */}
          <div>
            <h4 className="text-[#2F4F4F] font-medium mb-3">Select Data Range:</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="rows"
                  value="current"
                  checked={selectedRows === "current"}
                  onChange={(e) => setSelectedRows(e.target.value)}
                  className="text-[#2F4F4F] focus:ring-[#2F4F4F] accent-[#2F4F4F]"
                />
                <span className="text-[#2F4F4F]">
                  Current page ({currentPageCount} {tableType === "aggregate" || tableType === "subjectwise" ? (tableType === "aggregate" ? "records" : "subject records") : (tableType === "enrollment" ? "enrollment records" : "records")})
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="rows"
                  value="all"
                  checked={selectedRows === "all"}
                  onChange={(e) => setSelectedRows(e.target.value)}
                  className="text-[#2F4F4F] focus:ring-[#2F4F4F] accent-[#2F4F4F]"
                />
                <span className="text-[#2F4F4F]">
                  All {tableType === "aggregate" || tableType === "subjectwise" ? (tableType === "aggregate" ? "records" : "subject records") : (tableType === "enrollment" ? "enrollment records" : "records")} ({totalRecords} total)
                </span>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-[#2F4F4F]">
              <strong>Download Summary:</strong> {selectedFormat.toUpperCase()} format with{" "}
              {getRowDisplayText()}{tableType === "aggregate" || tableType === "subjectwise" || tableType === "enrollment" ? ` from ${getTableTypeDisplayName()}` : ""}
            </p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end space-x-3">
          {/* Cancel button - light gray button */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-[#2F4F4F] rounded-md hover:bg-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>

          {/* Download button - theme colored button */}
          <ButtonCustom onClick={handleConfirm} text={"Download Report"} />
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;