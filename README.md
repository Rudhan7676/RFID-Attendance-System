# RFID-Based School Attendance System

A complete full-stack attendance management system built with Node.js, Express, SQLite, React, and Tailwind CSS.

## Features

### Backend (Node.js + Express + SQLite)
- **RFID Attendance Marking**: Mark attendance using RFID UID
- **User Authentication**: Login system for students and teachers
- **Student Features**: View attendance records, apply for leave
- **Teacher Features**: View attendance overview, manage leave requests, export data to CSV
- **Database Management**: SQLite database with proper schema and sample data

### Frontend (React + Vite + Tailwind CSS)
- **Kiosk Interface**: Full-screen RFID scanning interface
- **Login System**: Role-based authentication (Student/Teacher)
- **Student Dashboard**: Attendance history and leave application
- **Teacher Dashboard**: Attendance overview and leave management
- **Responsive Design**: Modern, professional UI with Tailwind CSS

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite3, CORS
- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios
- **Additional Libraries**: React DatePicker, PapaParse (CSV export)

## Project Structure

```
AttendanceProject/
├── backend/
│   ├── server.js          # Express server with all API endpoints
│   ├── package.json       # Backend dependencies
│   └── attendance.db      # SQLite database (created automatically)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── KioskPage.jsx        # RFID scanning interface
│   │   │   ├── LoginPage.jsx        # User authentication
│   │   │   ├── StudentDashboard.jsx # Student features
│   │   │   └── TeacherDashboard.jsx # Teacher features
│   │   ├── App.jsx        # Main router component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind CSS imports
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

   The server will start on `http://localhost:5000` and automatically create the SQLite database with sample data.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`

## Usage

### Demo Credentials

**Students:**
- Roll Numbers: ST001, ST002, ST003, ST004, ST005
- Password: password123

**Teachers:**
- Usernames: teacher1, teacher2
- Password: teacher123

**RFID UIDs for Testing:**
- RFID001, RFID002, RFID003, RFID004, RFID005

### How to Use

1. **RFID Kiosk** (`/kiosk`): 
   - Enter RFID UID manually or scan RFID card
   - System will mark attendance if valid and not already marked today

2. **Student Login** (`/login`):
   - Select "Student" role
   - Use roll number as username
   - View attendance history and apply for leave

3. **Teacher Login** (`/login`):
   - Select "Teacher" role
   - Use teacher username
   - View attendance overview, manage leave requests, export data

## API Endpoints

### Authentication
- `POST /api/login` - User login (students and teachers)

### Attendance
- `POST /api/mark-attendance` - Mark attendance using RFID UID
- `GET /api/student/attendance/:studentId` - Get student attendance records
- `GET /api/teacher/attendance?date=YYYY-MM-DD` - Get attendance overview for a date

### Leave Management
- `POST /api/student/apply-leave` - Submit leave application
- `GET /api/teacher/leaves` - Get pending leave requests
- `POST /api/teacher/handle-leave` - Approve/reject leave requests

## Database Schema

### Students Table
- id, name, roll_number, rfid_uid, password, created_at

### Teachers Table
- id, name, username, password, created_at

### AttendanceRecords Table
- id, student_id, timestamp, date

### LeaveRequests Table
- id, student_id, start_date, end_date, reason, status, created_at

## Features in Detail

### RFID Attendance System
- Prevents duplicate attendance marking for the same day
- Provides clear success/error messages
- Auto-focuses input for continuous scanning

### Student Dashboard
- View personal attendance history
- Apply for leave with date picker
- Real-time form validation

### Teacher Dashboard
- Date-based attendance overview
- CSV export functionality
- Leave request management with approve/reject actions
- Responsive table design

### Security Features
- Password-based authentication
- Role-based access control
- Input validation and sanitization

## Development

### Running in Development Mode

1. Start the backend server:
   ```bash
   cd backend && node server.js
   ```

2. Start the frontend development server:
   ```bash
   cd frontend && npm run dev
   ```

### Building for Production

1. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```

2. The built files will be in `frontend/dist/`

## Troubleshooting

- Ensure both backend and frontend servers are running
- Check that the database file is created in the backend directory
- Verify that all dependencies are installed correctly
- Check browser console for any JavaScript errors

## License

This project is licensed under the ISC License.
