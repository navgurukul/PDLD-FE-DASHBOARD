// File: components/BatchTestCreation/TestDateSettings.js
import React from 'react';

const TestDateSettings = ({ selectedGrades, selectedSubjects, testDates, handleDateSelection }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Set Test Date and Max Score</h2>
      <div className="space-y-6">
        {selectedGrades.map(grade => {
          const subjects = selectedSubjects[grade] || [];
          if (subjects.length === 0) return null;

          return (
            <div key={grade} className="space-y-2">
              <h3 className="font-medium text-gray-700">Class {grade}</h3>
              <div className="p-4 rounded-lg space-y-2">
                {subjects.map(subject => (
                  <div key={`${grade}-${subject}`} className="flex items-center space-x-4 p-2 bg-white rounded-lg">
                    <span className="w-48 text-gray-700">{subject}</span>
                    <div className="flex-1 mr-6">
                      <input
                        type="date"
                        className="w-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
  );
};

export default TestDateSettings;