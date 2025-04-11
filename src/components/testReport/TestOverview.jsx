import React from "react";
import PropTypes from "prop-types";

/**
 * Component to display summary metrics about a test
 * 
 * @param {Object} props - Component props
 * @param {number} props.totalSchools - Total number of schools assigned to the test
 * @param {number} props.schoolsSubmitted - Number of schools that have submitted results
 * @param {number} props.submissionRate - Percentage of schools that have submitted (0-100)
 * @param {number} props.overallPassRate - Overall pass rate across all schools (0-100)
 */
const TestOverview = ({ totalSchools, schoolsSubmitted, submissionRate, overallPassRate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
        <div className="text-sm text-gray-500">Total Schools</div>
        <div className="text-2xl font-bold text-[#2F4F4F]">{totalSchools}</div>
      </div>
      
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
        <div className="text-sm text-gray-500">Schools Submitted</div>
        <div className="text-2xl font-bold text-[#2F4F4F]">{schoolsSubmitted}</div>
      </div>
      
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
        <div className="text-sm text-gray-500">Submission Rate</div>
        <div className="text-2xl font-bold text-[#2F4F4F]">{submissionRate.toFixed(1)}%</div>
      </div>
      
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
        <div className="text-sm text-gray-500">Overall Pass Rate</div>
        <div className="text-2xl font-bold text-[#2F4F4F]">{overallPassRate}%</div>
      </div>
    </div>
  );
};

TestOverview.propTypes = {
  totalSchools: PropTypes.number.isRequired,
  schoolsSubmitted: PropTypes.number.isRequired,
  submissionRate: PropTypes.number.isRequired,
  overallPassRate: PropTypes.number.isRequired
};

TestOverview.defaultProps = {
  totalSchools: 0,
  schoolsSubmitted: 0,
  submissionRate: 0,
  overallPassRate: 0
};

export default TestOverview;