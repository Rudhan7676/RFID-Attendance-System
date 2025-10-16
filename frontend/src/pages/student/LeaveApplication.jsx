import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';

export default function LeaveApplication() {
  const { studentId } = useOutletContext();
  const [leaveForm, setLeaveForm] = useState({
    startDate: null,
    endDate: null,
    reason: ''
  });
  const [leaveDocument, setLeaveDocument] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason.trim()) {
      setMessage('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (leaveForm.startDate > leaveForm.endDate) {
      setMessage('Start date cannot be after end date');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('studentId', studentId);
      formData.append('startDate', leaveForm.startDate.toISOString().split('T')[0]);
      formData.append('endDate', leaveForm.endDate.toISOString().split('T')[0]);
      formData.append('reason', leaveForm.reason);
      
      if (leaveDocument) {
        formData.append('document', leaveDocument);
      }

      await axios.post('http://localhost:5000/api/student/apply-leave', formData);

      setMessage('Leave application submitted successfully!');
      setLeaveForm({ startDate: null, endDate: null, reason: '' });
      setLeaveDocument(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Apply for Leave</h2>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Leave Application Form</h3>
          <p className="text-gray-600 mt-1">Submit a leave application with supporting documents</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleLeaveSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <DatePicker
                  selected={leaveForm.startDate}
                  onChange={(date) => setLeaveForm({ ...leaveForm, startDate: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Select start date"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <DatePicker
                  selected={leaveForm.endDate}
                  onChange={(date) => setLeaveForm({ ...leaveForm, endDate: date })}
                  dateFormat="yyyy-MM-dd"
                  minDate={leaveForm.startDate || new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholderText="Select end date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter reason for leave"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Document (Optional)
              </label>
              <input
                type="file"
                onChange={(e) => setLeaveDocument(e.target.files[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successfully')
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              {loading ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
