import { deadlineSummaryModal } from "../utils/imagePath";
import { useLocation } from "react-router-dom";

const ModalSummary = ({
  isOpen,
  onClose,
  selectedGrades,
  selectedSubjects,
  testDates,
  testScores,
  testType,
  handleConfirm,
  testDeadlines,
  modalTitle,
  isSubmitting, // Add isSubmitting prop
  testNames,
}) => {
  if (!isOpen) return null;

  // Get current URL to determine if we're editing or creating
  const location = useLocation();
  const isEditMode = location.pathname.includes("/editTest/");

  // A small helper to format the date from "YYYY-MM-DD" to something nicer like "15 Feb 2025"
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const allClassTests = selectedGrades.map((grade) => {
    const subjects = selectedSubjects[grade] || [];
    const tests = subjects.map((subject) => {
      const key = `${grade}-${subject}`;
      return {
        subject,
        testDate: testDates[key],
        // For regular tests, use the provided score. For remedial tests, we don't use maxScore
        maxScore: testType === "regular" && testScores ? testScores[key] ?? 0 : null,
        deadline: testDeadlines[key],
      };
    });

    // Calculate max score for the entire class only for regular tests
    const classMaxScore = testType === "regular" && tests.length > 0 ? tests[0].maxScore : null;

    return {
      grade,
      tests,
      classMaxScore,
    };
  });

  // Count how many total tests we have
  const totalTests = allClassTests.reduce((sum, classObj) => sum + classObj.tests.length, 0);

  return (
   <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 12000 }}>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
         backgroundColor: "rgba(0, 0, 0, 0.5)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 50,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-100 bg-white w-11/12 max-w-2xl p-6 rounded-lg shadow-lg mt-10"
        style={{ width: "760px" }}
      >
        {/* Header - Changed based on edit/create mode */}
        <div className="mb-4 relative">
          <h6 className="text-xl font-semibold text-[#2F4F4F]">
            {modalTitle || (isEditMode ? "Edit Test Details" : "Confirm Test Creation")}
          </h6>
          {/* Cross icon button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-1 right-0 p-2 rounded hover:bg-gray-200 transition"
            style={{
              lineHeight: 0,
              fontSize: "22px",
              color: "#2F4F4F",
              fontWeight: 700,
            }}
          >
            {/* SVG Cross Icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M6 6L16 16M16 6L6 16"
                stroke="#2F4F4F"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p
            className="text-sm text-gray-600 mt-1"
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 400,
              fontSize: "18px",
              marginTop: "20px",
            }}
          >
            Please review the details of the {totalTests} test
            {totalTests > 1 && "s"} about to be {isEditMode ? "updated" : "created"}
          </p>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {allClassTests.map(({ grade, tests, classMaxScore }) => (
            <div key={grade} className="mb-6">
              {/* Class Header - Now with Max Score here only for regular tests */}
              <div className="bg-gray-100 p-2 rounded-md flex items-center justify-between">
                <span
                  className="font-semibold"
                  style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#2F4F4F",
                  }}
                >
                  Class {grade}
                </span>
                <div className="flex items-center gap-4">
                  <span
                    style={{
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: 400,
                      fontSize: "18px",
                      color: "#616161",
                    }}
                  >
                    {tests.length} {tests.length === 1 ? "Test" : "Tests"}
                  </span>
                  {/* Only show Max Score for regular (syllabus) tests */}
                  {testType === "regular" && classMaxScore !== null && (
                    <span className="text-sm text-gray-500">
                      (<span className="font-medium">Max Score:</span> {classMaxScore})
                    </span>
                  )}
                </div>
              </div>

              {/* List of tests for this class */}
              <div className="mt-3 space-y-2">
                {tests.map((test, idx) => {
                  const key = `${grade}-${test.subject}`;
                  return (
                    <div key={`${grade}-${test.subject}-${idx}`} className="pb-2">
                      {/* Test Name  */}
                      {testNames && testNames[key] && (
                        <div
                          style={{
                            fontFamily: "'Work Sans', sans-serif",
                            fontWeight: 400,
                            fontStyle: "normal",
                            fontSize: "18px",
                            color: "#2F4F4F",
                            marginBottom: "4px",
                          }}
                        >
                          {testNames[key]}
                        </div>
                      )}
                      {/*  Test Date, Subject, Deadline */}
                      <div
                        className="flex gap-8"
                        style={{
                          fontFamily: "'Work Sans', sans-serif",
                          fontWeight: 400,
                          fontSize: "14px",
                        }}
                      >
                        <span>
                          <span style={{ color: "#9E9E9E", fontWeight: 500 }}>Test Date:</span>
                          <span style={{ color: "#2F4F4F", fontWeight: 400 }}>
                            {" "}
                            {formatDate(test.testDate)}
                          </span>
                        </span>
                        <span>
                          <span style={{ color: "#9E9E9E", fontWeight: 500 }}>Subject:</span>
                          <span style={{ color: "#2F4F4F", fontWeight: 400 }}> {test.subject}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <img src={deadlineSummaryModal} alt="deadlineSummaryModal" />
                          <span style={{ color: "#9E9E9E", fontWeight: 500 }}>Deadline:</span>
                          <span style={{ color: "#2F4F4F", fontWeight: 400 }}>
                            {" "}
                            {formatDate(test.deadline)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300"
            style={{
              background: "#EAEDED",
              color: "#2F4F4F",
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: "16px",
            }}
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-md ${
              isSubmitting ? "bg-gray-400" : "bg-yellow-400 hover:bg-yellow-300"
            } text-gray-800 font-semibold flex items-center gap-2`}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <svg
                className="animate-spin h-4 w-4 text-gray-800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isSubmitting
              ? isEditMode
                ? "Updating Test..."
                : "Creating Test..."
              : isEditMode
              ? "Update"
              : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSummary;
