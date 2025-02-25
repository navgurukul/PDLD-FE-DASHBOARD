// File: components/BatchTestCreation/SubjectSelector.js
import React from 'react';

const SubjectSelector = ({ selectedGrades, selectedSubjects, handleSubjectSelection, subjectsByGrade }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Subject List - Class 1</h2>
      {selectedGrades.map(grade => (
        <div key={grade} className="p-4 rounded-lg">
          <h3 className="font-medium">Class {grade}</h3>
          <div className="flex flex-wrap gap-2">
            {subjectsByGrade[grade]?.map(subject => (
              <button
                key={subject}
                className={`px-3 py-1 rounded-lg border ${
                  selectedSubjects[grade]?.includes(subject)
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
  );
};

export default SubjectSelector;