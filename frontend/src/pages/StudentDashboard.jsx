// FINAL POLISHED StudentDashboard.jsx with complete features

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// ==========================================================
// Main Dashboard Layout Component (The Parent)
// ==========================================================
export default function StudentDashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };
    
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userName={user.name} onLogout={handleLogout} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Routes>
                        <Route index element={<Overview user={user} />} />
                        <Route path="attendance" element={<Attendance user={user} />} />
                        <Route path="marks" element={<Marks user={user} />} />
                        <Route path="leave" element={<LeaveApplication user={user} />} />
                        <Route path="timetable" element={<Timetable />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

// ==========================================================
// Child Page Components (Defined in the same file)
// ==========================================================

function Sidebar() {
    const location = useLocation();
    const navLinks = [
        { path: '/student/dashboard', name: 'Overview', icon: '📊' },
        { path: '/student/dashboard/attendance', name: 'Attendance', icon: '📅' },
        { path: '/student/dashboard/marks', name: 'Marks', icon: '📚' },
        { path: '/student/dashboard/leave', name: 'Apply for Leave', icon: '📝' },
        { path: '/student/dashboard/timetable', name: 'Timetable', icon: '⏰' },
    ];

    return (
        <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-blue-600 flex items-center">
                    <span className="mr-2">🎓</span>
                    Student Portal
                </h2>
            </div>
            <nav className="mt-6">
                {navLinks.map(link => (
                    <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center py-3 px-6 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ${
                            location.pathname === link.path 
                                ? 'bg-blue-100 text-blue-700 font-bold border-r-4 border-blue-600' 
                                : 'hover:border-r-4 hover:border-blue-300'
                        }`}
                    >
                        <span className="mr-3 text-lg">{link.icon}</span>
                        {link.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

function Header({ userName, onLogout }) {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2">👋</span>
                Welcome, {userName}!
            </h1>
            <button 
                onClick={onLogout} 
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center"
            >
                <span className="mr-2">🚪</span>
                Logout
            </button>
        </header>
    );
}

function Overview({ user }) {
    const [summary, setSummary] = useState(null);
    const [motivationalQuote, setMotivationalQuote] = useState('');

    const quotes = [
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Education is the passport to the future, for tomorrow belongs to those who prepare for it today. - Malcolm X",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "The only way to do great work is to love what you do. - Steve Jobs"
    ];

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get(`/api/student/dashboard-summary/${user.id}`);
                setSummary(res.data);
            } catch (error) {
                console.error("Failed to fetch summary", error);
            }
        };
        if (user) fetchSummary();
        
        // Set a random motivational quote
        setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, [user]);

    if (!summary) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Overview</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">Overall Attendance</h3>
                            <p className="text-4xl font-bold text-blue-600">{summary.attendancePercentage}%</p>
                        </div>
                        <div className="text-4xl">📅</div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">Academic Performance</h3>
                            <p className="text-4xl font-bold text-green-600">{summary.academicPerformance}%</p>
                        </div>
                        <div className="text-4xl">📚</div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
        <div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">Current Streak</h3>
                            <p className="text-4xl font-bold text-purple-600">7 days</p>
                        </div>
                        <div className="text-4xl">🔥</div>
                    </div>
                </div>
                </div>

            {/* Motivational Quote Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-xl shadow-lg text-white">
                <div className="text-center">
                    <div className="text-4xl mb-4">💡</div>
                    <h3 className="text-xl font-semibold mb-4">Daily Inspiration</h3>
                    <blockquote className="text-lg italic leading-relaxed">
                        "{motivationalQuote}"
                    </blockquote>
                </div>
            </div>
        </div>
    );
}

function Attendance({ user }) {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await axios.get(`/api/student/attendance/${user.id}`);
                setRecords(res.data);
            } catch (error) {
                console.error("Failed to fetch attendance records", error);
            }
        };
        if (user) fetchAttendance();
    }, [user]);
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📅</span>
                Attendance History
            </h2>
            <div className="space-y-3">
                {records.length > 0 ? records.map(rec => (
                    <div key={rec.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center">
                            <span className="text-lg mr-3">✅</span>
                            <span className="text-gray-700">
                                {new Date(rec.timestamp).toLocaleDateString('en-IN', { 
                                    timeZone: 'Asia/Kolkata',
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <span className="font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">Present</span>
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-4">📝</div>
                        <p>No attendance records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Marks({ user }) {
    const [marks, setMarks] = useState([]);

    useEffect(() => {
        const fetchMarks = async () => {
            try {
                const res = await axios.get(`/api/student/marks/${user.id}`);
                setMarks(res.data);
            } catch (error) {
                console.error("Failed to fetch marks", error);
            }
        };
        if (user) fetchMarks();
    }, [user]);

    const overall = marks.length > 0 ? (marks.reduce((acc, m) => acc + m.score, 0) / marks.length).toFixed(1) : 0;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <span className="mr-3">📚</span>
                    Academic Performance
                </h2>
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">Overall: {overall}%</p>
                </div>
            </div>
            <div className="h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marks}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }} 
                        />
                        <Legend />
                        <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function LeaveApplication({ user }) {
    const [formData, setFormData] = useState({
        startDate: null,
        endDate: null,
        reason: '',
        document: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('studentId', user.id);
            formDataToSend.append('startDate', formData.startDate.toISOString());
            formDataToSend.append('endDate', formData.endDate.toISOString());
            formDataToSend.append('reason', formData.reason);
            if (formData.document) {
                formDataToSend.append('document', formData.document);
            }

            const response = await axios.post('/api/student/apply-leave', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ type: 'success', text: 'Leave application submitted successfully!' });
            setFormData({
                startDate: null,
                endDate: null,
                reason: '',
                document: null
            });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to submit leave application' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📝</span>
                Apply for Leave
            </h2>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-red-100 text-red-700 border border-red-300'
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date *
                        </label>
                        <DatePicker
                            selected={formData.startDate}
                            onChange={(date) => handleDateChange(date, 'startDate')}
                            dateFormat="dd/MM/yyyy"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholderText="Select start date"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date *
                        </label>
                        <DatePicker
                            selected={formData.endDate}
                            onChange={(date) => handleDateChange(date, 'endDate')}
                            dateFormat="dd/MM/yyyy"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholderText="Select end date"
                            minDate={formData.startDate}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Reason for Leave *
                    </label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="4"
                        placeholder="Please provide a detailed reason for your leave application..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Supporting Document (Optional)
                    </label>
                    <input
                        type="file"
                        name="document"
                        onChange={handleInputChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
                            isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Submitting...
                            </span>
                        ) : (
                            'Submit Application'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Timetable() {
    const timeSlots = [
        { time: '8:00 AM - 9:00 AM', monday: 'Punjabi', tuesday: 'English', wednesday: 'Math', thursday: 'Science', friday: 'Social Science' },
        { time: '9:00 AM - 10:00 AM', monday: 'English', tuesday: 'Math', wednesday: 'Science', thursday: 'Social Science', friday: 'Punjabi' },
        { time: '10:00 AM - 11:00 AM', monday: 'Math', tuesday: 'Science', wednesday: 'Social Science', thursday: 'Punjabi', friday: 'English' },
        { time: '11:00 AM - 12:00 PM', monday: 'Lunch Break', tuesday: 'Lunch Break', wednesday: 'Lunch Break', thursday: 'Lunch Break', friday: 'Lunch Break' },
        { time: '12:00 PM - 1:00 PM', monday: 'Science', tuesday: 'Social Science', wednesday: 'Punjabi', thursday: 'English', friday: 'Math' },
        { time: '1:00 PM - 2:00 PM', monday: 'Social Science', tuesday: 'Punjabi', wednesday: 'English', thursday: 'Math', friday: 'Science' }
    ];

    const getSubjectColor = (subject) => {
        const colors = {
            'Punjabi': 'bg-red-100 text-red-800',
            'English': 'bg-blue-100 text-blue-800',
            'Math': 'bg-green-100 text-green-800',
            'Science': 'bg-purple-100 text-purple-800',
            'Social Science': 'bg-yellow-100 text-yellow-800',
            'Lunch Break': 'bg-gray-200 text-gray-600'
        };
        return colors[subject] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">⏰</span>
                Weekly Timetable
            </h2>
            
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Monday</th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Tuesday</th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Wednesday</th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Thursday</th>
                            <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">Friday</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                                    {slot.time}
                                </td>
                                <td className="border border-gray-300 px-4 py-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(slot.monday)}`}>
                                        {slot.monday}
                                    </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(slot.tuesday)}`}>
                                        {slot.tuesday}
                                    </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(slot.wednesday)}`}>
                                        {slot.wednesday}
                                    </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(slot.thursday)}`}>
                                        {slot.thursday}
                                    </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(slot.friday)}`}>
                                        {slot.friday}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Subject Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Punjabi', 'English', 'Math', 'Science', 'Social Science'].map(subject => (
                        <div key={subject} className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium mr-2 ${getSubjectColor(subject)}`}>
                                {subject}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}