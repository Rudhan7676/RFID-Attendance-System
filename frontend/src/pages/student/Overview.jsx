import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export default function Overview() {
  const { studentId } = useOutletContext();
  const [summaryData, setSummaryData] = useState({
    attendancePercentage: 0,
    academicPerformance: 0,
    recentAttendance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryData();
  }, [studentId]);

  const fetchSummaryData = async () => {
    try {
      const response = await axios.get(`/api/student/dashboard-summary/${studentId}`);
      setSummaryData(response.data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Overall Attendance</h3>
              <p className={`text-3xl font-bold ${
                summaryData.attendancePercentage >= 80 ? 'text-green-600' :
                summaryData.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {summaryData.attendancePercentage}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Academic Performance</h3>
              <p className={`text-3xl font-bold ${
                summaryData.academicPerformance >= 80 ? 'text-green-600' :
                summaryData.academicPerformance >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {summaryData.academicPerformance}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Attendance</h3>
        </div>
        <div className="p-6">
          {summaryData.recentAttendance.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent attendance records</p>
          ) : (
            <div className="space-y-3">
              {summaryData.recentAttendance.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-3">✓</span>
                    <span className="font-medium text-green-800">Present</span>
                  </div>
                  <span className="text-sm text-green-600">{formatDate(record.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
