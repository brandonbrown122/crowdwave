const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { runSimulation } = require('../services/simulator');

const router = express.Router();

// POST /api/simulate - Run a new simulation
router.post('/', async (req, res, next) => {
  try {
    const { surveyId, segmentIds, sampleSize } = req.body;

    // Validate required fields
    if (!surveyId) {
      return res.status(400).json({ error: 'surveyId is required' });
    }

    if (!segmentIds || !Array.isArray(segmentIds) || segmentIds.length === 0) {
      return res.status(400).json({ error: 'segmentIds must be a non-empty array' });
    }

    if (!sampleSize || typeof sampleSize !== 'number' || sampleSize < 1) {
      return res.status(400).json({ error: 'sampleSize must be a positive number' });
    }

    // Verify survey exists
    const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Verify all segments exist
    const segments = [];
    for (const segmentId of segmentIds) {
      const segment = db.prepare('SELECT * FROM segments WHERE id = ?').get(segmentId);
      if (!segment) {
        return res.status(404).json({ error: `Segment not found: ${segmentId}` });
      }
      segments.push(segment);
    }

    // Create simulation record
    const id = uuidv4();
    db.prepare(`
      INSERT INTO simulations (id, survey_id, segment_ids, sample_size, status)
      VALUES (?, ?, ?, ?, 'running')
    `).run(id, surveyId, JSON.stringify(segmentIds), sampleSize);

    // Run simulation (in production, this would be async/queued)
    try {
      const results = await runSimulation(id, survey, segments, sampleSize);
      
      res.status(201).json({
        id,
        status: 'completed',
        surveyId,
        segmentIds,
        sampleSize,
        results
      });
    } catch (simError) {
      // Update status to failed
      db.prepare(`UPDATE simulations SET status = 'failed' WHERE id = ?`).run(id);
      throw simError;
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/results/:id - Get simulation results
router.get('/:id', (req, res) => {
  const simulation = db.prepare(`
    SELECT * FROM simulations WHERE id = ?
  `).get(req.params.id);

  if (!simulation) {
    return res.status(404).json({ error: 'Simulation not found' });
  }

  // Get survey name
  const survey = db.prepare('SELECT name FROM surveys WHERE id = ?').get(simulation.survey_id);

  // Get segment names
  const segmentIds = JSON.parse(simulation.segment_ids);
  const segments = segmentIds.map(id => {
    const seg = db.prepare('SELECT id, name FROM segments WHERE id = ?').get(id);
    return seg || { id, name: 'Unknown' };
  });

  res.json({
    id: simulation.id,
    surveyId: simulation.survey_id,
    surveyName: survey ? survey.name : 'Unknown',
    segmentIds,
    segments,
    sampleSize: simulation.sample_size,
    status: simulation.status,
    results: simulation.results ? JSON.parse(simulation.results) : null,
    createdAt: simulation.created_at,
    completedAt: simulation.completed_at
  });
});

// GET /api/simulations - List all simulations
router.get('/', (req, res) => {
  const simulations = db.prepare(`
    SELECT * FROM simulations ORDER BY created_at DESC
  `).all();

  res.json(simulations.map(sim => {
    const survey = db.prepare('SELECT name FROM surveys WHERE id = ?').get(sim.survey_id);
    return {
      id: sim.id,
      surveyId: sim.survey_id,
      surveyName: survey ? survey.name : 'Unknown',
      segmentIds: JSON.parse(sim.segment_ids),
      sampleSize: sim.sample_size,
      status: sim.status,
      createdAt: sim.created_at,
      completedAt: sim.completed_at
    };
  }));
});

module.exports = router;
