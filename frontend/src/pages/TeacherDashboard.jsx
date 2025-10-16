import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';
import toast, { Toaster } from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';
import AttendanceTab from './teacher/AttendanceTab';

// ==========================================================
// Main Teacher Dashboard Component
// ==========================================================
export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const userObj = JSON.parse(userData);
    setUser(userObj);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: '📊' },
    { id: 'attendance', name: 'Attendance Management', icon: '📅' },
    { id: 'leave', name: 'Leave Requests', icon: '📝' },
    { id: 'grades', name: 'Grades & Performance', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">👨‍🏫</span>
                Welcome, {user.name}!
              </h1>
              <p className="text-gray-600">Teacher Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center"
              aria-label="Logout"
            >
              <span className="mr-2">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-label={`Switch to ${tab.name} tab`}
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-lg">{tab.icon}</span>
                    {tab.name}
                    {tab.id === 'leave' && <LeaveCounter />}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          </div>

        {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'dashboard' && <DashboardOverview user={user} />}
          {activeTab === 'attendance' && <AttendanceTab />}
          {activeTab === 'leave' && <LeaveRequests user={user} />}
          {activeTab === 'grades' && <GradesPerformance user={user} />}
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// Tab Components
// ==========================================================

function DashboardOverview({ user }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
    averageGrade: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const dateStr = new Date().toISOString().split('T')[0];
    try {
      const [attendanceRes, leavesRes, gradesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/teacher/attendance?date=${dateStr}`),
        axios.get('http://localhost:5000/api/teacher/leaves'),
        axios.get('http://localhost:5000/api/teacher/grades')
      ]);

      const attendanceData = attendanceRes.data;
      const presentCount = attendanceData.filter(s => s.status === 'Present').length;
      const absentCount = attendanceData.filter(s => s.status === 'Absent').length;
      const pendingLeaves = leavesRes.data.filter(l => l.status === 'Pending').length;
      
      const grades = gradesRes.data;
      const avgGrade = grades.length > 0 ? (grades.reduce((acc, g) => acc + g.score, 0) / grades.length).toFixed(1) : 0;

      setStats({
        totalStudents: attendanceData.length,
        presentToday: presentCount,
        absentToday: absentCount,
        pendingLeaves,
        averageGrade: avgGrade
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: '👥',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: '✅',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: '❌',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: '📝',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Average Grade',
      value: `${stats.averageGrade}%`,
      icon: '📊',
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200`}>
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              <div className="text-4xl">{card.icon}</div>
              </div>
            </div>
        ))}
              </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-xl text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
          <p className="text-lg opacity-90">Manage your classroom efficiently with these quick access tools</p>
                </div>
                            </div>
                </div>
  );
}

// Attendance tab moved to separate component: './teacher/AttendanceTab'

function LeaveRequests({ user }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
    }
  }, [user]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/teacher/leaves');
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await axios.post('http://localhost:5000/api/teacher/handle-leave', {
        leaveId,
        status
      });

      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      fetchLeaveRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave request');
    }
  };

  const pendingCount = leaveRequests.filter(l => l.status === 'Pending').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
        {pendingCount > 0 && (
          <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {pendingCount} Pending
          </span>
              )}
            </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading leave requests...</p>
          </div>
      ) : leaveRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-lg">No pending leave requests</p>
            </div>
              ) : (
                <div className="space-y-4 max-h-[30rem] overflow-y-auto">
                  {leaveRequests.map((leave) => (
            <div key={leave.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{leave.studentName}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  leave.status === 'Pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : leave.status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                          {leave.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <p><strong>Dates:</strong> {leave.startDate} to {leave.endDate}</p>
                        <p><strong>Reason:</strong> {leave.reason}</p>
                        {leave.document_url && (
                          <p className="mt-2">
                            <a
                              href={`http://localhost:5000/uploads/${leave.document_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                      📄 View Document
                            </a>
                          </p>
                        )}
                      </div>
              {leave.status === 'Pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'Approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                    aria-label={`Approve leave request from ${leave.studentName}`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, 'Rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                    aria-label={`Reject leave request from ${leave.studentName}`}
                        >
                          Reject
                        </button>
                      </div>
              )}
                    </div>
                  ))}
                </div>
              )}
            </div>
  );
}

function GradesPerformance({ user }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const subjects = ['Punjabi', 'English', 'Math', 'Science', 'Social Science'];

  useEffect(() => {
    if (user) {
      fetchGrades();
    }
  }, [user]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/teacher/grades');
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !subjectFilter || grade.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await axios.post('http://localhost:5000/api/teacher/upload-grades', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Grades uploaded successfully!');
      setShowUploadModal(false);
      setUploadFile(null);
      fetchGrades();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload grades');
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { roll_number: 'A001', subject: 'Math', score: '85' },
      { roll_number: 'A002', subject: 'English', score: '92' }
    ];
    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'grades_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Template downloaded!');
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Grades & Performance</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
        >
          <span className="mr-2">📤</span>
          Upload Grades
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Student
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or roll number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Subject
          </label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading grades...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-4">📚</div>
                    <p className="text-lg">No grades found</p>
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grade.roll_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.score}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        grade.score >= 90 ? 'bg-green-100 text-green-800' :
                        grade.score >= 80 ? 'bg-blue-100 text-blue-800' :
                        grade.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {grade.score >= 90 ? 'A+' :
                         grade.score >= 80 ? 'A' :
                         grade.score >= 70 ? 'B' :
                         grade.score >= 60 ? 'C' : 'F'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Grades</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Download the CSV template to see the required format:
                </p>
                <button
                  onClick={downloadTemplate}
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  📥 Download Template
                </button>
              </div>

              <form onSubmit={handleFileUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Upload
                  </button>
                </div>
              </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// ==========================================================
// Helper Components
// ==========================================================

function LeaveCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teacher/leaves');
        const pendingCount = response.data.filter(l => l.status === 'Pending').length;
        setCount(pendingCount);
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };
    fetchPendingCount();
  }, []);

  if (count === 0) return null;

  return (
    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
      {count}
    </span>
  );
}
