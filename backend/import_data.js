const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'attendance.db');
const db = new sqlite3.Database(dbPath);

console.log('Importing data to database...');

// Read the export file
const exportFile = path.join(__dirname, '..', 'database_export.sql');
if (!fs.existsSync(exportFile)) {
    console.error('database_export.sql not found!');
    process.exit(1);
}

const sqlCommands = fs.readFileSync(exportFile, 'utf8').split(';\n').filter(cmd => cmd.trim());

console.log(`Found ${sqlCommands.length} SQL commands to execute`);

// Execute each command
let completed = 0;
sqlCommands.forEach((sql, index) => {
    if (sql.trim()) {
        db.run(sql, (err) => {
            if (err) {
                console.error(`Error executing command ${index + 1}:`, err.message);
            } else {
                completed++;
                if (completed === sqlCommands.length) {
                    console.log('Data import completed successfully!');
                    db.close();
                }
            }
        });
    }
});