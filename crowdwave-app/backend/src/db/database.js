const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Use /tmp for Railway or local path for development
const dbPath = process.env.RAILWAY_ENVIRONMENT 
  ? '/tmp/crowdwave.db'
  : path.join(__dirname, '..', '..', 'crowdwave.db');

let db = null;
let SQL = null;
let initialized = false;

// Initialize database
async function initDatabase() {
  if (initialized) return;
  
  console.log('Initializing database at:', dbPath);
  SQL = await initSqlJs();
  
  // Load existing database or create new one
  try {
    if (fs.existsSync(dbPath)) {
      console.log('Loading existing database...');
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      console.log('Creating new database...');
      db = new SQL.Database();
    }
  } catch (err) {
    console.log('Creating new database due to error:', err.message);
    db = new SQL.Database();
  }

  // Initialize schema
  db.run(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      file_path TEXT,
      extracted_text TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS segments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      traits TEXT NOT NULL,
      data_source_ids TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      questions TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS simulations (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      segment_ids TEXT NOT NULL,
      sample_size INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      results TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    )
  `);

  initialized = true;
  saveDatabase();
}

// Save database to file
function saveDatabase() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Get database instance (throws if not initialized)
function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

// Wrapper to match better-sqlite3 API style
const dbWrapper = {
  prepare(sql) {
    return {
      run(...params) {
        const database = getDb();
        try {
          database.run(sql, params);
          saveDatabase();
          return { changes: database.getRowsModified() };
        } catch (err) {
          console.error('DB run error:', err.message, 'SQL:', sql);
          throw err;
        }
      },
      get(...params) {
        const database = getDb();
        try {
          const stmt = database.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        } catch (err) {
          console.error('DB get error:', err.message, 'SQL:', sql);
          throw err;
        }
      },
      all(...params) {
        const database = getDb();
        try {
          const results = [];
          const stmt = database.prepare(sql);
          if (params.length > 0) {
            stmt.bind(params);
          }
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (err) {
          console.error('DB all error:', err.message, 'SQL:', sql);
          throw err;
        }
      }
    };
  },
  exec(sql) {
    const database = getDb();
    database.run(sql);
    saveDatabase();
  }
};

module.exports = { initDatabase, db: dbWrapper, saveDatabase };
