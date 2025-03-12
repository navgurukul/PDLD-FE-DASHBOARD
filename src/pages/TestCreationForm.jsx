import { SUBJECTS_BY_GRADE, SUBJECT_CATEGORIES } from "../data/testData";
import { useEffect, useState, useRef } from "react";
import apiInstance from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation, useParams } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const TestCreationForm = () => {
  const [testDates, setTestDates] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [testType, setTestType] = useState("regular");
  const [testScores, setTestScores] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [creatingTest, setCreatingTest] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { Id: testId } = useParams();
  const location = useLocation();
  const dropdownRef = useRef(null);


  const navigate = useNavigate();

  const handleScoreChange = (gradeSubject, score) => {
    const maxScore = Number(score);
    if (maxScore > 80) {
      toast.error("Max Score cannot be more than 80");
      return;
    }
    setTestScores((prev) => ({ ...prev, [gradeSubject]: maxScore }));
  };

  const handleGradeSelection = (grade) => {
    if (!grade) return;
    const isSelected = selectedGrades.includes(grade);
    if (isSelected) {
      setSelectedGrades(selectedGrades.filter((g) => g !== grade));
      const newSelectedSubjects = { ...selectedSubjects };
      delete newSelectedSubjects[grade];
      setSelectedSubjects(newSelectedSubjects);
    } else {
      setSelectedGrades([...selectedGrades, grade].sort((a, b) => a - b));
    }
  };

  const handleSubjectSelection = (grade, subject) => {
    if (!grade || !subject) return;

    if (isEditMode) {
      // In edit mode, only ONE subject per grade

      const currentlySelected = selectedSubjects[grade] || [];

      // 1️⃣ If user clicks the same subject => toggle it off
      if (currentlySelected.includes(subject)) {
        // Remove it
        setSelectedSubjects((prev) => ({
          ...prev,
          [grade]: prev[grade].filter((s) => s !== subject),
        }));
        return;
      }

      // 2️⃣ If exactly one subject is already selected => we’re “switching” subjects
      if (currentlySelected.length === 1) {
        const oldSubject = currentlySelected[0];

        // Preserve old date & score
        const oldKey = `${grade}-${oldSubject}`;
        const newKey = `${grade}-${subject}`;

        // Copy date from old subject to new subject
        setTestDates((prev) => {
          const oldValue = prev[oldKey];
          // Don’t lose other fields
          const updated = { ...prev };
          if (oldValue) {
            updated[newKey] = oldValue;
          }
          // Optionally remove the old date if you don’t want leftover keys
          delete updated[oldKey];
          return updated;
        });

        // Copy maxScore from old subject to new subject
        setTestScores((prev) => {
          const oldValue = prev[oldKey];
          const updated = { ...prev };
          if (oldValue) {
            updated[newKey] = oldValue;
          }
          // Optionally remove old subject’s score
          delete updated[oldKey];
          return updated;
        });

        // Now replace the old subject with the new one in selectedSubjects
        setSelectedSubjects((prev) => ({
          ...prev,
          [grade]: [subject],
        }));

      } else {
        // 3️⃣ No subject is selected yet => just add the new one
        setSelectedSubjects((prev) => ({
          ...prev,
          [grade]: [subject],
        }));
      }
    } else {
      // ⏺ Create mode => allow multiple subjects
      setSelectedSubjects((prev) => ({
        ...prev,
        [grade]: prev[grade]?.includes(subject)
          ? prev[grade].filter((s) => s !== subject)
          : [...(prev[grade] || []), subject],
      }));
    }
  };

  const handleDateSelection = (gradeSubject, date) => {
    setTestDates((prevDates) => ({
      ...prevDates,
      [gradeSubject]: date,
    }));
  };

  const toggleDropdown = (grade) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [grade]: !prev[grade],
    }));
  };

  const handleCreateTest = async () => {
    setCreatingTest(true);
    try {
      const payload = {
        testType: testType === "regular" ? "SYLLABUS" : "REMEDIAL",
        classes: selectedGrades.map((grade) => ({
          class: grade,
          subjects: (selectedSubjects[grade] || []).map((subject) => {
            const key = `${grade}-${subject}`;
            const subjectObj = {
              subject,
              dueDate: testDates[key] || "",
            };
            if (testType === "regular") {
              subjectObj.maxScore = testScores[key]
                ? Number(testScores[key])
                : 100;
            }
            return subjectObj;
          }),
        })),
      };

      console.log("Payload => ", payload);

      let response;

      if (!isEditMode) {
        // ---------- CREATE MODE (POST) ----------
        // Keep your old "multi-class" payload logic EXACTLY as is:
        const payload = {
          testType: testType === "regular" ? "SYLLABUS" : "REMEDIAL",
          classes: selectedGrades.map((grade) => ({
            class: grade,
            subjects: (selectedSubjects[grade] || []).map((subject) => {
              const key = `${grade}-${subject}`;
              const subjectObj = {
                subject,
                dueDate: testDates[key] || "",
              };
              if (testType === "regular") {
                subjectObj.maxScore = testScores[key]
                  ? Number(testScores[key])
                  : 100;
              }
              return subjectObj;
            }),
          })),
        };

        console.log("Create Payload => ", payload);
        response = await apiInstance.post("/dev/test", payload);
      } else {
        // ---------- EDIT MODE (PATCH) ----------
        // Single grade & single subject => simplified patch payload
        const [grade] = selectedGrades;
        const [subject] = selectedSubjects[grade] || [];
        const key = `${grade}-${subject}`;
        const originalDate = testDates[key] || "";

        let editDate = "";
        if (originalDate) {
          const [year, month, day] = originalDate.split("-");
          editDate = `${day}-${month}-${year}`;
        }

        // Build the short payload
        const editPayload = {
          subject: subject,
          testDate: editDate || "",
        };
        // If testType is "regular", include maxScore
        if (testType === "regular") {
          editPayload.maxScore = testScores[key]
            ? Number(testScores[key])
            : 100;
        }

        console.log("Edit Payload => ", editPayload);
        response = await apiInstance.patch(`/dev/test/${testId}`, editPayload);
      }

      console.log("Response => ", response?.data?.success);

      if (response?.data?.success) {
        toast.success(
          isEditMode ? "Test Updated Successfully" : "Test Created Successfully"
        );
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.error(
          isEditMode ? "Failed to update test" : "Failed to create test"
        );
      }
    } catch (error) {
      console.error("Error => ", error);
      toast.error("Something went wrong");
    } finally {
      setCreatingTest(false);
    }
  };

  const isFormValid = () => {
    if (selectedGrades.length === 0) return false;

    for (const grade of selectedGrades) {
      if (!selectedSubjects[grade]?.length) return false;

      for (const subject of selectedSubjects[grade]) {
        const key = `${grade}-${subject}`;
        if (!testDates[key]) return false;

        // Only validate maxScore for "regular" test type
        if (
          testType === "regular" &&
          (!testScores[key] || testScores[key] > 80)
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const fetchSingleTestData = async (id) => {
    console.log("TRIGGERED");
    setIsLoading(true);
    try {
      const response = await apiInstance.get(`/dev/test/${id}`);
      console.log(response, "RESPONSE");
      if (response?.data?.success) {
        const { subject, testDate, testClass, testType, maxScore } =
          response.data.data;

        // Map the fetched testType to our internal state ("SYLLABUS" => "regular", "REMEDIAL" => "remedial")
        setTestType(testType === "SYLLABUS" ? "regular" : "remedial");

        // Set the selected grade
        setSelectedGrades([testClass]);

        // Set the selected subject(s)
        setSelectedSubjects({ [testClass]: [subject] });

        // Convert testDate to YYYY-MM-DD so it can populate the date input
        const dateStr = new Date(testDate).toISOString().split("T")[0];
        setTestDates({ [`${testClass}-${subject}`]: dateStr });

        // If the test is a SYLLABUS test, we also need the maxScore
        if (testType === "SYLLABUS") {
          setTestScores({ [`${testClass}-${subject}`]: maxScore });
        }
      }
    } catch (error) {
      console.error("Error => ", error);
      toast.error("Failed to fetch test data");
    } finally {
      // Stop loader
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if the URL path includes '/edit/testCreation' or contains "edit" in some fashion
    if (location.pathname.includes("/edit/testCreation") && testId) {
      setIsEditMode(true);
      fetchSingleTestData(testId);
    }
  }, [testId]);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen({});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Tinted transparent background
            backdropFilter: "blur(5px)", // Optional: Adds a slight blur effect
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300, // Ensures it appears above other elements
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <div style={{ width: "40%", margin: "20px auto" }}>
        <div className="space-y-4">
        { isEditMode && (<h5 className="text-lg font-bold text-[#2F4F4F] mb-8">Edit Test Details</h5>) }
          <h2 className="text-xl font-semibold mb-2">Test Type</h2>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="testType"
                value="regular"
                checked={testType === "regular"}
                onChange={() => setTestType("regular")}
                className="w-4 h-5 accent-gray-500"
                disabled={isEditMode}
              />
              <span
                className={`px-2 py-2 rounded-lg ${testType === "regular"
                  ? "text-gray-700 font-bold"
                  : "text-gray-700"
                  }`}
              >
                Syllabus
              </span>
            </label>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="testType"
                  value="remedial"
                  checked={testType === "remedial"}
                  onChange={() => setTestType("remedial")}
                  className="w-4 h-5 accent-gray-500"
                  disabled={isEditMode}
                />
                <span
                  className={`px-2 py-2 rounded-lg ${testType === "remedial"
                    ? "text-gray-700 font-bold"
                    : "text-gray-700"
                    }`}
                >
                  Remedial
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">Classes</h2>
          {/* {!isEditMode && (
            <div className="relative">
              <div
                className="w-full bg-white text-black border border-[#BDBDBD] rounded-lg p-2 cursor-pointer flex justify-between items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-gray-500">
                  {selectedGrades.length === 0 ? "Choose class" : "Choose class"}
                </span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.8751 9.00002L11.9951 12.88L8.1151 9.00002C7.7251 8.61002 7.0951 8.61002 6.7051 9.00002C6.3151 9.39002 6.3151 10.02 6.7051 10.41L11.2951 15C11.6851 15.39 12.3151 15.39 12.7051 15L17.2951 10.41C17.6851 10.02 17.6851 9.39002 17.2951 9.00002C16.9051 8.62002 16.2651 8.61002 15.8751 9.00002Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1)
                    .filter((grade) => !selectedGrades.includes(grade))
                    .map((grade) => (
                      <div
                        key={grade}
                        className="p-2 cursor-pointer hover:bg-gray-200 text-gray-700"
                        onClick={() => {
                          handleGradeSelection(grade);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Class {grade}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {selectedGrades.map((grade) => (
              <div
                key={grade}
                className="px-4 py-3 bg-[#EAEDED] text-[#2F4F4F] rounded-lg flex items-center gap-2"
              >
                <span>Class {grade}</span>
                {!isEditMode && (
                  <button
                    onClick={() => handleGradeSelection(grade)}
                    className="text-[#2F4F4F] "
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div> */}

          {!isEditMode && (
            <div className="relative">
              <div
                className="w-full bg-white text-black border border-[#BDBDBD] rounded-lg p-2 cursor-pointer flex flex-wrap items-center gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {/* Selected Classes inside Input Box */}
                <div className="flex flex-wrap gap-2">
                  {selectedGrades.map((grade) => (
                    <div
                      key={grade}
                      className="px-3 py-1 bg-[#EAEDED] text-[#2F4F4F] rounded-lg flex items-center gap-2"
                    >
                      <span>Class {grade}</span>
                      {!isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGradeSelection(grade);
                          }}
                          className="text-[#2F4F4F]"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Placeholder or Dropdown Icon */}
                {selectedGrades.length === 0 && (
                  <span className="text-gray-500">Choose class</span>
                )}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-auto"
                >
                  <path
                    d="M15.8751 9.00002L11.9951 12.88L8.1151 9.00002C7.7251 8.61002 7.0951 8.61002 6.7051 9.00002C6.3151 9.39002 6.3151 10.02 6.7051 10.41L11.2951 15C11.6851 15.39 12.3151 15.39 12.7051 15L17.2951 10.41C17.6851 10.02 17.6851 9.39002 17.2951 9.00002C16.9051 8.62002 16.2651 8.61002 15.8751 9.00002Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </div>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1)
                    .filter((grade) => !selectedGrades.includes(grade))
                    .map((grade) => (
                      <div
                        key={grade}
                        className="p-2 cursor-pointer hover:bg-gray-200 text-gray-700"
                        onClick={() => {
                          handleGradeSelection(grade);
                          setIsDropdownOpen(false);
                        }}
                      >
                        Class {grade}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>

        {selectedGrades.length > 0 && (
          <div ref={dropdownRef} className="space-y-4">
            {selectedGrades.map((grade) => (
              <div key={grade} className="p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Class {grade}</h3>

                {grade >= 1 && grade <= 10 && (
                  <div className="w-full">
                    <div
                      className="rounded-md p-2 flex justify-between items-center cursor-pointer bg-white border border-gray-300"
                      onClick={() => toggleDropdown(grade)}
                    >
                      <div className="text-gray-500 flex flex-wrap gap-2">
                        {!selectedSubjects[grade] ||
                          selectedSubjects[grade].length === 0
                          ? "Choose subjects"
                          : selectedSubjects[grade].map((subject) => (
                            <span
                              key={subject}
                              className="bg-gray-200 text-black px-4 py-1 h-10 rounded-md text-sm flex items-center"
                            >
                              {subject}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubjectSelection(grade, subject);
                                }}
                                className="ml-1 text-gray-500"
                              >
                                ✖
                              </button>
                            </span>
                          ))}
                      </div>
                      <div className="flex items-center">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.8751 9.00002L11.9951 12.88L8.1151 9.00002C7.7251 8.61002 7.0951 8.61002 6.7051 9.00002C6.3151 9.39002 6.3151 10.02 6.7051 10.41L11.2951 15C11.6851 15.39 12.3151 15.39 12.7051 15L17.2951 10.41C17.6851 10.02 17.6851 9.39002 17.2951 9.00002C16.9051 8.62002 16.2651 8.61002 15.8751 9.00002Z"
                            fill="#BDBDBD"
                          />
                        </svg>
                      </div>
                    </div>
                    {dropdownOpen[grade] && (
                      <div className="p-4 rounded-lg shadow-lg bg-white max-h-96 overflow-y-auto border border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {(testType === "remedial"
                            ? ["Maths", "Hindi"]
                            : SUBJECTS_BY_GRADE[grade]
                          )?.map((subject) => (
                            <div
                              key={subject}
                              className="px-3 py-2 flex items-center cursor-pointer"
                              onClick={() =>
                                handleSubjectSelection(grade, subject)
                              }
                            >
                              <div className="relative w-4 h-4 border border-[#2F4F4F] rounded-sm flex items-center justify-center mr-2">
                                {selectedSubjects[grade]?.includes(subject) && (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V3.33333C14 2.6 13.4 2 12.6667 2ZM7.14 10.86C6.88 11.12 6.46 11.12 6.2 10.86L3.80667 8.46667C3.54667 8.20667 3.54667 7.78667 3.80667 7.52667C4.06667 7.26667 4.48667 7.26667 4.74667 7.52667L6.66667 9.44667L11.2533 4.86C11.5133 4.6 11.9333 4.6 12.1933 4.86C12.4533 5.12 12.4533 5.54 12.1933 5.8L7.14 10.86Z"
                                      fill="#2F4F4F"
                                    />
                                  </svg>
                                )}
                              </div>
                              {subject}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(grade === 11 || grade === 12) && (
                  <div className="w-full ">
                    <div
                      className="rounded-md p-2 flex justify-between items-center cursor-pointer bg-white border border-gray-400"
                      onClick={() => toggleDropdown(grade)}
                      ref={dropdownRef}
                    >
                      <div className="text-gray-500 flex flex-wrap gap-2 ">
                        {!selectedSubjects[grade] ||
                          selectedSubjects[grade].length === 0
                          ? "Choose subjects"
                          : selectedSubjects[grade].map((subject) => (
                            <span
                              key={subject}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm flex items-center"
                            >
                              {subject}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubjectSelection(grade, subject);
                                }}
                                className="ml-1 text-gray-500"
                              >
                                ✖
                              </button>
                            </span>
                          ))}
                      </div>
                      <div className="flex items-center">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.8751 9.00002L11.9951 12.88L8.1151 9.00002C7.7251 8.61002 7.0951 8.61002 6.7051 9.00002C6.3151 9.39002 6.3151 10.02 6.7051 10.41L11.2951 15C11.6851 15.39 12.3151 15.39 12.7051 15L17.2951 10.41C17.6851 10.02 17.6851 9.39002 17.2951 9.00002C16.9051 8.62002 16.2651 8.61002 15.8751 9.00002Z"
                            fill="#BDBDBD"
                          />
                        </svg>
                      </div>
                    </div>
                    {dropdownOpen[grade] && (
                      <div
                        className="mt-1 p-4 rounded-lg shadow-lg bg-white ">
                        {Object.entries(SUBJECT_CATEGORIES).map(
                          ([category, subjects]) => (
                            <div key={category} className="mb-3">
                              <div className="text-[#2F4F4F] text-sm font-semibold font-['Work Sans'] leading-normal px-3 py-2 ">
                                {category}
                              </div>
                              <div className="flex flex-wrap gap-3 px-3">
                                {subjects
                                  .filter((subject) =>
                                    testType === "remedial"
                                      ? ["Maths", "Hindi"].includes(subject)
                                      : SUBJECTS_BY_GRADE[grade].includes(
                                        subject
                                      )
                                  )
                                  .map((subject) => (
                                    <div
                                      key={subject}
                                      className="px-3 py-2 hover:bg-gray-50 flex items-center cursor-pointer "
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubjectSelection(grade, subject);
                                      }}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${selectedSubjects[grade]?.includes(
                                          subject
                                        )
                                          ? "bg-[#2F4F4F] border-[#2F4F4F]"
                                          : "border-[#2F4F4F] bg-white"
                                          }`}
                                      >
                                        {selectedSubjects[grade]?.includes(
                                          subject
                                        ) && (
                                            <svg
                                              className="w-4 h-4"
                                              fill="none"
                                              stroke="white"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                          )}
                                      </div>
                                      {subject}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedSubjects[grade]?.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="text-[#2F4F4F] text-lg font-semibold">
                      Set Test Date {testType === "regular" && "and Max Score"}
                    </h4>
                    {selectedSubjects[grade].map((subject) => {
                      const combinedKey = `${grade}-${subject}`;
                      return (
                        <div
                          key={combinedKey}
                          className="flex items-center space-x-4 p-2 bg-white rounded-lg"
                        >
                          <span className="w-48 text-gray-700">{subject}</span>
                          <div className="flex justify-end w-full">
                            <input
                              type="date"
                              className="w-36 p-2 border border-[#E0E0E0] rounded-lg"
                              value={testDates[combinedKey] || ""}
                              onChange={(e) =>
                                handleDateSelection(combinedKey, e.target.value)
                              }
                            />
                          </div>
                          {testType === "regular" && (
                            <div className="w-[200px] h-12 px-4 py-3 rounded-lg border border-[#E0E0E0] flex items-center">
                              <input
                                type="text"
                                placeholder="Max Score"
                                className="w-full h-full focus:outline-none text-lg"
                                value={testScores[combinedKey] || ""}
                                onChange={(e) =>
                                  handleScoreChange(combinedKey, e.target.value)
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button
            onClick={handleCreateTest}
            // Disable if form is invalid OR if we are in the middle of creating a test
            disabled={!isFormValid() || creatingTest}
            className={`flex justify-center h-11 px-4 py-2 min-w-[120px] w-max ${!isFormValid() || creatingTest
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#FFD700] cursor-pointer"
              } rounded-lg items-center gap-2`}
          >
            {creatingTest
              ? "Saving Test Details..."
              : isEditMode
                ? "Update Test"
                : "Create Test"}
          </button>
        </div>
        {/* <ToastContainer /> */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
        />
      </div>
    </>
  );
};

export default TestCreationForm;
