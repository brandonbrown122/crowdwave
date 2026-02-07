/**
 * @fileoverview Confidence Scorer - Scores confidence for survey responses
 * @module services/confidenceScorer
 */

/**
 * @typedef {Object} ConfidenceScore
 * @property {number} score - Overall confidence score (0-100)
 * @property {Object} breakdown - Component scores
 * @property {number} breakdown.dataSourceRelevance - Score based on data source quality
 * @property {number} breakdown.questionTypeClarity - Score based on question type
 * @property {number} breakdown.segmentDefinition - Score based on segment clarity
 * @property {number} breakdown.personaCoherence - Score based on persona consistency
 * @property {string} explanation - Human-readable explanation
 * @property {string[]} factors - Key factors influencing the score
 */

/**
 * @typedef {Object} ConfidenceContext
 * @property {Object} persona - The persona generating the response
 * @property {Object} question - The question being answered
 * @property {Object[]} dataSources - Available data sources
 * @property {Object} segment - Segment definition
 */

/**
 * Weight factors for different confidence components
 */
const CONFIDENCE_WEIGHTS = {
  dataSourceRelevance: 0.30,
  questionTypeClarity: 0.20,
  segmentDefinition: 0.25,
  personaCoherence: 0.25
};

/**
 * Base confidence scores by question type (some types are inherently harder to simulate)
 */
const QUESTION_TYPE_BASE_SCORES = {
  multiple_choice: 85, // Easy to simulate with options
  likert: 80,         // Scale responses are fairly predictable
  ranking: 70,        // More complex decision-making
  open_ended: 60,     // Most difficult to simulate authentically
  matrix: 75          // Multiple related scales
};

/**
 * Calculates confidence score based on data source relevance
 * @param {Object[]} dataSources - Available data sources
 * @param {Object} question - Question being answered
 * @param {Object} persona - Persona generating the response
 * @returns {Object} Score and factors
 */
function scoreDataSourceRelevance(dataSources, question, persona) {
  const factors = [];
  let score = 50; // Baseline score

  if (!dataSources || dataSources.length === 0) {
    factors.push('No data sources available - relying on synthetic generation only');
    return { score: 40, factors };
  }

  // Check for relevant data sources
  const relevantSources = dataSources.filter(ds => {
    // Check segment relevance
    if (ds.relevantSegments && ds.relevantSegments.includes(persona.segmentId)) {
      return true;
    }
    // Check topic relevance via keywords
    const questionText = question.text?.toLowerCase() || '';
    if (ds.keywords) {
      return ds.keywords.some(kw => questionText.includes(kw.toLowerCase()));
    }
    return false;
  });

  if (relevantSources.length > 0) {
    score += 20;
    factors.push(`${relevantSources.length} relevant data source(s) found`);
  }

  // Bonus for data freshness
  const recentSources = dataSources.filter(ds => {
    if (!ds.createdAt) return false;
    const age = Date.now() - new Date(ds.createdAt).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    return age < 90 * dayMs; // Less than 90 days old
  });

  if (recentSources.length > 0) {
    score += 10;
    factors.push('Data sources are recent (< 90 days)');
  }

  // Check data quality
  const highQualitySources = dataSources.filter(ds => ds.quality === 'high' || ds.verified);
  if (highQualitySources.length > 0) {
    score += 15;
    factors.push(`${highQualitySources.length} high-quality verified source(s)`);
  }

  // Penalize for conflicting data
  if (dataSources.some(ds => ds.conflicts && ds.conflicts.length > 0)) {
    score -= 10;
    factors.push('Some data sources have conflicts');
  }

  // Check coverage
  const personaInsights = persona.context?.dataSourceInsights || [];
  if (personaInsights.length > 0) {
    score += 5;
    factors.push('Persona has incorporated data source insights');
  }

  return { score: Math.max(0, Math.min(100, score)), factors };
}

/**
 * Calculates confidence score based on question type
 * @param {Object} question - Question being answered
 * @returns {Object} Score and factors
 */
function scoreQuestionTypeClarity(question) {
  const factors = [];
  let score = QUESTION_TYPE_BASE_SCORES[question.type] || 65;

  // Adjust based on question characteristics
  if (question.type === 'multiple_choice') {
    if (question.options && question.options.length >= 2 && question.options.length <= 5) {
      score += 5;
      factors.push('Well-scoped option set (2-5 options)');
    } else if (question.options && question.options.length > 7) {
      score -= 10;
      factors.push('Many options reduce prediction accuracy');
    }

    // Check for clear, distinct options
    const avgOptionLength = question.options?.reduce((sum, o) => sum + o.length, 0) / (question.options?.length || 1);
    if (avgOptionLength > 10 && avgOptionLength < 50) {
      score += 5;
      factors.push('Options are descriptive but concise');
    }
  }

  if (question.type === 'likert') {
    const scaleRange = (question.scale?.max || 5) - (question.scale?.min || 1);
    if (scaleRange >= 4 && scaleRange <= 6) {
      score += 5;
      factors.push('Standard scale range (5-7 points)');
    }

    if (question.scale?.labels && question.scale.labels.length > 0) {
      score += 5;
      factors.push('Scale has labeled endpoints');
    }
  }

  if (question.type === 'open_ended') {
    // Open-ended is harder - adjust based on guidance
    if (question.minLength || question.maxLength) {
      score += 5;
      factors.push('Response length guidance provided');
    }
    if (question.exampleResponse) {
      score += 10;
      factors.push('Example response available for calibration');
    }

    // Specific topics are easier than broad
    if (question.topic || question.category) {
      score += 5;
      factors.push('Question has defined topic/category');
    }
  }

  if (question.type === 'ranking') {
    if (question.options && question.options.length <= 5) {
      score += 10;
      factors.push('Manageable number of items to rank');
    } else if (question.options && question.options.length > 7) {
      score -= 10;
      factors.push('Many items increase ranking complexity');
    }
  }

  // Check question clarity
  if (question.text && question.text.length > 20 && question.text.length < 200) {
    score += 5;
    factors.push('Question text is appropriately detailed');
  }

  return { score: Math.max(0, Math.min(100, score)), factors };
}

/**
 * Calculates confidence score based on segment definition clarity
 * @param {Object} segment - Segment definition
 * @returns {Object} Score and factors
 */
function scoreSegmentDefinition(segment) {
  const factors = [];
  let score = 50; // Baseline

  if (!segment) {
    factors.push('No segment definition available');
    return { score: 30, factors };
  }

  // Demographics definition
  if (segment.demographics) {
    const demoFields = Object.keys(segment.demographics).length;
    if (demoFields >= 3) {
      score += 15;
      factors.push(`Demographics defined with ${demoFields} attributes`);
    } else if (demoFields > 0) {
      score += 5;
      factors.push('Limited demographic definition');
    }

    // Check for specific age ranges vs broad
    if (segment.demographics.ageRange) {
      const range = segment.demographics.ageRange[1] - segment.demographics.ageRange[0];
      if (range <= 20) {
        score += 5;
        factors.push('Focused age range');
      }
    }
  }

  // Psychographics definition
  if (segment.psychographics) {
    const psychFields = Object.keys(segment.psychographics).length;
    if (psychFields >= 2) {
      score += 15;
      factors.push(`Psychographics defined with ${psychFields} attributes`);
    }

    if (segment.psychographics.values && segment.psychographics.values.length > 0) {
      score += 5;
      factors.push('Core values specified');
    }
  }

  // Behavioral definition
  if (segment.behaviors) {
    const behaviorFields = Object.keys(segment.behaviors).length;
    if (behaviorFields >= 2) {
      score += 10;
      factors.push(`Behaviors defined with ${behaviorFields} attributes`);
    }
  }

  // Check for segment weight/size
  if (segment.weight !== undefined && segment.weight > 0) {
    score += 5;
    factors.push('Segment weight defined');
  }

  // Check for segment name clarity
  if (segment.name && segment.name.length > 3) {
    score += 5;
    factors.push('Segment has descriptive name');
  }

  // Penalize overly broad segments
  const totalFields = (segment.demographics ? Object.keys(segment.demographics).length : 0) +
                      (segment.psychographics ? Object.keys(segment.psychographics).length : 0) +
                      (segment.behaviors ? Object.keys(segment.behaviors).length : 0);
  
  if (totalFields < 3) {
    score -= 15;
    factors.push('Segment definition is too broad');
  }

  return { score: Math.max(0, Math.min(100, score)), factors };
}

/**
 * Calculates confidence score based on persona coherence
 * @param {Object} persona - Persona generating the response
 * @param {Object} question - Question being answered
 * @returns {Object} Score and factors
 */
function scorePersonaCoherence(persona, question) {
  const factors = [];
  let score = 60; // Baseline for valid persona

  if (!persona || !persona.id) {
    factors.push('Invalid persona');
    return { score: 0, factors };
  }

  // Check completeness
  if (persona.demographics && Object.keys(persona.demographics).length >= 5) {
    score += 10;
    factors.push('Complete demographic profile');
  }

  if (persona.psychographics?.values && persona.psychographics.values.length >= 2) {
    score += 5;
    factors.push('Well-defined values');
  }

  if (persona.psychographics?.bigFive) {
    score += 10;
    factors.push('Big Five personality traits defined');
  }

  if (persona.behaviors && Object.keys(persona.behaviors).length >= 3) {
    score += 5;
    factors.push('Behavioral patterns defined');
  }

  // Check context
  if (persona.context?.summary && persona.context.summary.length > 50) {
    score += 5;
    factors.push('Persona has rich context summary');
  }

  if (persona.context?.dataSourceInsights && persona.context.dataSourceInsights.length > 0) {
    score += 10;
    factors.push('Persona enriched with data source insights');
  }

  // Check trait consistency (internal coherence)
  if (persona.psychographics?.lifestyle && persona.behaviors?.decisionStyle) {
    // Example: check if lifestyle and decision style are coherent
    const coherentPairs = [
      ['health-conscious', 'deliberate'],
      ['career-focused', 'analytical'],
      ['adventurous', 'intuitive'],
      ['traditional', 'deliberate'],
      ['tech-savvy', 'analytical']
    ];

    const isCoherent = coherentPairs.some(([lifestyle, style]) => 
      persona.psychographics.lifestyle === lifestyle && 
      persona.behaviors.decisionStyle === style
    );

    if (isCoherent) {
      score += 5;
      factors.push('Persona traits show internal coherence');
    }
  }

  return { score: Math.max(0, Math.min(100, score)), factors };
}

/**
 * Calculates comprehensive confidence score for a response
 * @param {ConfidenceContext} context - Context for scoring
 * @returns {ConfidenceScore} Complete confidence score
 */
function calculateConfidence(context) {
  const { persona, question, dataSources = [], segment } = context;

  // Calculate component scores
  const dataSourceScore = scoreDataSourceRelevance(dataSources, question, persona);
  const questionTypeScore = scoreQuestionTypeClarity(question);
  const segmentScore = scoreSegmentDefinition(segment);
  const personaScore = scorePersonaCoherence(persona, question);

  // Weighted combination
  const weightedScore = 
    dataSourceScore.score * CONFIDENCE_WEIGHTS.dataSourceRelevance +
    questionTypeScore.score * CONFIDENCE_WEIGHTS.questionTypeClarity +
    segmentScore.score * CONFIDENCE_WEIGHTS.segmentDefinition +
    personaScore.score * CONFIDENCE_WEIGHTS.personaCoherence;

  const finalScore = Math.round(weightedScore);

  // Collect all factors
  const allFactors = [
    ...dataSourceScore.factors.map(f => `[Data] ${f}`),
    ...questionTypeScore.factors.map(f => `[Question] ${f}`),
    ...segmentScore.factors.map(f => `[Segment] ${f}`),
    ...personaScore.factors.map(f => `[Persona] ${f}`)
  ];

  // Generate explanation
  const explanation = generateExplanation(finalScore, {
    dataSourceRelevance: dataSourceScore.score,
    questionTypeClarity: questionTypeScore.score,
    segmentDefinition: segmentScore.score,
    personaCoherence: personaScore.score
  });

  return {
    score: finalScore,
    breakdown: {
      dataSourceRelevance: dataSourceScore.score,
      questionTypeClarity: questionTypeScore.score,
      segmentDefinition: segmentScore.score,
      personaCoherence: personaScore.score
    },
    explanation,
    factors: allFactors,
    weights: CONFIDENCE_WEIGHTS
  };
}

/**
 * Generates a human-readable explanation of the confidence score
 * @param {number} score - Overall score
 * @param {Object} breakdown - Component scores
 * @returns {string} Explanation text
 */
function generateExplanation(score, breakdown) {
  const qualityLevel = score >= 80 ? 'high' : score >= 60 ? 'moderate' : score >= 40 ? 'low' : 'very low';
  
  let explanation = `This response has ${qualityLevel} confidence (${score}/100). `;

  // Find strongest and weakest components
  const components = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const strongest = components[0];
  const weakest = components[components.length - 1];

  const componentNames = {
    dataSourceRelevance: 'data source relevance',
    questionTypeClarity: 'question clarity',
    segmentDefinition: 'segment definition',
    personaCoherence: 'persona coherence'
  };

  explanation += `Strongest factor: ${componentNames[strongest[0]]} (${strongest[1]}/100). `;
  
  if (weakest[1] < 60) {
    explanation += `Area for improvement: ${componentNames[weakest[0]]} (${weakest[1]}/100).`;
  }

  return explanation;
}

/**
 * Calculates confidence for a batch of responses
 * @param {Object[]} responses - Array of responses
 * @param {Object[]} questions - Question definitions
 * @param {Object[]} personas - Persona objects
 * @param {Object} options - Additional options
 * @returns {Object} Batch confidence results
 */
function batchCalculateConfidence(responses, questions, personas, options = {}) {
  const { dataSources = [], segments = {} } = options;
  
  const results = responses.map(response => {
    const question = questions.find(q => q.id === response.questionId);
    const persona = personas.find(p => p.id === response.personaId);
    const segment = persona ? segments[persona.segmentId] : null;

    if (!question || !persona) {
      return {
        responseId: `${response.personaId}-${response.questionId}`,
        score: 0,
        error: 'Missing question or persona reference'
      };
    }

    const confidence = calculateConfidence({
      persona,
      question,
      dataSources,
      segment
    });

    return {
      responseId: `${response.personaId}-${response.questionId}`,
      questionId: response.questionId,
      personaId: response.personaId,
      ...confidence
    };
  });

  // Calculate summary statistics
  const scores = results.filter(r => !r.error).map(r => r.score);
  const avgScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    results,
    summary: {
      totalResponses: responses.length,
      scoredResponses: scores.length,
      averageConfidence: avgScore,
      highConfidence: scores.filter(s => s >= 80).length,
      moderateConfidence: scores.filter(s => s >= 60 && s < 80).length,
      lowConfidence: scores.filter(s => s < 60).length,
      confidenceDistribution: {
        '0-20': scores.filter(s => s < 20).length,
        '20-40': scores.filter(s => s >= 20 && s < 40).length,
        '40-60': scores.filter(s => s >= 40 && s < 60).length,
        '60-80': scores.filter(s => s >= 60 && s < 80).length,
        '80-100': scores.filter(s => s >= 80).length
      }
    }
  };
}

/**
 * Generates recommendations to improve confidence scores
 * @param {ConfidenceScore} confidenceScore - Calculated confidence score
 * @returns {string[]} List of recommendations
 */
function generateRecommendations(confidenceScore) {
  const recommendations = [];
  const { breakdown } = confidenceScore;

  if (breakdown.dataSourceRelevance < 60) {
    recommendations.push('Upload more relevant data sources (research reports, survey data, market analysis)');
    recommendations.push('Ensure data sources are tagged with relevant segment IDs');
  }

  if (breakdown.questionTypeClarity < 60) {
    recommendations.push('Add clearer answer options or scale labels');
    recommendations.push('For open-ended questions, provide example responses or topic guidance');
  }

  if (breakdown.segmentDefinition < 60) {
    recommendations.push('Add more detailed demographic and psychographic attributes to segments');
    recommendations.push('Define specific behavioral patterns for each segment');
    recommendations.push('Narrow segment age ranges and other criteria');
  }

  if (breakdown.personaCoherence < 60) {
    recommendations.push('Enrich personas with data source insights');
    recommendations.push('Ensure persona traits are internally consistent');
    recommendations.push('Add Big Five personality traits to persona definitions');
  }

  if (recommendations.length === 0) {
    recommendations.push('Confidence scores are healthy. Consider adding more data sources for incremental improvement.');
  }

  return recommendations;
}

/**
 * Validates minimum confidence threshold
 * @param {number} score - Confidence score
 * @param {number} [threshold=50] - Minimum acceptable score
 * @returns {Object} Validation result
 */
function validateConfidenceThreshold(score, threshold = 50) {
  return {
    isValid: score >= threshold,
    score,
    threshold,
    message: score >= threshold 
      ? `Confidence score (${score}) meets threshold (${threshold})`
      : `Confidence score (${score}) is below threshold (${threshold}). Consider improving inputs.`
  };
}

module.exports = {
  calculateConfidence,
  batchCalculateConfidence,
  generateRecommendations,
  validateConfidenceThreshold,
  scoreDataSourceRelevance,
  scoreQuestionTypeClarity,
  scoreSegmentDefinition,
  scorePersonaCoherence,
  CONFIDENCE_WEIGHTS,
  QUESTION_TYPE_BASE_SCORES
};
