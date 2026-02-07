/**
 * @fileoverview Response Generator - Generates realistic survey responses from personas
 * @module services/responseGenerator
 */

const crypto = require('crypto');

/**
 * @typedef {Object} Question
 * @property {string} id - Question identifier
 * @property {string} type - Question type: 'multiple_choice', 'likert', 'open_ended', 'ranking', 'matrix'
 * @property {string} text - Question text
 * @property {string[]} [options] - Answer options (for multiple choice, ranking)
 * @property {Object} [scale] - Scale configuration (for Likert)
 * @property {number} scale.min - Minimum value
 * @property {number} scale.max - Maximum value
 * @property {string[]} scale.labels - Scale labels
 * @property {boolean} [required] - Whether question is required
 * @property {Object} [metadata] - Additional question metadata
 */

/**
 * @typedef {Object} Response
 * @property {string} questionId - Question ID
 * @property {string} personaId - Persona ID
 * @property {*} answer - The selected/generated answer
 * @property {string} thinking - Explanation of why this answer was chosen
 * @property {number} confidence - Confidence score (0-100)
 * @property {number} responseTimeMs - Simulated response time
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} ResponseGenerationResult
 * @property {Response[]} responses - Generated responses
 * @property {Object} metadata - Generation metadata
 */

/**
 * Generates a weighted random selection based on persona traits
 * @param {string[]} options - Available options
 * @param {Object} persona - Persona generating the response
 * @param {Object} weights - Optional weight overrides
 * @returns {Object} Selected option with index
 */
function weightedSelection(options, persona, weights = {}) {
  // Default to uniform distribution
  let optionWeights = options.map(() => 1 / options.length);

  // Apply persona-based adjustments
  if (weights.personaFactors) {
    optionWeights = applyPersonaFactors(optionWeights, persona, weights.personaFactors);
  }

  // Normalize weights
  const sum = optionWeights.reduce((a, b) => a + b, 0);
  optionWeights = optionWeights.map(w => w / sum);

  // Random selection
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < options.length; i++) {
    cumulative += optionWeights[i];
    if (r <= cumulative) {
      return { selected: options[i], index: i, weight: optionWeights[i] };
    }
  }
  return { selected: options[options.length - 1], index: options.length - 1, weight: optionWeights[options.length - 1] };
}

/**
 * Applies persona factors to adjust option weights
 * @param {number[]} weights - Base weights
 * @param {Object} persona - Persona object
 * @param {Object} factors - Factor configuration
 * @returns {number[]} Adjusted weights
 */
function applyPersonaFactors(weights, persona, factors) {
  const adjusted = [...weights];

  // Example: risk-averse personas favor conservative options (often first listed)
  if (persona.behaviors?.riskTolerance === 'low') {
    adjusted[0] *= 1.3;
    if (adjusted.length > 1) adjusted[adjusted.length - 1] *= 0.7;
  } else if (persona.behaviors?.riskTolerance === 'high') {
    adjusted[0] *= 0.7;
    if (adjusted.length > 1) adjusted[adjusted.length - 1] *= 1.3;
  }

  // Analytical personalities tend to pick middle options (less extreme)
  if (persona.psychographics?.personality === 'analytical') {
    const midIndex = Math.floor(adjusted.length / 2);
    adjusted[midIndex] *= 1.4;
  }

  return adjusted;
}

/**
 * Generates reasoning for a multiple choice answer
 * @param {Object} persona - Persona object
 * @param {Question} question - Question object
 * @param {string} selectedOption - The selected answer
 * @returns {string} Reasoning explanation
 */
function generateMultipleChoiceReasoning(persona, question, selectedOption) {
  const { demographics, psychographics, behaviors } = persona;
  
  const reasoningTemplates = [
    `As a ${demographics.age}-year-old ${demographics.occupation} who values ${psychographics.values[0]}, I naturally gravitate toward "${selectedOption}".`,
    `Given my ${psychographics.personality} personality and ${behaviors.decisionStyle} decision-making style, "${selectedOption}" aligns with my preferences.`,
    `My ${psychographics.lifestyle} lifestyle and interest in ${psychographics.interests[0]} lead me to choose "${selectedOption}".`,
    `With ${behaviors.riskTolerance} risk tolerance and as someone who is ${behaviors.brandLoyalty}, "${selectedOption}" makes the most sense for me.`,
    `Living in ${demographics.location} as a ${demographics.maritalStatus} individual, "${selectedOption}" resonates with my situation.`
  ];

  return reasoningTemplates[Math.floor(Math.random() * reasoningTemplates.length)];
}

/**
 * Generates a multiple choice response
 * @param {Object} persona - Persona generating the response
 * @param {Question} question - Question to answer
 * @param {Object} [calibration] - Distribution calibration settings
 * @returns {Response} Generated response
 */
function generateMultipleChoiceResponse(persona, question, calibration = {}) {
  const options = question.options || [];
  if (options.length === 0) {
    throw new Error('Multiple choice questions must have options');
  }

  const selection = weightedSelection(options, persona, {
    personaFactors: true,
    ...calibration
  });

  const thinking = generateMultipleChoiceReasoning(persona, question, selection.selected);

  // Confidence based on how strongly the option aligned
  const confidence = Math.round(50 + selection.weight * 100 + Math.random() * 20);

  return {
    questionId: question.id,
    personaId: persona.id,
    answer: selection.selected,
    answerIndex: selection.index,
    thinking,
    confidence: Math.min(100, confidence),
    responseTimeMs: generateResponseTime('multiple_choice'),
    timestamp: new Date().toISOString()
  };
}

/**
 * Generates a Likert scale response
 * @param {Object} persona - Persona generating the response
 * @param {Question} question - Question to answer
 * @param {Object} [calibration] - Distribution calibration settings
 * @returns {Response} Generated response
 */
function generateLikertResponse(persona, question, calibration = {}) {
  const scale = question.scale || { min: 1, max: 5, labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] };
  const { min, max } = scale;
  const range = max - min;

  // Base tendency from personality
  let baseTendency = 0.5; // neutral
  const { bigFive } = persona.psychographics || {};

  // Agreeableness affects tendency to agree
  if (bigFive?.agreeableness > 70) baseTendency += 0.15;
  if (bigFive?.agreeableness < 30) baseTendency -= 0.1;

  // Neuroticism affects extremity
  const extremityFactor = bigFive?.neuroticism > 60 ? 1.3 : 1.0;

  // Calculate score with variance
  const targetPosition = baseTendency + (Math.random() - 0.5) * 0.4 * extremityFactor;
  let score = Math.round(min + targetPosition * range);
  
  // Apply calibration shift if needed
  if (calibration.targetMean) {
    const currentMean = (min + max) / 2;
    const shift = (calibration.targetMean - currentMean) * 0.3;
    score = Math.round(score + shift);
  }

  // Clamp to valid range
  score = Math.max(min, Math.min(max, score));

  const thinking = generateLikertReasoning(persona, question, score, scale);

  return {
    questionId: question.id,
    personaId: persona.id,
    answer: score,
    answerLabel: scale.labels ? scale.labels[score - min] : null,
    thinking,
    confidence: calculateLikertConfidence(persona, score, scale),
    responseTimeMs: generateResponseTime('likert'),
    timestamp: new Date().toISOString()
  };
}

/**
 * Generates reasoning for a Likert response
 * @param {Object} persona - Persona object
 * @param {Question} question - Question object
 * @param {number} score - Selected score
 * @param {Object} scale - Scale configuration
 * @returns {string} Reasoning explanation
 */
function generateLikertReasoning(persona, question, score, scale) {
  const { demographics, psychographics } = persona;
  const intensity = (score - scale.min) / (scale.max - scale.min);
  
  let intensityWord;
  if (intensity < 0.2) intensityWord = 'strongly disagree with';
  else if (intensity < 0.4) intensityWord = 'somewhat disagree with';
  else if (intensity < 0.6) intensityWord = 'feel neutral about';
  else if (intensity < 0.8) intensityWord = 'somewhat agree with';
  else intensityWord = 'strongly agree with';

  return `As someone with a ${psychographics.personality} personality working as a ${demographics.occupation}, ` +
    `I ${intensityWord} this statement. My ${psychographics.lifestyle} lifestyle and values around ` +
    `${psychographics.values[0]} shape this perspective.`;
}

/**
 * Calculates confidence for a Likert response
 * @param {Object} persona - Persona object
 * @param {number} score - Selected score
 * @param {Object} scale - Scale configuration
 * @returns {number} Confidence score (0-100)
 */
function calculateLikertConfidence(persona, score, scale) {
  const midpoint = (scale.min + scale.max) / 2;
  const distanceFromMiddle = Math.abs(score - midpoint);
  const maxDistance = (scale.max - scale.min) / 2;
  
  // More extreme answers often indicate higher confidence
  const extremityBonus = (distanceFromMiddle / maxDistance) * 20;
  
  // Analytical types are more confident in their assessments
  const personalityBonus = persona.psychographics?.personality === 'analytical' ? 10 : 0;
  
  return Math.min(100, Math.round(60 + extremityBonus + personalityBonus + Math.random() * 15));
}

/**
 * Generates an open-ended text response
 * @param {Object} persona - Persona generating the response
 * @param {Question} question - Question to answer
 * @param {Object} [options] - Generation options
 * @returns {Response} Generated response
 */
function generateOpenEndedResponse(persona, question, options = {}) {
  const { demographics, psychographics, behaviors, context } = persona;
  const { minLength = 20, maxLength = 200 } = options;

  // Build response based on persona characteristics
  const responseFragments = [];

  // Opening based on personality
  const openings = {
    analytical: 'From my perspective,',
    creative: 'I think',
    practical: 'In my experience,',
    social: 'What I\'ve noticed is',
    ambitious: 'Looking at this strategically,',
    cautious: 'To be honest,',
    adventurous: 'I\'d say',
    nurturing: 'What matters to me is',
    independent: 'Personally,',
    collaborative: 'Based on what I\'ve discussed with others,'
  };
  
  responseFragments.push(openings[psychographics.personality] || 'I believe');

  // Content based on values and interests
  const valueConnection = `as someone who values ${psychographics.values[0]}`;
  const interestConnection = `and is interested in ${psychographics.interests[0]}`;
  
  responseFragments.push(`${valueConnection} ${interestConnection},`);

  // Context from occupation and lifestyle
  responseFragments.push(`working as a ${demographics.occupation}`);
  responseFragments.push(`with a ${psychographics.lifestyle} approach to life,`);

  // Opinion formation based on decision style
  const opinions = {
    analytical: 'I\'ve carefully considered this and feel that the key factors are quality and reliability.',
    intuitive: 'my gut tells me that authenticity and emotional connection matter most.',
    deliberate: 'after thinking about this thoroughly, I believe consistency is essential.',
    impulsive: 'what immediately stands out to me is the need for something exciting and new.'
  };

  responseFragments.push(opinions[behaviors.decisionStyle] || 'I think this is an important consideration.');

  // Add data source context if available
  if (context?.dataSourceInsights?.length > 0) {
    const insight = context.dataSourceInsights[0];
    if (insight.insights?.length > 0) {
      responseFragments.push(`This aligns with what I know about ${insight.insights[0]}.`);
    }
  }

  let response = responseFragments.join(' ');

  // Trim or expand to meet length requirements
  if (response.length > maxLength) {
    response = response.substring(0, maxLength - 3) + '...';
  }

  const thinking = `I'm drawing on my experience as a ${demographics.age}-year-old ${demographics.occupation} ` +
    `who lives a ${psychographics.lifestyle} lifestyle. My ${behaviors.decisionStyle} decision-making style ` +
    `influences how I articulate my thoughts.`;

  return {
    questionId: question.id,
    personaId: persona.id,
    answer: response,
    wordCount: response.split(/\s+/).length,
    thinking,
    confidence: Math.round(55 + Math.random() * 30),
    responseTimeMs: generateResponseTime('open_ended', response.length),
    timestamp: new Date().toISOString()
  };
}

/**
 * Generates a ranking response
 * @param {Object} persona - Persona generating the response
 * @param {Question} question - Question to answer
 * @param {Object} [calibration] - Distribution calibration settings
 * @returns {Response} Generated response
 */
function generateRankingResponse(persona, question, calibration = {}) {
  const items = question.options || [];
  if (items.length === 0) {
    throw new Error('Ranking questions must have options');
  }

  const { psychographics, behaviors } = persona;

  // Score each item based on persona traits
  const scoredItems = items.map((item, index) => {
    let score = Math.random(); // Base randomness

    // Adjust based on persona traits
    // Risk-averse prefer familiar/safe options (often earlier in list)
    if (behaviors.riskTolerance === 'low') {
      score += (items.length - index) * 0.1;
    } else if (behaviors.riskTolerance === 'high') {
      score += index * 0.05;
    }

    // Value alignment bonus
    const itemLower = item.toLowerCase();
    for (const value of psychographics.values) {
      if (itemLower.includes(value.toLowerCase())) {
        score += 0.3;
      }
    }

    // Interest alignment bonus
    for (const interest of psychographics.interests) {
      if (itemLower.includes(interest.toLowerCase())) {
        score += 0.2;
      }
    }

    return { item, index, score };
  });

  // Sort by score (descending) to create ranking
  scoredItems.sort((a, b) => b.score - a.score);
  const rankedItems = scoredItems.map(si => si.item);

  const thinking = `As someone who values ${psychographics.values.slice(0, 2).join(' and ')}, ` +
    `I prioritized "${rankedItems[0]}" because it aligns with my ${psychographics.lifestyle} lifestyle. ` +
    `"${rankedItems[rankedItems.length - 1]}" ranked last as it's less relevant to my daily life as a ${behaviors.decisionStyle} decision-maker.`;

  return {
    questionId: question.id,
    personaId: persona.id,
    answer: rankedItems,
    rankingLogic: scoredItems.map(si => ({ item: si.item, score: si.score.toFixed(3) })),
    thinking,
    confidence: Math.round(60 + Math.random() * 25),
    responseTimeMs: generateResponseTime('ranking', items.length),
    timestamp: new Date().toISOString()
  };
}

/**
 * Simulates response time based on question type
 * @param {string} questionType - Type of question
 * @param {number} [complexity=1] - Complexity factor
 * @returns {number} Simulated response time in milliseconds
 */
function generateResponseTime(questionType, complexity = 1) {
  const baseTimes = {
    multiple_choice: 3000,
    likert: 2500,
    open_ended: 15000,
    ranking: 8000,
    matrix: 5000
  };

  const baseTime = baseTimes[questionType] || 5000;
  const variance = baseTime * 0.5 * Math.random();
  const complexityMultiplier = 1 + (complexity - 1) * 0.1;

  return Math.round((baseTime + variance) * complexityMultiplier);
}

/**
 * Generates a response for a single question
 * @param {Object} persona - Persona generating the response
 * @param {Question} question - Question to answer
 * @param {Object} [options] - Generation options
 * @returns {Response} Generated response
 */
function generateResponse(persona, question, options = {}) {
  const { calibration = {} } = options;

  switch (question.type) {
    case 'multiple_choice':
      return generateMultipleChoiceResponse(persona, question, calibration);
    case 'likert':
      return generateLikertResponse(persona, question, calibration);
    case 'open_ended':
      return generateOpenEndedResponse(persona, question, options);
    case 'ranking':
      return generateRankingResponse(persona, question, calibration);
    default:
      throw new Error(`Unsupported question type: ${question.type}`);
  }
}

/**
 * Generates responses for all questions from a persona
 * @param {Object} persona - Persona generating responses
 * @param {Question[]} questions - Questions to answer
 * @param {Object} [options] - Generation options
 * @returns {ResponseGenerationResult} All generated responses
 */
function generateSurveyResponses(persona, questions, options = {}) {
  if (!persona || !persona.id) {
    throw new Error('Valid persona with ID is required');
  }

  if (!questions || questions.length === 0) {
    throw new Error('At least one question is required');
  }

  const startTime = Date.now();
  const responses = [];

  for (const question of questions) {
    try {
      const response = generateResponse(persona, question, options);
      responses.push(response);
    } catch (error) {
      // Log error but continue with other questions
      responses.push({
        questionId: question.id,
        personaId: persona.id,
        answer: null,
        error: error.message,
        thinking: 'Unable to generate response for this question.',
        confidence: 0,
        responseTimeMs: 0,
        timestamp: new Date().toISOString()
      });
    }
  }

  const totalResponseTime = responses.reduce((sum, r) => sum + r.responseTimeMs, 0);

  return {
    responses,
    metadata: {
      personaId: persona.id,
      personaName: persona.name,
      questionCount: questions.length,
      successfulResponses: responses.filter(r => r.answer !== null).length,
      totalSimulatedTimeMs: totalResponseTime,
      actualGenerationTimeMs: Date.now() - startTime,
      averageConfidence: Math.round(
        responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length
      ),
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Batch generates responses for multiple personas
 * @param {Object[]} personas - Array of personas
 * @param {Question[]} questions - Questions to answer
 * @param {Object} [options] - Generation options
 * @returns {Object} Batch generation results
 */
function batchGenerateResponses(personas, questions, options = {}) {
  const startTime = Date.now();
  const allResults = [];
  const errors = [];

  for (const persona of personas) {
    try {
      const result = generateSurveyResponses(persona, questions, options);
      allResults.push(result);
    } catch (error) {
      errors.push({
        personaId: persona?.id,
        error: error.message
      });
    }
  }

  // Flatten all responses
  const allResponses = allResults.flatMap(r => r.responses);

  return {
    results: allResults,
    allResponses,
    summary: {
      totalPersonas: personas.length,
      successfulPersonas: allResults.length,
      totalResponses: allResponses.length,
      totalQuestions: questions.length,
      errors,
      generationTimeMs: Date.now() - startTime,
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  generateResponse,
  generateSurveyResponses,
  batchGenerateResponses,
  generateMultipleChoiceResponse,
  generateLikertResponse,
  generateOpenEndedResponse,
  generateRankingResponse,
  generateResponseTime
};
