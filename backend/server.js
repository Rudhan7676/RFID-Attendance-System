// FINAL CORRECTED server.js file -- REWRITTEN WITH ASYNC/AWAIT

// 1. Import Libraries
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// 2. Setup the Express App
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dir = './public/uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

// 4. Use Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 5. Connect to the SQLite Database
const dbPath = path.join(__dirname, 'attendance.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("CRITICAL: Error opening database:", err.message);
    } else {
        console.log("Successfully connected to the database.");
    }
});

// ==========================================================
// API ROUTES
// ==========================================================

// KIOSK ENDPOINT
app.post('/api/mark-attendance', (req, res) => {
    const { rfid_uid } = req.body;
    if (!rfid_uid) return res.status(400).json({ message: 'RFID UID is required' });

    const sql = `SELECT id, name, photo_url AS photoUrl FROM Students WHERE rfid_uid = ?`;
    db.get(sql, [rfid_uid], (err, student) => {
        if (err) return res.status(500).json({ message: 'Database error finding student' });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const today_date = new Date().toISOString().slice(0, 10);
        db.get("SELECT * FROM AttendanceRecords WHERE student_id = ? AND date(timestamp) = ?", [student.id, today_date], (err, record) => {
            if (err) return res.status(500).json({ message: 'Database error checking records' });
            if (record) return res.status(409).json({ message: 'Attendance already marked for today' });

            db.run("INSERT INTO AttendanceRecords (student_id, timestamp) VALUES (?, ?)", [student.id, new Date().toISOString()], function(err) {
                if (err) return res.status(500).json({ message: 'Database error inserting record' });
                res.status(200).json({
                    message: `Welcome, ${student.name}! Attendance marked.`,
                    photoUrl: student.photoUrl
                });
            });
        });
    });
});

// LOGIN ENDPOINT
app.post('/api/login', (req, res) => {
    const { role, username, password } = req.body;
    let table = '', userField = '';

    if (role === 'student') { table = 'Students'; userField = 'roll_number'; } 
    else if (role === 'teacher') { table = 'Teachers'; userField = 'username'; } 
    else { return res.status(400).json({ message: 'Invalid role' }); }

    const sql = `SELECT id, name FROM ${table} WHERE ${userField} = ? AND password = ?`;
    db.get(sql, [username, password], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        res.status(200).json({ message: 'Login successful', user: { ...user, role } });
    });
});

// STUDENT DASHBOARD ENDPOINTS

// --- THIS IS THE CORRECTED SUMMARY ENDPOINT ---
app.get('/api/student/dashboard-summary/:studentId', async (req, res) => {
    const { studentId } = req.params;
    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    // Helper function to make db.all work with async/await
    const dbAll = (sql, params) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    try {
        const attendanceQuery = "SELECT timestamp FROM AttendanceRecords WHERE student_id = ? ORDER BY timestamp DESC";
        const marksQuery = "SELECT score FROM Marks WHERE student_id = ?";
        
        // Run both database queries at the same time
        const [allAttendanceRecords, marks] = await Promise.all([
            dbAll(attendanceQuery, [studentId]),
            dbAll(marksQuery, [studentId])
        ]);

        // Calculate Attendance Percentage
        let attendancePercentage = 0;
        if (allAttendanceRecords.length > 0) {
            const presentDays = allAttendanceRecords.length;
            const firstDay = new Date(allAttendanceRecords[allAttendanceRecords.length - 1].timestamp);
            const today = new Date();
            const totalDays = Math.ceil((today - firstDay) / (1000 * 60 * 60 * 24)) || 1;
            attendancePercentage = (presentDays / totalDays) * 100;
        }

        // Calculate Academic Performance
        let academicPerformance = 0;
        if (marks.length > 0) {
            const totalScore = marks.reduce((sum, mark) => sum + mark.score, 0);
            academicPerformance = totalScore / marks.length;
        }

        // Send the final response
        res.status(200).json({
            attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
            academicPerformance: parseFloat(academicPerformance.toFixed(1)),
            recentAttendance: allAttendanceRecords.slice(0, 3)
        });

    } catch (err) {
        console.error("DATABASE ERROR in summary endpoint:", err.message);
        res.status(500).json({ message: `Database error: ${err.message}` });
    }
});


app.get('/api/student/attendance/:studentId', (req, res) => {
    const { studentId } = req.params;
    db.all('SELECT * FROM AttendanceRecords WHERE student_id = ? ORDER BY timestamp DESC', [studentId], (err, records) => {
        if (err) return res.status(500).json({ message: 'Database error fetching attendance' });
        res.status(200).json(records);
    });
});

app.get('/api/student/marks/:studentId', (req, res) => {
    const { studentId } = req.params;
    db.all('SELECT * FROM Marks WHERE student_id = ? ORDER BY exam_date DESC', [studentId], (err, marks) => {
        if (err) return res.status(500).json({ message: 'Database error fetching marks' });
        res.status(200).json(marks);
    });
});

app.post('/api/student/apply-leave', upload.single('document'), (req, res) => {
    const { studentId, startDate, endDate, reason } = req.body;
    if (!studentId || !startDate || !endDate || !reason) return res.status(400).json({ message: 'All fields are required' });
    
    const documentUrl = req.file ? req.file.filename : null;
    const sql = 'INSERT INTO LeaveRequests (student_id, start_date, end_date, reason, document_url) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [studentId, startDate, endDate, reason, documentUrl], function(err) {
        if (err) return res.status(500).json({ message: 'Database error creating leave request' });
        res.status(201).json({ message: 'Leave application submitted successfully.' });
    });
});

// TEACHER DASHBOARD ENDPOINTS
app.get('/api/teacher/attendance', (req, res) => {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    db.all('SELECT id, name, roll_number FROM Students ORDER BY roll_number', (err, students) => {
        if (err) return res.status(500).json({ message: 'Database error fetching students' });
        db.all('SELECT student_id FROM AttendanceRecords WHERE date(timestamp) = ?', [targetDate], (err2, records) => {
            if (err2) return res.status(500).json({ message: 'Database error fetching attendance' });
            const presentSet = new Set(records.map(r => r.student_id));
            const result = students.map(s => ({ ...s, status: presentSet.has(s.id) ? 'Present' : 'Absent' }));
            res.status(200).json(result);
        });
    });
});

app.get('/api/teacher/leaves', (req, res) => {
    const sql = `
        SELECT lr.id, s.name AS studentName, lr.start_date AS startDate, lr.end_date AS endDate, 
               lr.reason, lr.status, lr.document_url
        FROM LeaveRequests lr JOIN Students s ON s.id = lr.student_id
        WHERE lr.status = 'Pending' ORDER BY lr.id DESC
    `;
    db.all(sql, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error fetching leaves' });
        res.status(200).json(rows);
    });
});

app.post('/api/teacher/handle-leave', (req, res) => {
    const { leaveId, status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    db.run('UPDATE LeaveRequests SET status = ? WHERE id = ?', [status, leaveId], function(err) {
        if (err) return res.status(500).json({ message: 'Database error updating leave' });
        if (this.changes === 0) return res.status(404).json({ message: 'Leave request not found' });
        res.status(200).json({ message: 'Leave status updated successfully.' });
    });
});

app.post('/api/teacher/manual-attendance', (req, res) => {
    const { studentId, date, status } = req.body;
    if (status === 'Present') {
        db.run('INSERT INTO AttendanceRecords (student_id, timestamp) VALUES (?, ?)', [studentId, `${date} 09:00:00`], (err) => {
            if (err) return res.status(500).json({ message: 'Error marking present' });
            res.status(200).json({ message: 'Marked as Present' });
        });
    } else { // Absent
        db.run('DELETE FROM AttendanceRecords WHERE student_id = ? AND date(timestamp) = ?', [studentId, date], (err) => {
            if (err) return res.status(500).json({ message: 'Error marking absent' });
            res.status(200).json({ message: 'Marked as Absent' });
        });
    }
});

// Unified mark-attendance endpoint used by frontend (UPSERT-style behavior for SQLite schema)
// For this schema, "Present" is represented by inserting a record for the given date,
// and "Absent" is represented by deleting any existing record for that date.
app.post('/api/teacher/mark-attendance', (req, res) => {
    const { studentId, date, status } = req.body;
    if (!studentId || !date || !status) {
        return res.status(400).json({ message: 'Missing required fields: studentId, date, or status' });
    }

    if (status === 'Present') {
        // Insert if not exists (avoid duplicate for same day)
        const isoTs = `${date} 09:00:00`;
        const checkSql = 'SELECT id FROM AttendanceRecords WHERE student_id = ? AND date(timestamp) = ?';
        db.get(checkSql, [studentId, date], (err, row) => {
            if (err) return res.status(500).json({ message: 'Database error checking attendance' });
            if (row) return res.status(200).json({ message: 'Attendance already marked as Present' });
            db.run('INSERT INTO AttendanceRecords (student_id, timestamp) VALUES (?, ?)', [studentId, isoTs], (insErr) => {
                if (insErr) return res.status(500).json({ message: 'Error marking present' });
                res.status(200).json({ message: 'Attendance updated successfully' });
            });
        });
    } else if (status === 'Absent') {
        db.run('DELETE FROM AttendanceRecords WHERE student_id = ? AND date(timestamp) = ?', [studentId, date], (delErr) => {
            if (delErr) return res.status(500).json({ message: 'Error marking absent' });
            res.status(200).json({ message: 'Attendance updated successfully' });
        });
    } else {
        res.status(400).json({ message: 'Invalid status. Must be Present or Absent.' });
    }
});

// ===============================================
// Teacher Grades: GET (filterable) and POST (insert)
// ===============================================
// GET /api/teacher/grades?studentId=&subject=&roll_number=
app.get('/api/teacher/grades', (req, res) => {
    const { studentId, subject, roll_number } = req.query;

    const params = [];
    const conditions = [];

    let sql = `
        SELECT m.id, s.id AS studentId, s.name AS studentName, s.roll_number, m.subject, m.score, m.exam_date
        FROM Marks m
        JOIN Students s ON s.id = m.student_id
    `;

    if (studentId) {
        conditions.push('m.student_id = ?');
        params.push(studentId);
    }
    if (subject) {
        conditions.push('m.subject = ?');
        params.push(subject);
    }
    if (roll_number) {
        conditions.push('s.roll_number = ?');
        params.push(roll_number);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY m.exam_date DESC, s.roll_number ASC';

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error fetching grades' });
        res.status(200).json(rows);
    });
});

// POST /api/teacher/grades { studentId, subject, score, examDate? }
app.post('/api/teacher/grades', (req, res) => {
    const { studentId, subject, score, examDate } = req.body;

    if (!studentId || !subject || typeof score !== 'number') {
        return res.status(400).json({ message: 'Missing required fields: studentId, subject, numeric score' });
    }

    const dateToUse = examDate || new Date().toISOString().slice(0, 10);
    const insertSql = `INSERT INTO Marks (student_id, subject, score, exam_date) VALUES (?, ?, ?, ?)`;
    db.run(insertSql, [studentId, subject, score, dateToUse], function(err) {
        if (err) return res.status(500).json({ message: 'Database error inserting grade' });
        res.status(201).json({ id: this.lastID, message: 'Grade added successfully' });
    });
});

// GET /api/student/marks/:studentId
app.get('/api/student/marks/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    
    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const marksQuery = `
        SELECT subject, score, exam_date
        FROM Marks 
        WHERE student_id = ?
        ORDER BY subject, exam_date DESC
    `;
    
    db.all(marksQuery, [studentId], (err, marks) => {
        if (err) {
            return res.status(500).json({ message: 'Database error fetching marks' });
        }
        
        // Group marks by subject
        const marksBySubject = {};
        marks.forEach(mark => {
            if (!marksBySubject[mark.subject]) {
                marksBySubject[mark.subject] = [];
            }
            marksBySubject[mark.subject].push({
                score: mark.score,
                examDate: mark.exam_date
            });
        });
        
        res.status(200).json({
            marksBySubject: marksBySubject
        });
    });
});

// 6. Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});