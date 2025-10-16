import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import KioskPage from './pages/KioskPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Overview from './pages/student/Overview';
import Attendance from './pages/student/Attendance';
import Marks from './pages/student/Marks';
import LeaveApplication from './pages/student/LeaveApplication';
import Timetable from './pages/student/Timetable';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<KioskPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student/dashboard" element={<StudentDashboard />}>
            <Route index element={<Overview />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="marks" element={<Marks />} />
            <Route path="leave" element={<LeaveApplication />} />
            <Route path="timetable" element={<Timetable />} />
          </Route>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

