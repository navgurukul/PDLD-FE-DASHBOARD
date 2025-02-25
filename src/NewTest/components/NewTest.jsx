import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

// Comprehensive subject mapping by grade
const SUBJECTS_BY_GRADE = {
    1: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    2: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    3: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    4: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    5: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    6: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    7: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    8: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    9: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    10: [
        'English',
        'Hindi',
        'Maths',
        'Science',
        'Social Science',
        'Sanskrit'
    ],
    11: [
        'Accountancy',
        'Biology',
        'Business Studies',
        'Chemistry',
        'Computer Science',
        'Economics',
        'Geography',
        'History',
        'Home Science',
        'Physics',
        'Political Science',
        'Botany',
        'Zoology',
        'Mathematics',
        'Hindi',
        'Sanskrit',
        'English',
        'Regional Language',
        'Environment Studies',
        'Sports',
        'Music',
        'Science',
        'Social Studies',
        'Art Eduaction',
        'Health & Physical Eduaction'

    ],
    12: [
        'Accountancy',
        'Biology',
        'Business Studies',
        'Chemistry',
        'Computer Science',
        'Economics',
        'Geography',
        'History',
        'Home Science',
        'Physics',
        'Political Science',
        'Botany',
        'Zoology',
        'Mathematics',
        'Hindi',
        'Sanskrit',
        'English',
        'Regional Language',
        'Environment Studies',
        'Sports',
        'Music',
        'Science',
        'Social Studies',
        'Art Eduaction',
        'Health & Physical Eduaction'      
    ]
};

const BatchTestCreation = () => {
    const [testType, setTestType] = useState('regular');
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState({});
    const [testDates, setTestDates] = useState({});
    const [description, setDescription] = useState('');

    // Get all available subjects for selected grades
    const getAvailableSubjects = () => {
        const subjects = new Set();
        selectedGrades.forEach(grade => {
            SUBJECTS_BY_GRADE[grade]?.forEach(subject => subjects.add(subject));
        });
        return Array.from(subjects);
    };

    // Handle grade selection and deselection
    const handleGradeSelection = (grade) => {
        // Skip if no grade is selected (happens when dropdown is reset)
        if (!grade) return;

        const isSelected = selectedGrades.includes(grade);
        if (isSelected) {
            // Remove grade and its subjects
            setSelectedGrades(selectedGrades.filter(g => g !== grade));
            const newSelectedSubjects = { ...selectedSubjects };
            delete newSelectedSubjects[grade];
            setSelectedSubjects(newSelectedSubjects);
        } else {
            // Add new grade
            setSelectedGrades([...selectedGrades, grade].sort((a, b) => a - b));
        }
    };

    // Handle subject selection for a grade
    const handleSubjectSelection = (grade, subject) => {
        const gradeSubjects = selectedSubjects[grade] || [];
        const isSelected = gradeSubjects.includes(subject);

        setSelectedSubjects({
            ...selectedSubjects,
            [grade]: isSelected
                ? gradeSubjects.filter(s => s !== subject)
                : [...gradeSubjects, subject]
        });
    };

    // Handle date selection for a subject in a specific grade
    const handleDateSelection = (gradeSubject, date) => {
        setTestDates(prevDates => ({
            ...prevDates,
            [gradeSubject]: date
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-[#2f4f4f] text-xl font-bold font-['Philosopher'] leading-[30px]">
                Note: Test names will be generated automatically in the format:
                <br />
                <span className="text-[#2f4f4f]">Subject_Class</span>
                (e.g., <span className="text-[#2f4f4f]">Science_Class1</span>)
            </div>


            {/* Test Type Selection */}
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
                            ? ' text-[#2f4f4f]'
                            : ' text-gray-700'
                            }`}
                        >
                            Remedial
                        </span>
                    </label>
                </div>
            </div>


            {/* Grade Selection Dropdown */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Classes</h2>
                <div className="relative">
                    <select
                        className="w-full p-2 border rounded-lg bg-[#eaeded] appearance-none cursor-pointer"
                        value=""
                        onChange={(e) => handleGradeSelection(Number(e.target.value))}
                    >
                        <option value="" disabled>Select a classes...</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1)
                            .filter(grade => !selectedGrades.includes(grade))
                            .map(grade => (
                                <option key={grade} value={grade}>
                                    Class {grade}
                                </option>
                            ))
                        }
                    </select>
                    <div className="text-[#483d8b] text-sm font-normal font-['Work Sans'] leading-normal">Relevant subjects will appear for each selected class</div>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Selected Grades Display */}
                <div className="flex flex-wrap gap-2">
                    {selectedGrades.map(grade => (
                        <div
                            key={grade}
                            className="px-3 py-1 bg-[#eaeded] text-[#2f4f4f] rounded-lg flex items-center gap-2"
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

            {/* Subject Selection */}
            {selectedGrades.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Subject List - Class 1</h2>
                    {selectedGrades.map(grade => (
                        <div key={grade} className="p-4 rounded-lg">
                            <h3 className="font-medium">Class {grade}</h3>
                            <div className="flex flex-wrap gap-2">
                                {SUBJECTS_BY_GRADE[grade]?.map(subject => (
                                    <button
                                        key={subject}
                                        className={`px-3 py-1 rounded-lg border ${selectedSubjects[grade]?.includes(subject)
                                            ? 'text-white' 
                                            : 'text-[#2f4f4f] border-[#2f4f4f] bg-white' 
                                            }`}
                                        style={{
                                            backgroundColor: selectedSubjects[grade]?.includes(subject) ? '#2f4f4f' : 'white',
                                        }}


                                        onClick={() => handleSubjectSelection(grade, subject)}
                                    >
                                        {subject}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Test Dates */}
            {Object.keys(selectedSubjects).length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Set Test Date and Max Score</h2>
                    <div className="space-y-6">
                        {selectedGrades.map(grade => {
                            const subjects = selectedSubjects[grade] || [];
                            if (subjects.length === 0) return null;

                            return (
                                <div key={grade} className="space-y-2">
                                    <h3 className="font-medium text-gray-700">Class {grade}</h3>
                                    <div className=" p-4 rounded-lg space-y-2">
                                        {subjects.map(subject => (
                                            <div key={`${grade}-${subject}`} className="flex items-center space-x-4 p-2 bg-white rounded-lg">
                                                <span className="w-48 text-gray-700">{subject}</span>
                                                <div className="flex-1 mr-6">
                                                    <input
                                                        type="date"
                                                        className="w-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" // Adjusted width here
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
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


            {/* Create Button */}
            <div className="flex justify-center">
                <button
                    className="h-12 px-4 py-2 bg-[#FFD700] rounded-lg justify-center items-center gap-2 inline-flex"
                    disabled={Object.keys(selectedSubjects).length === 0}
                >
                    <div className="text-center text-[#2f4f4f] text-lg font-bold font-['Karla'] leading-[30.60px]">
                        Create Test
                    </div>
                </button>
            </div>
        </div>
    );
};

export default BatchTestCreation;




// // File: components/BatchTestCreation/index.js
// import { useState } from 'react';
// import TestTypeSelector from "./TestTypeSelector";
// import GradeSelector from './GradeSelector';
// import SubjectSelector from './SubjectSelector';
// import TestDateSettings from './TestDateSettings';
// import { SUBJECTS_BY_GRADE } from './constants';

// const BatchTestCreation = () => {
//   const [testType, setTestType] = useState('regular');
//   const [selectedGrades, setSelectedGrades] = useState([]);
//   const [selectedSubjects, setSelectedSubjects] = useState({});
//   const [testDates, setTestDates] = useState({});
//   const [description, setDescription] = useState('');

//   // Handle grade selection and deselection
//   const handleGradeSelection = (grade) => {
//     // Skip if no grade is selected (happens when dropdown is reset)
//     if (!grade) return;

//     const isSelected = selectedGrades.includes(grade);
//     if (isSelected) {
//       // Remove grade and its subjects
//       setSelectedGrades(selectedGrades.filter(g => g !== grade));
//       const newSelectedSubjects = { ...selectedSubjects };
//       delete newSelectedSubjects[grade];
//       setSelectedSubjects(newSelectedSubjects);
//     } else {
//       // Add new grade
//       setSelectedGrades([...selectedGrades, grade].sort((a, b) => a - b));
//     }
//   };

//   // Handle subject selection for a grade
//   const handleSubjectSelection = (grade, subject) => {
//     const gradeSubjects = selectedSubjects[grade] || [];
//     const isSelected = gradeSubjects.includes(subject);

//     setSelectedSubjects({
//       ...selectedSubjects,
//       [grade]: isSelected
//         ? gradeSubjects.filter(s => s !== subject)
//         : [...gradeSubjects, subject]
//     });
//   };

//   // Handle date selection for a subject in a specific grade
//   const handleDateSelection = (gradeSubject, date) => {
//     setTestDates(prevDates => ({
//       ...prevDates,
//       [gradeSubject]: date
//     }));
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-8">
//       {/* Header */}
//       <div className="text-[#2f4f4f] text-xl font-bold font-['Philosopher'] leading-[30px]">
//         Note: Test names will be generated automatically in the format:
//         <br />
//         <span className="text-[#2f4f4f]">Subject_Class</span>
//         (e.g., <span className="text-[#2f4f4f]">Science_Class1</span>)
//       </div>

//       {/* Test Type Selection */}
//       <TestTypeSelector testType={testType} setTestType={setTestType} />

//       {/* Grade Selection */}
//       <GradeSelector 
//         selectedGrades={selectedGrades} 
//         handleGradeSelection={handleGradeSelection} 
//       />

//       {/* Subject Selection */}
//       {selectedGrades.length > 0 && (
//         <SubjectSelector
//           selectedGrades={selectedGrades}
//           selectedSubjects={selectedSubjects}
//           handleSubjectSelection={handleSubjectSelection}
//           subjectsByGrade={SUBJECTS_BY_GRADE}
//         />
//       )}

//       {/* Test Dates */}
//       {Object.keys(selectedSubjects).length > 0 && (
//         <TestDateSettings
//           selectedGrades={selectedGrades}
//           selectedSubjects={selectedSubjects}
//           testDates={testDates}
//           handleDateSelection={handleDateSelection}
//         />
//       )}

//       {/* Create Button */}
//       <div className="flex justify-center">
//         <button
//           className="h-12 px-4 py-2 bg-[#FFD700] rounded-lg justify-center items-center gap-2 inline-flex"
//           disabled={Object.keys(selectedSubjects).length === 0}
//         >
//           <div className="text-center text-[#2f4f4f] text-lg font-bold font-['Karla'] leading-[30.60px]">
//             Create Test
//           </div>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BatchTestCreation;