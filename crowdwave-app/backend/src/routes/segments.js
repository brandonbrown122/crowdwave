const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

const router = express.Router();

// POST /api/segments - Create a new segment
router.post('/', (req, res, next) => {
  try {
    const { name, description, traits, dataSourceIds } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!traits || typeof traits !== 'object') {
      return res.status(400).json({ error: 'Traits object is required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO segments (id, name, description, traits, data_source_ids)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      description || null,
      JSON.stringify(traits),
      dataSourceIds ? JSON.stringify(dataSourceIds) : null
    );

    res.status(201).json({
      id,
      name,
      description,
      traits,
      dataSourceIds: dataSourceIds || [],
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/segments - List all segments
router.get('/', (req, res) => {
  const segments = db.prepare(`
    SELECT id, name, description, traits, data_source_ids as dataSourceIds, created_at as createdAt
    FROM segments
    ORDER BY created_at DESC
  `).all();

  res.json(segments.map(s => ({
    ...s,
    traits: JSON.parse(s.traits),
    dataSourceIds: s.dataSourceIds ? JSON.parse(s.dataSourceIds) : []
  })));
});

// GET /api/segments/:id - Get a specific segment
router.get('/:id', (req, res) => {
  const segment = db.prepare('SELECT * FROM segments WHERE id = ?').get(req.params.id);

  if (!segment) {
    return res.status(404).json({ error: 'Segment not found' });
  }

  res.json({
    id: segment.id,
    name: segment.name,
    description: segment.description,
    traits: JSON.parse(segment.traits),
    dataSourceIds: segment.data_source_ids ? JSON.parse(segment.data_source_ids) : [],
    createdAt: segment.created_at
  });
});

// PUT /api/segments/:id - Update a segment
router.put('/:id', (req, res, next) => {
  try {
    const { name, description, traits, dataSourceIds } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM segments WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    db.prepare(`
      UPDATE segments
      SET name = ?, description = ?, traits = ?, data_source_ids = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      traits ? JSON.stringify(traits) : existing.traits,
      dataSourceIds ? JSON.stringify(dataSourceIds) : existing.data_source_ids,
      id
    );

    res.json({
      id,
      name: name || existing.name,
      description: description !== undefined ? description : existing.description,
      traits: traits || JSON.parse(existing.traits),
      dataSourceIds: dataSourceIds || (existing.data_source_ids ? JSON.parse(existing.data_source_ids) : [])
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/segments/:id - Delete a segment
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM segments WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Segment not found' });
  }

  res.status(204).send();
});

module.exports = router;
