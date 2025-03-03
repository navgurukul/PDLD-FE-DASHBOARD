import { SUBJECTS_BY_GRADE, SUBJECT_CATEGORIES } from '../../SubjectData';
import { Calendar, Clock, ChevronDown, Check, X } from 'lucide-react';
import { useState } from 'react';


const SubjectsSelector = () => {
  const [testDates, setTestDates] = useState({});
  const [description, setDescription] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [testType, setTestType] = useState('regular');


  const getAvailableSubjects = () => {
    const subjects = new Set();
    selectedGrades.forEach(grade => {
      SUBJECTS_BY_GRADE[grade]?.forEach(subject => subjects.add(subject));
    });
    return Array.from(subjects);
  };

  const handleGradeSelection = (grade) => {
    if (!grade) return;

    const isSelected = selectedGrades.includes(grade);
    if (isSelected) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
      const newSelectedSubjects = { ...selectedSubjects };
      delete newSelectedSubjects[grade];
      setSelectedSubjects(newSelectedSubjects);
    } else {
      setSelectedGrades([...selectedGrades, grade].sort((a, b) => a - b));
    }
  };

  const handleSubjectSelection = (grade, subject) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [grade]: prev[grade]?.includes(subject)
        ? prev[grade].filter(s => s !== subject)
        : [...(prev[grade] || []), subject],
    }));
  };

  const handleDateSelection = (gradeSubject, date) => {
    setTestDates(prevDates => ({
      ...prevDates,
      [gradeSubject]: date
    }));
  };

  const toggleDropdown = (grade) => {
    setDropdownOpen(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }));
  };

  const subjectInCategory = (subject, category) => {
    return SUBJECT_CATEGORIES[category]?.includes(subject);
  };

  return (
    <>
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
              ? ' text-[#2f4f4f]'
              : ' text-gray-700'
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
                checked={testType === 'remedial'}
                onChange={() => setTestType('remedial')}
                className="w-5 h-5"
              />
              <span className={`px-4 py-2 rounded-lg ${testType === 'remedial' ? 'text-[#2f4f4f]' : 'text-gray-700'}`}>
                Remedial
              </span>
            </label>
          </div>

        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Classes</h2>
        <div className="relative">
          <select
            className="w-full bg-white flex-col justify-start items-center gap-12 inline-flex overflow-hidden p-2 
               border border-[#bdbdbd] !important rounded-lg text-[#bdbdbd] appearance-none cursor-pointer 
               focus:border-[#bdbdbd] focus:outline-none"
            value=""
            onChange={(e) => handleGradeSelection(Number(e.target.value))}
          >
            <option value="" disabled>Choose class           
            </option>
            {Array.from({ length: 12 }, (_, i) => i + 1)
              .filter(grade => !selectedGrades.includes(grade))
              .map(grade => (
                <option key={grade} value={grade}>
                  Class {grade}
                </option>
              ))
            }
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

          </select>
          <div className="text-[#483d8b] text-sm font-normal font-['Work Sans'] leading-normal">Relevant subjects will appear for each selected class</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedGrades.map(grade => (
            <div
              key={grade}
              className="px-4 py-3 bg-[#eaeded] text-[#2f4f4f] rounded-lg flex items-center gap-2"
            >
              <span>Class {grade}</span>
              <button
                onClick={() => handleGradeSelection(grade)}
                className="text-[#2f4f4f] "
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
      {selectedGrades.length > 0 && (
        <div className="space-y-4">
          {selectedGrades.map(grade => (
            <div key={grade} className="p-4 rounded-lg">
              <h3 className="text-lg font-semibold"> Class {grade}</h3>
              {(grade >= 1 && grade <= 10) && (
                <div className="w-full">
                  <div
                    className="rounded-md p-2 flex justify-between items-center cursor-pointer bg-white border border-gray-300"
                    onClick={() => toggleDropdown(grade)}
                  >
                    <div className="text-gray-500">
                      {!selectedSubjects[grade] || selectedSubjects[grade].length === 0
                        ? "Select subjects..."
                        : `${selectedSubjects[grade].length} subject${selectedSubjects[grade].length !== 1 ? 's' : ''} selected`}
                    </div>

                  </div>
                  {dropdownOpen[grade] && (
                    <div className="p-4 rounded-lg shadow-lg bg-white max-h-96 overflow-y-auto border border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {(testType === 'remedial' ? ['Maths', 'Hindi'] : SUBJECTS_BY_GRADE[grade])?.map(subject => (
                          <div
                            key={subject}
                            className="px-3 py-2 flex items-center cursor-pointer"
                            onClick={() => handleSubjectSelection(grade, subject)}
                          >
                            <div className="relative w-4 h-4 border border-[#2f4f4f] rounded-sm flex items-center justify-center mr-2">
                              {selectedSubjects[grade]?.includes(subject) && (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.6667 2H3.33333C2.6 2 2 2.6 2 3.33333V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V3.33333C14 2.6 13.4 2 12.6667 2ZM7.14 10.86C6.88 11.12 6.46 11.12 6.2 10.86L3.80667 8.46667C3.54667 8.20667 3.54667 7.78667 3.80667 7.52667C4.06667 7.26667 4.48667 7.26667 4.74667 7.52667L6.66667 9.44667L11.2533 4.86C11.5133 4.6 11.9333 4.6 12.1933 4.86C12.4533 5.12 12.4533 5.54 12.1933 5.8L7.14 10.86Z" fill="#2F4F4F" />
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
                <div className="w-full">
                  <div
                    className="rounded-md p-2 flex justify-between items-center cursor-pointer bg-white"
                    onClick={() => toggleDropdown(grade)}
                  >
                    <div className="text-gray-500">
                      {!selectedSubjects[grade] || selectedSubjects[grade].length === 0
                        ? "Select subjects..."
                        : `${selectedSubjects[grade].length} subject${selectedSubjects[grade].length !== 1 ? 's' : ''} selected`}
                    </div>
                  </div>

                  {dropdownOpen[grade] && (
                    <div className="mt-1 p-4 rounded-lg shadow-lg bg-white ">
                      {selectedSubjects[grade]?.length > 0 && (
                        <div className="bg-gray-50 p-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedSubjects[grade].map(subject => (
                              <div
                                key={subject}
                                className="flex items-center px-3 py-2 rounded-lg text-sm text-[#2f4f4f] bg-[#eaeded]"
                              >
                                {subject}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubjectSelection(grade, subject);
                                  }}
                                  className="ml-1"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.entries(SUBJECT_CATEGORIES).map(([category, subjects]) => (
                        <div key={category} className="mb-3">
                          <div className="text-[#2f4f4f] text-sm font-semibold font-['Work Sans'] leading-normal px-3 py-2 ">
                            {category}
                          </div>

                          <div className="flex flex-wrap gap-3 px-3">
                            {subjects
                              .filter(subject =>
                                testType === 'remedial'
                                  ? ['Maths', 'Hindi'].includes(subject)  
                                  : SUBJECTS_BY_GRADE[grade].includes(subject) 
                              )
                              .map(subject => (
                                <div
                                  key={subject}
                                  className="px-3 py-2 hover:bg-gray-50 flex items-center cursor-pointer "
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubjectSelection(grade, subject);
                                  }}
                                >
                                  <div
                                    className={`w-4 h-4 rounded border mr-2 flex items-center justify-center ${selectedSubjects[grade]?.includes(subject) ? 'bg-[#2f4f4f] border-[#2f4f4f]' : 'border-[#2f4f4f] bg-white'
                                      }`}
                                  >
                                    {selectedSubjects[grade]?.includes(subject) && (
                                      <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  {subject}
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedSubjects[grade]?.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-md font-medium">Set Test Date and Max Score</h4>
                  {selectedSubjects[grade].map(subject => (
                    <div key={`${grade}-${subject}`} className="flex items-center space-x-4 p-2 bg-white rounded-lg">
                      <span className="w-48 text-gray-700">{subject}</span>
                      <div className="flex-1 mr-6">
                        <input
                          type="date"
                          className="w-32 p-2 border border-[#e0e0e0] rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                          value={testDates[`${grade}-${subject}`] || ''}
                          onChange={(e) => handleDateSelection(`${grade}-${subject}`, e.target.value)}
                        />
                      </div>
                      <div className="w-[124px] h-12 px-4 py-3 rounded-lg border border-[#e0e0e0] justify-center items-center gap-4 inline-flex">
                        <div className="text-[#2f4f4f] text-lg font-normal font-['Work Sans'] leading-[30.60px]">90</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </>
  )
}
export default SubjectsSelector;