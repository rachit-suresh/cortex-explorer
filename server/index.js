const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Logging endpoint for CLI output
app.post("/log", (req, res) => {
  const { level, message, timestamp } = req.body;
  const logPrefix = `[${timestamp}] [${level.toUpperCase()}]`;

  // Output to server console (CLI)
  console.log(`${logPrefix} ${message}`);

  res.status(200).json({ success: true });
});

// Database setup
const dbPath = path.resolve(__dirname, "mindmap.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      parentId INTEGER,
      FOREIGN KEY(parentId) REFERENCES interests(id)
    )`);

    // Seed data if empty
    db.get("SELECT count(*) as count FROM interests", (err, row) => {
      if (row.count === 0) {
        console.log("Seeding database...");
        // Add seed data here if needed
      }
    });
  });
}

// Routes
app.get("/api/interests", (req, res) => {
  db.all("SELECT * FROM interests", [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.post("/api/interests", (req, res) => {
  const { name, category, parentId } = req.body;
  db.run(
    `INSERT INTO interests (name, category, parentId) VALUES (?, ?, ?)`,
    [name, category, parentId],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: { id: this.lastID, name, category, parentId },
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
