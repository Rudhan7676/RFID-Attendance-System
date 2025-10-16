import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export default function Attendance() {
  const { studentId } = useOutletContext();
  const [attendance, setAttendance] = useState([]);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [studentId]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/attendance/${studentId}`);
      setAttendance(response.data.records);
      setAttendancePercentage(response.data.attendancePercentage);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Overall Attendance</p>
          <p className={`text-2xl font-bold ${
            attendancePercentage >= 80 ? 'text-green-600' :
            attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {attendancePercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {attendance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records found</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-green-800">Present</p>
                    <p className="text-sm text-green-600">{formatDate(record.timestamp)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">{formatTime(record.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
