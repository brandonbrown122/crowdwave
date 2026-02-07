const { db, saveDatabase } = require('../db/database');

/**
 * Run a simulation with the given parameters
 * In production, this would call an LLM to generate synthetic responses
 */
async function runSimulation(simulationId, survey, segments, sampleSize) {
  const results = {
    simulationId,
    surveyId: survey.id,
    surveyName: survey.name,
    segments: segments.map(s => ({ id: s.id, name: s.name })),
    sampleSize,
    responses: [],
    aggregates: {}
  };

  const questions = JSON.parse(survey.questions);
  
  // Generate synthetic responses for each segment
  for (const segment of segments) {
    const traits = JSON.parse(segment.traits);
    const responsesPerSegment = Math.floor(sampleSize / segments.length);
    
    for (let i = 0; i < responsesPerSegment; i++) {
      const respondent = {
        id: `resp_${segment.id}_${i}`,
        segmentId: segment.id,
        segmentName: segment.name,
        traits,
        answers: {}
      };
      
      // Generate answers for each question
      // In production, this would use an LLM with segment traits as context
      for (const question of questions) {
        respondent.answers[question.id] = generateMockAnswer(question, traits);
      }
      
      results.responses.push(respondent);
    }
  }
  
  // Calculate aggregates
  results.aggregates = calculateAggregates(questions, results.responses);
  
  // Update simulation status
  db.prepare(`
    UPDATE simulations 
    SET status = 'completed', results = ?, completed_at = datetime('now')
    WHERE id = ?
  `).run(JSON.stringify(results), simulationId);
  
  return results;
}

/**
 * Generate a mock answer based on question type
 * In production, this would be replaced with LLM-generated responses
 */
function generateMockAnswer(question, traits) {
  switch (question.type) {
    case 'multiple_choice':
      const options = question.options || [];
      return options[Math.floor(Math.random() * options.length)];
    
    case 'likert':
      // Generate weighted response based on traits (mock logic)
      const scale = question.scale || 5;
      return Math.floor(Math.random() * scale) + 1;
    
    case 'open_ended':
      return `[Synthetic response based on ${traits.demographic || 'general'} perspective - LLM would generate contextual response]`;
    
    case 'ranking':
      const items = [...(question.options || [])];
      // Shuffle for mock ranking
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      return items;
    
    default:
      return null;
  }
}

/**
 * Calculate aggregate statistics for responses
 */
function calculateAggregates(questions, responses) {
  const aggregates = {};
  
  for (const question of questions) {
    aggregates[question.id] = {
      questionText: question.text,
      type: question.type,
      bySegment: {}
    };
    
    // Group responses by segment
    const segmentGroups = {};
    responses.forEach(r => {
      if (!segmentGroups[r.segmentId]) {
        segmentGroups[r.segmentId] = [];
      }
      segmentGroups[r.segmentId].push(r.answers[question.id]);
    });
    
    // Calculate stats per segment
    for (const [segmentId, answers] of Object.entries(segmentGroups)) {
      if (question.type === 'likert') {
        const nums = answers.filter(a => typeof a === 'number');
        const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        aggregates[question.id].bySegment[segmentId] = {
          average: avg.toFixed(2),
          distribution: countOccurrences(nums)
        };
      } else if (question.type === 'multiple_choice') {
        aggregates[question.id].bySegment[segmentId] = {
          distribution: countOccurrences(answers)
        };
      } else if (question.type === 'ranking') {
        // Calculate average rank for each item
        const rankSums = {};
        answers.forEach(ranking => {
          if (Array.isArray(ranking)) {
            ranking.forEach((item, idx) => {
              rankSums[item] = (rankSums[item] || 0) + idx + 1;
            });
          }
        });
        const avgRanks = {};
        for (const [item, sum] of Object.entries(rankSums)) {
          avgRanks[item] = (sum / answers.length).toFixed(2);
        }
        aggregates[question.id].bySegment[segmentId] = { averageRanks: avgRanks };
      } else {
        aggregates[question.id].bySegment[segmentId] = {
          responseCount: answers.length
        };
      }
    }
  }
  
  return aggregates;
}

function countOccurrences(arr) {
  return arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

module.exports = { runSimulation };
