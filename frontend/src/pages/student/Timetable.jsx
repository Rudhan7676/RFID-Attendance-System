import React from 'react';

export default function Timetable() {
  const timetable = {
    'Monday': ['Mathematics', 'Science', 'English', 'History', 'Physical Education'],
    'Tuesday': ['English', 'Mathematics', 'Geography', 'Science', 'Art'],
    'Wednesday': ['Science', 'English', 'Mathematics', 'Computer Science', 'Music'],
    'Thursday': ['History', 'Mathematics', 'Science', 'English', 'Library'],
    'Friday': ['English', 'Science', 'Mathematics', 'Geography', 'Sports'],
    'Saturday': ['Mathematics', 'English', 'Science', 'Project Work', 'Free Period']
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Class Timetable</h2>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>
          <p className="text-gray-600 mt-1">Your class timetable for the current semester</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(timetable).map(([day, subjects]) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-center bg-blue-50 py-2 rounded">
                  {day}
                </h4>
                <div className="space-y-2">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        {index + 1}. {subject}
                      </span>
                      <span className="text-xs text-gray-500">
                        {9 + index}:00 - {10 + index}:00
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
