const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

const router = express.Router();

// Valid question types
const QUESTION_TYPES = ['multiple_choice', 'likert', 'open_ended', 'ranking'];

// Validate questions structure
function validateQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return 'Questions must be a non-empty array';
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    if (!q.text || typeof q.text !== 'string') {
      return `Question ${i + 1}: text is required`;
    }
    
    if (!q.type || !QUESTION_TYPES.includes(q.type)) {
      return `Question ${i + 1}: type must be one of ${QUESTION_TYPES.join(', ')}`;
    }
    
    if (q.type === 'multiple_choice' || q.type === 'ranking') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return `Question ${i + 1}: options array with at least 2 items is required for ${q.type}`;
      }
    }
    
    if (q.type === 'likert') {
      if (q.scale && (typeof q.scale !== 'number' || q.scale < 2 || q.scale > 10)) {
        return `Question ${i + 1}: likert scale must be a number between 2 and 10`;
      }
    }
  }
  
  return null;
}

// POST /api/surveys - Create a new survey
router.post('/', (req, res, next) => {
  try {
    const { name, description, questions } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const validationError = validateQuestions(questions);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Ensure each question has an ID
    const processedQuestions = questions.map((q, idx) => ({
      id: q.id || `q_${idx + 1}`,
      ...q
    }));

    const id = uuidv4();

    db.prepare(`
      INSERT INTO surveys (id, name, description, questions)
      VALUES (?, ?, ?, ?)
    `).run(id, name, description || null, JSON.stringify(processedQuestions));

    res.status(201).json({
      id,
      name,
      description,
      questions: processedQuestions,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/surveys - List all surveys
router.get('/', (req, res) => {
  const surveys = db.prepare(`
    SELECT id, name, description, questions, created_at as createdAt
    FROM surveys
    ORDER BY created_at DESC
  `).all();

  res.json(surveys.map(s => ({
    ...s,
    questions: JSON.parse(s.questions),
    questionCount: JSON.parse(s.questions).length
  })));
});

// GET /api/surveys/:id - Get a specific survey
router.get('/:id', (req, res) => {
  const survey = db.prepare('SELECT * FROM surveys WHERE id = ?').get(req.params.id);

  if (!survey) {
    return res.status(404).json({ error: 'Survey not found' });
  }

  res.json({
    id: survey.id,
    name: survey.name,
    description: survey.description,
    questions: JSON.parse(survey.questions),
    createdAt: survey.created_at
  });
});

// PUT /api/surveys/:id - Update a survey
router.put('/:id', (req, res, next) => {
  try {
    const { name, description, questions } = req.body;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM surveys WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (questions) {
      const validationError = validateQuestions(questions);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
    }

    const processedQuestions = questions 
      ? questions.map((q, idx) => ({ id: q.id || `q_${idx + 1}`, ...q }))
      : JSON.parse(existing.questions);

    db.prepare(`
      UPDATE surveys
      SET name = ?, description = ?, questions = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      JSON.stringify(processedQuestions),
      id
    );

    res.json({
      id,
      name: name || existing.name,
      description: description !== undefined ? description : existing.description,
      questions: processedQuestions
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/surveys/:id - Delete a survey
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM surveys WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Survey not found' });
  }

  res.status(204).send();
});

module.exports = router;
