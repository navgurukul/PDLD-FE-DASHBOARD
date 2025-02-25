// File: components/BatchTestCreation/GradeSelector.js
import React from 'react';

const GradeSelector = ({ selectedGrades, handleGradeSelection }) => {
  return (
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
        <div className="text-[#483d8b] text-sm font-normal font-['Work Sans'] leading-normal">
          Relevant subjects will appear for each selected class
        </div>
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
              className="text-[#2f4f4f]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradeSelector;