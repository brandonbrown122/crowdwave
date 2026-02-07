/**
 * Database initialization
 * Using SQLite for simplicity
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'crowdwave.db');
let db = null;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function initDatabase() {
  const db = getDb();
  
  // Data Sources table
  db.exec(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      filename TEXT,
      filepath TEXT,
      content TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Segments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS segments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      traits TEXT NOT NULL,
      data_source_ids TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Surveys table
  db.exec(`
    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      questions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Simulations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS simulations (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      segment_ids TEXT NOT NULL,
      sample_size INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      results TEXT,
      insights TEXT,
      confidence_scores TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (survey_id) REFERENCES surveys(id)
    )
  `);

  // Respondents table (for individual synthetic respondents)
  db.exec(`
    CREATE TABLE IF NOT EXISTS respondents (
      id TEXT PRIMARY KEY,
      simulation_id TEXT NOT NULL,
      segment_id TEXT NOT NULL,
      persona TEXT NOT NULL,
      responses TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (simulation_id) REFERENCES simulations(id),
      FOREIGN KEY (segment_id) REFERENCES segments(id)
    )
  `);

  console.log('Database initialized successfully');
  return db;
}

module.exports = { getDb, initDatabase };
