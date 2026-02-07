const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { processFile } = require('../services/dataProcessor');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

// POST /api/data-sources - Upload and process a data file
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const id = uuidv4();
    const { originalname, mimetype, path: filePath } = req.file;
    const name = req.body.name || originalname;

    // Process the file
    const processed = await processFile(filePath, mimetype);

    // Store in database
    db.prepare(`
      INSERT INTO data_sources (id, name, type, file_path, extracted_text, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      processed.type,
      filePath,
      processed.text,
      JSON.stringify(processed.metadata)
    );

    res.status(201).json({
      id,
      name,
      type: processed.type,
      metadata: processed.metadata,
      hasExtractedText: !!processed.text,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/data-sources - List all data sources
router.get('/', (req, res) => {
  const sources = db.prepare(`
    SELECT id, name, type, metadata, created_at as createdAt
    FROM data_sources
    ORDER BY created_at DESC
  `).all();

  res.json(sources.map(s => ({
    ...s,
    metadata: JSON.parse(s.metadata || '{}')
  })));
});

// GET /api/data-sources/:id - Get a specific data source
router.get('/:id', (req, res) => {
  const source = db.prepare(`
    SELECT * FROM data_sources WHERE id = ?
  `).get(req.params.id);

  if (!source) {
    return res.status(404).json({ error: 'Data source not found' });
  }

  res.json({
    ...source,
    metadata: JSON.parse(source.metadata || '{}')
  });
});

// DELETE /api/data-sources/:id - Delete a data source
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM data_sources WHERE id = ?').run(req.params.id);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Data source not found' });
  }

  res.status(204).send();
});

module.exports = router;
