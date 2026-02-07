/**
 * Results Routes
 * Retrieve simulation results and exports
 */

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/init');
const { exportToCsv } = require('../services/csvExporter');

// GET simulation results
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    
    // Get simulation
    const simulation = db.prepare('SELECT * FROM simulations WHERE id = ?').get(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Get survey for question details
    const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(simulation.survey_id);

    // Get respondents
    const respondents = db.prepare('SELECT * FROM respondents WHERE simulation_id = ?').all(req.params.id);

    // Get segments
    const segmentIds = JSON.parse(simulation.segment_ids);
    const segments = segmentIds.map(id => {
      const seg = db.prepare('SELECT * FROM segments WHERE id = ?').get(id);
      return seg ? { ...seg, traits: JSON.parse(seg.traits) } : null;
    }).filter(Boolean);

    res.json({
      simulation: {
        id: simulation.id,
        status: simulation.status,
        sample_size: simulation.sample_size,
        created_at: simulation.created_at,
        completed_at: simulation.completed_at
      },
      survey: survey ? {
        id: survey.id,
        name: survey.name,
        questions: JSON.parse(survey.questions)
      } : null,
      segments: segments,
      respondent_count: respondents.length,
      respondents: respondents.map(r => ({
        id: r.id,
        segment_id: r.segment_id,
        persona: JSON.parse(r.persona),
        responses: JSON.parse(r.responses)
      })),
      insights: simulation.insights ? JSON.parse(simulation.insights) : null,
      confidence_scores: simulation.confidence_scores ? JSON.parse(simulation.confidence_scores) : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET results as CSV
router.get('/:id/csv', async (req, res) => {
  try {
    const db = getDb();
    
    // Get simulation
    const simulation = db.prepare('SELECT * FROM simulations WHERE id = ?').get(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    if (simulation.status !== 'completed') {
      return res.status(400).json({ error: 'Simulation not yet completed' });
    }

    // Get survey
    const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(simulation.survey_id);
    const questions = survey ? JSON.parse(survey.questions) : [];

    // Get respondents
    const respondents = db.prepare('SELECT * FROM respondents WHERE simulation_id = ?').all(req.params.id);
    
    // Get segments for names
    const segmentIds = JSON.parse(simulation.segment_ids);
    const segmentMap = {};
    for (const id of segmentIds) {
      const seg = db.prepare('SELECT id, name FROM segments WHERE id = ?').get(id);
      if (seg) segmentMap[seg.id] = seg.name;
    }

    // Generate CSV
    const csv = exportToCsv(respondents, questions, segmentMap);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="crowdwave-results-${req.params.id}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET insights summary
router.get('/:id/insights', (req, res) => {
  try {
    const db = getDb();
    const simulation = db.prepare('SELECT insights, confidence_scores FROM simulations WHERE id = ?').get(req.params.id);
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    res.json({
      insights: simulation.insights ? JSON.parse(simulation.insights) : null,
      confidence_scores: simulation.confidence_scores ? JSON.parse(simulation.confidence_scores) : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all simulations
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const simulations = db.prepare(`
      SELECT s.*, sv.name as survey_name 
      FROM simulations s 
      LEFT JOIN surveys sv ON s.survey_id = sv.id 
      ORDER BY s.created_at DESC
    `).all();
    
    res.json(simulations.map(sim => ({
      ...sim,
      segment_ids: JSON.parse(sim.segment_ids)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
