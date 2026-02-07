/**
 * Simulation Routes
 * Run synthetic audience simulations
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/init');
const { generatePersonas } = require('../services/personaEngine');
const { generateResponses } = require('../services/responseGenerator');
const { calculateConfidence } = require('../services/confidenceScorer');
const { generateInsights } = require('../services/insightsGenerator');
const { exportToCsv } = require('../services/csvExporter');

// POST create and run simulation
router.post('/', async (req, res) => {
  try {
    const { survey_id, segment_ids, sample_size } = req.body;
    
    if (!survey_id || !segment_ids || !sample_size) {
      return res.status(400).json({ 
        error: 'survey_id, segment_ids, and sample_size are required' 
      });
    }

    if (!Array.isArray(segment_ids) || segment_ids.length === 0) {
      return res.status(400).json({ error: 'segment_ids must be a non-empty array' });
    }

    if (sample_size < 1 || sample_size > 1000) {
      return res.status(400).json({ error: 'sample_size must be between 1 and 1000' });
    }

    const db = getDb();
    
    // Fetch survey
    const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(survey_id);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    const questions = JSON.parse(survey.questions);

    // Fetch segments
    const segments = [];
    for (const segId of segment_ids) {
      const segment = db.prepare('SELECT * FROM segments WHERE id = ?').get(segId);
      if (!segment) {
        return res.status(404).json({ error: `Segment not found: ${segId}` });
      }
      segments.push({
        ...segment,
        traits: JSON.parse(segment.traits),
        data_source_ids: segment.data_source_ids ? JSON.parse(segment.data_source_ids) : []
      });
    }

    // Fetch data sources for context
    const dataSourceIds = [...new Set(segments.flatMap(s => s.data_source_ids))];
    const dataSources = [];
    for (const dsId of dataSourceIds) {
      const ds = db.prepare('SELECT * FROM data_sources WHERE id = ?').get(dsId);
      if (ds) {
        dataSources.push({
          ...ds,
          metadata: ds.metadata ? JSON.parse(ds.metadata) : null
        });
      }
    }

    // Create simulation record
    const simulationId = uuidv4();
    db.prepare(`
      INSERT INTO simulations (id, survey_id, segment_ids, sample_size, status)
      VALUES (?, ?, ?, ?, 'running')
    `).run(simulationId, survey_id, JSON.stringify(segment_ids), sample_size);

    // Return immediately with simulation ID
    res.status(202).json({
      id: simulationId,
      status: 'running',
      message: 'Simulation started. Poll /api/results/:id for results.'
    });

    // Run simulation asynchronously
    runSimulation(simulationId, segments, questions, sample_size, dataSources, db)
      .catch(error => {
        console.error('Simulation error:', error);
        db.prepare(`
          UPDATE simulations SET status = 'error', results = ? WHERE id = ?
        `).run(JSON.stringify({ error: error.message }), simulationId);
      });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET simulation status
router.get('/:id/status', (req, res) => {
  try {
    const db = getDb();
    const simulation = db.prepare('SELECT id, status, created_at, completed_at FROM simulations WHERE id = ?').get(req.params.id);
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    res.json(simulation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Async simulation runner
async function runSimulation(simulationId, segments, questions, sampleSize, dataSources, db) {
  console.log(`Starting simulation ${simulationId}...`);
  
  const allRespondents = [];
  const samplesPerSegment = Math.ceil(sampleSize / segments.length);

  // Generate personas and responses for each segment
  for (const segment of segments) {
    console.log(`Processing segment: ${segment.name}`);
    
    // Get relevant data source content
    const segmentDataSources = dataSources.filter(ds => 
      segment.data_source_ids.includes(ds.id)
    );
    const contextData = segmentDataSources.map(ds => ds.content).join('\n\n');

    // Generate personas for this segment
    const personas = await generatePersonas(segment, samplesPerSegment, contextData);
    
    // Generate responses for each persona
    for (const persona of personas) {
      const responses = await generateResponses(persona, questions, segment, contextData);
      
      const respondentId = uuidv4();
      const respondent = {
        id: respondentId,
        simulation_id: simulationId,
        segment_id: segment.id,
        segment_name: segment.name,
        persona,
        responses
      };
      
      allRespondents.push(respondent);
      
      // Save to database
      db.prepare(`
        INSERT INTO respondents (id, simulation_id, segment_id, persona, responses)
        VALUES (?, ?, ?, ?, ?)
      `).run(respondentId, simulationId, segment.id, JSON.stringify(persona), JSON.stringify(responses));
    }
  }

  // Calculate confidence scores
  const confidenceScores = await calculateConfidence(questions, allRespondents, segments, dataSources);

  // Generate insights
  const insights = await generateInsights(questions, allRespondents, segments);

  // Update simulation with results
  db.prepare(`
    UPDATE simulations 
    SET status = 'completed', 
        results = ?, 
        insights = ?, 
        confidence_scores = ?,
        completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    JSON.stringify({ respondent_count: allRespondents.length }),
    JSON.stringify(insights),
    JSON.stringify(confidenceScores),
    simulationId
  );

  console.log(`Simulation ${simulationId} completed with ${allRespondents.length} respondents`);
}

module.exports = router;
