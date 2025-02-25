// File: components/BatchTestCreation/TestTypeSelector.js

const TestTypeSelectors = ({ testType, setTestType }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Test Type</h2>
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="testType"
            value="regular"
            checked={testType === 'regular'}
            onChange={() => setTestType('regular')}
            className="w-5 h-5"
          />
          <span className={`px-4 py-2 rounded-lg ${testType === 'regular'
            ? 'text-[#2f4f4f]'
            : 'text-gray-700'
            }`}
          >
            Syllabus
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="testType"
            value="remedial"
            checked={testType === 'remedial'}
            onChange={() => setTestType('remedial')}
            className="w-5 h-5"
          />
          <span className={`px-4 py-2 rounded-lg ${testType === 'remedial'
            ? 'text-[#2f4f4f]'
            : 'text-gray-700'
            }`}
          >
            Remedial
          </span>
        </label>
      </div>
    </div>
  );
};

export default TestTypeSelectors;