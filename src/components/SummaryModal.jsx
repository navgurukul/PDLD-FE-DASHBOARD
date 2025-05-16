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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(8px)",
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
        <div className="mb-4">
          <h6 className="text-xl font-semibold text-[#2F4F4F]">
            {modalTitle || (isEditMode ? "Edit Test Details" : "Confirm Test Creation")}
          </h6>
          <p className="text-sm text-gray-600 mt-1">
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
                <span className="font-medium text-gray-700">Class {grade}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">
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
                  return (
                    <div key={`${grade}-${test.subject}-${idx}`} className="pb-2">
                      {/* Test name */}
                      <div className="font-semibold text-gray-700 mb-1">
                        {test.subject}_Class{grade}
                      </div>

                      {/* Test details */}
                      <div className="text-sm text-gray-600 grid grid-cols-3 gap-4 justify-items-start">
                        {/* 1️⃣ Test Date */}
                        <p>
                          <span className="font-medium">Test Date:</span>{" "}
                          {formatDate(test.testDate)}
                        </p>

                        {/* 2️⃣ Subject */}
                        <p>
                          <span className="font-medium">Subject:</span> {test.subject}
                        </p>

                        {/* 3️⃣ Deadline (with icon) */}
                        <p className="flex items-center gap-1">
                          <img src={deadlineSummaryModal} alt="deadlineSummaryModal" />
                          <span className="font-medium">Deadline:</span> {formatDate(test.deadline)}
                        </p>
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
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
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
