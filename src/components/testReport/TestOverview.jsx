import PropTypes from "prop-types";

 
const TestOverview = ({ 
  totalSchools, 
  schoolsSubmitted, 
  submissionRate, 
  overallPassRate,
  pendingSchools
}) => {
  // Calculate pending schools if not provided
  const pendingCount = pendingSchools !== undefined ? pendingSchools : (totalSchools - schoolsSubmitted);
  
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
        <div className="text-sm text-gray-500">Pending Schools</div>
        <div className="text-2xl font-bold text-red-500">{pendingCount}</div>
        <div className="text-xs text-gray-400 mt-1">
          {pendingCount > 0 ? 'Reminder needed' : 'All schools submitted'}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow">
        <div className="text-sm text-gray-500">Overall Success Rate</div>
        <div className="text-2xl font-bold text-[#2F4F4F]">{overallPassRate}%</div>
      </div>
    </div>
  );
};

TestOverview.propTypes = {
  totalSchools: PropTypes.number.isRequired,
  schoolsSubmitted: PropTypes.number.isRequired,
  submissionRate: PropTypes.number,
  overallPassRate: PropTypes.number.isRequired,
  pendingSchools: PropTypes.number
};

TestOverview.defaultProps = {
  totalSchools: 0,
  schoolsSubmitted: 0,
  submissionRate: 0,
  overallPassRate: 0
};

export default TestOverview;