import { SUBJECTS_BY_GRADE, SUBJECT_CATEGORIES } from "../data/testData";
import { Calendar, Clock, ChevronDown, Check, X } from "lucide-react";
import { useState } from "react";
import Button from "../components/ButtonCustom";
import apiInstance from "../../api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TestCreationForm = () => {
  const [testDates, setTestDates] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [testType, setTestType] = useState("regular");
  const [testScores, setTestScores] = useState({});

  const handleScoreChange = (gradeSubject, score) => {
    setTestScores((prev) => ({ ...prev, [gradeSubject]: score }));
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
    setSelectedSubjects((prev) => ({
      ...prev,
      [grade]: prev[grade]?.includes(subject)
        ? prev[grade].filter((s) => s !== subject)
        : [...(prev[grade] || []), subject],
    }));
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
    if (selectedGrades.length === 0) {
      alert("Please select at least one class.");
      return;
    }

    for (const grade of selectedGrades) {
      if (!selectedSubjects[grade]?.length) {
        alert(`Please select at least one subject for Class ${grade}.`);
        return;
      }

      for (const subject of selectedSubjects[grade]) {
        const key = `${grade}-${subject}`;

        if (!testDates[key]) {
          alert(`Please select a date for ${subject} in Class ${grade}.`);
          return;
        }

        if (testType === "regular" && (!testScores[key] || isNaN(testScores[key]) || Number(testScores[key]) <= 0)) {
          alert(`Please enter a valid max score for ${subject} in Class ${grade}.`);
          return;
        }
      }
    }

    toast.success("Test Created Successfully");

    try {
      const payload = {
        testType: testType === "regular" ? "SYLLABUS" : "REMEDIAL",
        classes: selectedGrades.map((grade) => ({
          class: grade,
          subjects: (selectedSubjects[grade] || []).map((subject) => {
            const key = `${grade}-${subject}`;
            const subjectObj = {
              subject,
              testName: `${subject} Test`,
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
      const response = await apiInstance.post("/dev/test", payload);
      console.log("Response => ", response.data);
    } catch (error) {
      console.error("Error => ", error);
    }
  };

  return (
    <div style={{ width: "40%", margin: "20px auto" }}>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Type</h2>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="testType"
              value="regular"
              checked={testType === "regular"}
              onChange={() => setTestType("regular")}
              className="w-5 h-5"
            />
            <span
              className={`px-4 py-2 rounded-lg ${testType === "regular" ? " text-[#2F4F4F]" : " text-gray-700"
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
                className="w-5 h-5"
              />
              <span
                className={`px-4 py-2 rounded-lg ${testType === "remedial" ? "text-[#2F4F4F]" : "text-gray-700"
                  }`}
              >
                Remedial
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Classes</h2>
        <div className="relative">
          {/* <select
            className="w-full bg-white flex-col justify-start items-center gap-12 inline-flex overflow-hidden p-2
       border border-[#BDBDBD] rounded-lg text-[#BDBDBD] appearance-none cursor-pointer
       focus:border-[#BDBDBD] focus:outline-none "
            value=""
            onChange={(e) => handleGradeSelection(Number(e.target.value))}
          >
            <option value="" disabled>
              Choose class
            </option>
            {Array.from({ length: 12 }, (_, i) => i + 1)
              .filter((grade) => !selectedGrades.includes(grade))
              .map((grade) => (
                <option key={grade} value={grade}>
                  Class {grade}
                </option>
              ))}
          </select> */}

          <select
            className="w-full bg-white flex-col justify-start items-center gap-12 inline-flex overflow-hidden p-2
    border border-[#BDBDBD] rounded-lg text-[#BDBDBD] appearance-none cursor-pointer
    focus:border-[#BDBDBD] focus:outline-none"
            value=""
            onChange={(e) => handleGradeSelection(Number(e.target.value))}
          >
            <option value="" disabled>
              Choose class
            </option>
            {Array.from({ length: 12 }, (_, i) => i + 1)
              .filter((grade) => !selectedGrades.includes(grade))
              .map((grade) => (
                <option
                  key={grade}
                  value={grade}
                  className="bg-white text-black checked:bg-gray-300"
                >
                  Class {grade}
                </option>
              ))}
          </select>

          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
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
          <div className="text-[#483D8B] text-sm font-normal font-['Work Sans'] leading-normal">
            Relevant subjects will appear for each selected class
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedGrades.map((grade) => (
            <div
              key={grade}
              className="px-4 py-3 bg-[#EAEDED] text-[#2F4F4F] rounded-lg flex items-center gap-2"
            >
              <span>Class {grade}</span>
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
            </div>
          ))}
        </div>
      </div>

      {selectedGrades.length > 0 && (
        <div className="space-y-4">
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
                    <div className="mt-1 p-4 rounded-lg shadow-lg bg-white ">
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
                                    : SUBJECTS_BY_GRADE[grade].includes(subject)
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
                  <h4 className="text-[#2F4F4F] text-lg font-semibold font-['Work Sans'] leading-[30.60px]">
                    Set Test Date and Max Score
                  </h4>
                  {selectedSubjects[grade].map((subject) => {
                    // We define a local variable to use for `key` references
                    const combinedKey = `${grade}-${subject}`;
                    return (
                      <div
                        key={combinedKey}
                        className="flex items-center space-x-4 p-2 bg-white rounded-lg"
                      >
                        <span className="w-48 text-gray-700">{subject}</span>
                        <div className="flex-1 mr-6">
                          <input
                            type="date"
                            className="w-32 p-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                            value={testDates[combinedKey] || ""}
                            onChange={(e) =>
                              handleDateSelection(combinedKey, e.target.value)
                            }
                          />
                        </div>
                        <div className="w-[124px] h-12 px-4 py-3 rounded-lg border border-[#E0E0E0] justify-center items-center gap-4 inline-flex">
                          <div className="text-[#2F4F4F] text-lg font-normal font-['Work Sans'] leading-[30.60px]">
                            <input
                              type="text"
                              placeholder="Max Score"
                              className="w-full h-full focus:outline-none text-[#2F4F4F] text-lg font-normal"
                              value={testScores[combinedKey] || ""}
                              onChange={(e) =>
                                handleScoreChange(combinedKey, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/**
        Attach the new handleCreateTest function to our button click
      */}
      <Button text={"Create Test"} onClick={handleCreateTest} />
      <ToastContainer />
    </div>
  );
};

export default TestCreationForm;
