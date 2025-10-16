import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const KioskPage = () => {
  const [rfidUid, setRfidUid] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Always clear any previously shown photo before a new scan begins
    setPhotoUrl('');
    
    if (!rfidUid.trim()) {
      showMessage('Please enter a valid RFID UID', 'error');
      return;
    }

    try {
      const response = await axios.post('/api/mark-attendance', {
        rfid_uid: rfidUid.trim()
      });

      showMessage(response.data.message, 'success');
      // Build a strict URL pointing to backend /images using the filename
      if (response.data?.photoUrl) {
        const filename = String(response.data.photoUrl).split('/').pop().replace(/^\/+/, '');
        const fullUrl = `/images/${filename}`;
        setPhotoUrl(fullUrl);
      }
      setRfidUid('');
      
      // Auto-hide success message and photo after 3 seconds
      setTimeout(() => {
        setMessage('');
        setPhotoUrl('');
      }, 3000);
      
      // Auto-focus input after successful submission
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      // Reset photo on error so previous student's image is hidden
      setPhotoUrl('');
      const errorMessage = error.response?.data?.message || 'An error occurred';
      showMessage(errorMessage, 'error');
      setRfidUid('');
      
      // Auto-focus input after error
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Scan Your ID Card
          </h1>
          <p className="text-gray-600 text-lg">
            Place your RFID card near the scanner or enter the UID manually
          </p>
        </div>

        {photoUrl && (
          <img
            src={photoUrl}
            alt="Student"
            className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-md border"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="rfid" className="block text-sm font-medium text-gray-700 mb-2">
              RFID UID
            </label>
            <input
              ref={inputRef}
              type="text"
              id="rfid"
              value={rfidUid}
              onChange={(e) => setRfidUid(e.target.value)}
              className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono tracking-wider"
              placeholder="Enter RFID UID..."
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 text-lg"
          >
            Mark Attendance
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-lg text-center text-lg font-medium ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact the administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default KioskPage;
