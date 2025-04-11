import React from "react";
import PropTypes from "prop-types";
import { Button, Tooltip, LinearProgress } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

/**
 * Enhanced component to display school submission status with styled progress bar and list of pending schools
 * 
 * @param {Object} props - Component props
 * @param {number} props.schoolsSubmitted - Number of schools that have submitted results
 * @param {number} props.totalSchools - Total number of schools assigned to the test
 * @param {Array} props.pendingSchools - Array of schools that haven't submitted yet
 * @param {Function} props.onSendReminder - Optional callback when "Send Reminder" is clicked
 */
const SchoolSubmissionStatus = ({ schoolsSubmitted, totalSchools, pendingSchools, onSendReminder }) => {
  // Calculate submission rate
  const submissionRate = totalSchools > 0 ? (schoolsSubmitted / totalSchools) * 100 : 0;
  
  // Determine progress color based on submission rate
  const getProgressColor = (rate) => {
    if (rate < 30) return "#ef5350"; // red
    if (rate < 70) return "#ffb74d"; // orange/amber
    return "#4caf50"; // green
  };
  
  // Handle send reminder click
  const handleSendReminder = (schoolId) => {
    if (onSendReminder) {
      onSendReminder(schoolId);
    }
  };

  return (
    <div className="bg-white p-5 rounded shadow mb-6 overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-[#2F4F4F]">School Submission Status</h3>
        
        {/* Summary badge */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${submissionRate < 50 ? "bg-red-100 text-red-800" : 
                            submissionRate < 80 ? "bg-yellow-100 text-yellow-800" : 
                            "bg-green-100 text-green-800"}`}>
          {submissionRate.toFixed(0)}% Complete
        </div>
      </div>
      
      {/* Progress information */}
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>{schoolsSubmitted} of {totalSchools} schools submitted</span>
        <span>{Math.round(submissionRate)}% complete</span>
      </div>
      
      {/* Enhanced progress bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
        <div 
          className="absolute top-0 left-0 h-full transition-all duration-1000 rounded-full"
          style={{ 
            width: `${submissionRate}%`, 
            backgroundColor: getProgressColor(submissionRate),
            boxShadow: `0 0 5px ${getProgressColor(submissionRate)}40`
          }}
        ></div>
      </div>
      
      {/* Progress markers */}
      <div className="w-full flex justify-between px-1 mb-4">
        <div className="text-xs text-gray-500">0%</div>
        <div className="text-xs text-gray-500">25%</div>
        <div className="text-xs text-gray-500">50%</div>
        <div className="text-xs text-gray-500">75%</div>
        <div className="text-xs text-gray-500">100%</div>
      </div>
      
      {/* List of pending schools (if any) */}
      {pendingSchools && pendingSchools.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center mb-3">
            <h4 className="text-md font-medium text-[#2F4F4F]">Pending Schools</h4>
            <div className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              {pendingSchools.length} remaining
            </div>
          </div>
          
          
        </div>
      )}
    </div>
  );
};

SchoolSubmissionStatus.propTypes = {
  schoolsSubmitted: PropTypes.number.isRequired,
  totalSchools: PropTypes.number.isRequired,
  pendingSchools: PropTypes.array,
  onSendReminder: PropTypes.func
};

SchoolSubmissionStatus.defaultProps = {
  pendingSchools: [],
  onSendReminder: () => {}
};

export default SchoolSubmissionStatus;