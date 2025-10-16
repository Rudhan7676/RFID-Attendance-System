import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';

export default function AttendanceTab() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await axios.get(`http://localhost:5000/api/teacher/attendance?date=${dateStr}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      setAttendanceData(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch attendance data');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async (studentId, status) => {
    try {
      const token = localStorage.getItem('token');
      const dateStr = selectedDate.toISOString().split('T')[0];
      await axios.post('http://localhost:5000/api/teacher/mark-attendance', {
        studentId,
        date: dateStr,
        status
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      toast.success(`Marked ${status.toLowerCase()} successfully`);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update attendance');
    }
  };

  const presentCount = useMemo(() => attendanceData.filter(s => s.status === 'Present').length, [attendanceData]);
  const absentCount = useMemo(() => attendanceData.filter(s => s.status === 'Absent').length, [attendanceData]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-gray-600 mt-1">View and manage student attendance</p>
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            dateFormat="yyyy-MM-dd"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-800">{attendanceData.length}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Present</p>
              <p className="text-2xl font-bold text-green-800">{presentCount}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Absent</p>
              <p className="text-2xl font-bold text-red-800">{absentCount}</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading attendance...</p>
        </div>
      ) : attendanceData.length === 0 ? (
        <div className="py-16 text-center text-gray-600">
          <div className="text-4xl mb-3">🗓️</div>
          <p className="text-lg">No attendance data for this date.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.roll_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'Present' ? 'bg-green-100 text-green-800' :
                      student.status === 'Absent' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {student.status || 'Not Marked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMark(student.id, 'Present')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition"
                        aria-label={`Mark ${student.name} present`}
                      >
                        Mark Present
                      </button>
                      <button
                        onClick={() => handleMark(student.id, 'Absent')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition"
                        aria-label={`Mark ${student.name} absent`}
                      >
                        Mark Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


