import { deadlineSummaryModal } from "../utils/imagePath";

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
}) => {
  if (!isOpen) return null;

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
        // For “regular” tests, you might have a custom max score. For “remedial,”
        // perhaps you default to 100 or skip altogether. Adjust to your needs.
        maxScore: testType === "regular" ? testScores[key] ?? 0 : 100,
        // If you store a separate deadline date in state, replace testDates[key] with that.
        // For now, let's assume you're using the same “testDates” for demonstration:
        deadline: testDeadlines[key],
      };
    });

    return {
      grade,
      tests,
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
        {/* Header */}
        <div className="mb-4">
          {/* <h2 className="text-xl font-semibold text-gray-800">Confirm Test Creation</h2> */}
          <h6 className="text-xl font-semibold text-[#2F4F4F]">Confirm Test Creation</h6>
          <p className="text-sm text-gray-600 mt-1">
            Please review the details of the {totalTests} test
            {totalTests > 1 && "s"} about to be created
          </p>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {allClassTests.map(({ grade, tests }) => (
            <div key={grade} className="mb-6">
              {/* Class Header */}
              <div className="bg-gray-100 p-2 rounded-md flex items-center justify-between">
                <span className="font-medium text-gray-700">Class {grade}</span>
                <span className="text-sm text-gray-500">
                  {tests.length} {tests.length === 1 ? "Test" : "Tests"}
                </span>
              </div>

              {/* List of tests for this class */}
              <div className="mt-3 space-y-2">
                {tests.map((test, idx) => {
                  return (
                    <div
                      key={`${grade}-${test.subject}-${idx}`}
                      // className="border-b pb-2 last:border-b-0"
                      className="pb-2"
                    >
                      {/* You can name the test however you want; the image 
                                            in your question had something like “Maths_Class8” */}
                      <div className="font-semibold text-gray-700 mb-1 flex justify-between">
                        <div>
                          {test.subject}_Class{grade}
                        </div>
                        <div>
                          <span className="font-medium">Max Score:</span> {test.maxScore}
                        </div>
                      </div>
                      {/* <div className="text-sm text-gray-600 flex flex-wrap gap-4"> */}
                      {/* <div  className="text-sm text-gray-600 grid grid-cols-3"> */}
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
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-md bg-yellow-400 text-gray-800 font-semibold hover:bg-yellow-300"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSummary;
