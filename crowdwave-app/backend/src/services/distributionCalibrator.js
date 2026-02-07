/**
 * @fileoverview Distribution Calibrator - Ensures realistic response distributions
 * @module services/distributionCalibrator
 */

/**
 * @typedef {Object} DistributionTarget
 * @property {string} questionId - Question ID
 * @property {string} questionType - Question type
 * @property {Object} expected - Expected distribution
 * @property {number} [expected.mean] - Target mean (for Likert)
 * @property {number} [expected.stdDev] - Target standard deviation
 * @property {Object} [expected.frequencies] - Target frequencies (for multiple choice)
 * @property {number} [tolerance] - Acceptable deviation from target (0-1)
 */

/**
 * @typedef {Object} DistributionAnalysis
 * @property {Object} actual - Actual distribution observed
 * @property {Object} expected - Expected distribution
 * @property {number} deviation - Deviation from expected (0-1)
 * @property {boolean} withinTolerance - Whether distribution is acceptable
 * @property {string[]} recommendations - Suggestions for improvement
 */

/**
 * @typedef {Object} CalibrationSettings
 * @property {number} temperature - Response temperature (0-2, higher = more variance)
 * @property {number} biasFactor - Bias adjustment factor
 * @property {Object} segmentWeights - Per-segment weight adjustments
 */

/**
 * Default distribution expectations for different question types
 */
const DEFAULT_DISTRIBUTIONS = {
  likert_5: {
    mean: 3.0,
    stdDev: 1.0,
    skewTolerance: 0.5
  },
  likert_7: {
    mean: 4.0,
    stdDev: 1.5,
    skewTolerance: 0.5
  },
  multiple_choice: {
    // Expect some variance, not uniform
    minOptionShare: 0.05, // No option should be below 5%
    maxOptionShare: 0.60, // No option should exceed 60%
    entropyTarget: 0.7 // Target entropy relative to uniform (1.0 = uniform)
  },
  ranking: {
    // Each position should see variety
    positionVariance: 0.3 // Min variance per position
  }
};

/**
 * Calculates the mean of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {number} Mean value
 */
function calculateMean(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculates the standard deviation of an array of numbers
 * @param {number[]} values - Array of numeric values
 * @param {number} [mean] - Pre-calculated mean
 * @returns {number} Standard deviation
 */
function calculateStdDev(values, mean) {
  if (!values || values.length < 2) return 0;
  const m = mean ?? calculateMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - m, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

/**
 * Calculates Shannon entropy of a distribution
 * @param {number[]} frequencies - Array of frequencies/counts
 * @returns {number} Entropy value
 */
function calculateEntropy(frequencies) {
  const total = frequencies.reduce((sum, f) => sum + f, 0);
  if (total === 0) return 0;

  const probabilities = frequencies.map(f => f / total);
  return -probabilities
    .filter(p => p > 0)
    .reduce((sum, p) => sum + p * Math.log2(p), 0);
}

/**
 * Calculates maximum possible entropy for n options
 * @param {number} n - Number of options
 * @returns {number} Maximum entropy
 */
function maxEntropy(n) {
  return Math.log2(n);
}

/**
 * Analyzes the distribution of Likert responses
 * @param {Object[]} responses - Array of responses
 * @param {Object} scale - Scale configuration {min, max}
 * @param {Object} [expected] - Expected distribution parameters
 * @returns {DistributionAnalysis} Analysis results
 */
function analyzeLikertDistribution(responses, scale, expected = {}) {
  const values = responses.map(r => r.answer).filter(v => typeof v === 'number');
  
  if (values.length === 0) {
    return {
      actual: { mean: null, stdDev: null, count: 0 },
      expected,
      deviation: 1,
      withinTolerance: false,
      recommendations: ['No valid responses to analyze']
    };
  }

  const range = scale.max - scale.min;
  const defaultMean = (scale.min + scale.max) / 2;
  const defaultStdDev = range / 4;

  const actualMean = calculateMean(values);
  const actualStdDev = calculateStdDev(values, actualMean);
  const expectedMean = expected.mean ?? defaultMean;
  const expectedStdDev = expected.stdDev ?? defaultStdDev;

  // Calculate deviation
  const meanDeviation = Math.abs(actualMean - expectedMean) / range;
  const stdDevDeviation = Math.abs(actualStdDev - expectedStdDev) / range;
  const overallDeviation = (meanDeviation + stdDevDeviation) / 2;

  const tolerance = expected.tolerance ?? 0.2;
  const withinTolerance = overallDeviation <= tolerance;

  // Generate recommendations
  const recommendations = [];
  if (meanDeviation > tolerance) {
    if (actualMean > expectedMean) {
      recommendations.push(`Mean is ${(meanDeviation * 100).toFixed(1)}% higher than expected. Consider adding personas with more critical perspectives.`);
    } else {
      recommendations.push(`Mean is ${(meanDeviation * 100).toFixed(1)}% lower than expected. Consider adding personas with more positive perspectives.`);
    }
  }

  if (actualStdDev < expectedStdDev * 0.5) {
    recommendations.push('Responses are too clustered. Increase temperature or add more diverse persona segments.');
  } else if (actualStdDev > expectedStdDev * 1.5) {
    recommendations.push('Responses have high variance. Consider if segment definitions are too broad.');
  }

  // Check for edge clustering
  const edgeResponses = values.filter(v => v === scale.min || v === scale.max).length;
  if (edgeResponses / values.length > 0.4) {
    recommendations.push('Many responses at scale extremes. This may indicate polarized segments or calibration issues.');
  }

  return {
    actual: {
      mean: actualMean,
      stdDev: actualStdDev,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
      histogram: generateHistogram(values, scale.min, scale.max)
    },
    expected: {
      mean: expectedMean,
      stdDev: expectedStdDev
    },
    deviation: overallDeviation,
    withinTolerance,
    recommendations
  };
}

/**
 * Generates a histogram for numeric values
 * @param {number[]} values - Array of values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {Object} Histogram with counts per value
 */
function generateHistogram(values, min, max) {
  const histogram = {};
  for (let i = min; i <= max; i++) {
    histogram[i] = 0;
  }
  for (const v of values) {
    if (histogram[v] !== undefined) {
      histogram[v]++;
    }
  }
  return histogram;
}

/**
 * Analyzes the distribution of multiple choice responses
 * @param {Object[]} responses - Array of responses
 * @param {string[]} options - Available options
 * @param {Object} [expected] - Expected distribution parameters
 * @returns {DistributionAnalysis} Analysis results
 */
function analyzeMultipleChoiceDistribution(responses, options, expected = {}) {
  const answers = responses.map(r => r.answer).filter(Boolean);
  const total = answers.length;

  if (total === 0) {
    return {
      actual: { frequencies: {}, count: 0 },
      expected,
      deviation: 1,
      withinTolerance: false,
      recommendations: ['No valid responses to analyze']
    };
  }

  // Count frequencies
  const frequencies = {};
  for (const opt of options) {
    frequencies[opt] = 0;
  }
  for (const answer of answers) {
    if (frequencies[answer] !== undefined) {
      frequencies[answer]++;
    }
  }

  // Calculate proportions
  const proportions = {};
  for (const [opt, count] of Object.entries(frequencies)) {
    proportions[opt] = count / total;
  }

  // Calculate entropy
  const actualEntropy = calculateEntropy(Object.values(frequencies));
  const maxEnt = maxEntropy(options.length);
  const normalizedEntropy = actualEntropy / maxEnt;

  // Check against expected frequencies if provided
  let deviation = 0;
  if (expected.frequencies) {
    const expectedTotal = Object.values(expected.frequencies).reduce((a, b) => a + b, 0);
    for (const opt of options) {
      const expectedProp = (expected.frequencies[opt] || 0) / expectedTotal;
      const actualProp = proportions[opt] || 0;
      deviation += Math.abs(expectedProp - actualProp);
    }
    deviation /= options.length;
  } else {
    // Check against entropy target
    const entropyTarget = expected.entropyTarget ?? DEFAULT_DISTRIBUTIONS.multiple_choice.entropyTarget;
    deviation = Math.abs(normalizedEntropy - entropyTarget);
  }

  const tolerance = expected.tolerance ?? 0.25;
  const withinTolerance = deviation <= tolerance;

  // Generate recommendations
  const recommendations = [];
  const minShare = DEFAULT_DISTRIBUTIONS.multiple_choice.minOptionShare;
  const maxShare = DEFAULT_DISTRIBUTIONS.multiple_choice.maxOptionShare;

  for (const [opt, prop] of Object.entries(proportions)) {
    if (prop < minShare && total > 10) {
      recommendations.push(`Option "${opt}" is underrepresented (${(prop * 100).toFixed(1)}%). Consider if this reflects reality or needs calibration.`);
    }
    if (prop > maxShare) {
      recommendations.push(`Option "${opt}" is dominating (${(prop * 100).toFixed(1)}%). Increase variance or check segment diversity.`);
    }
  }

  if (normalizedEntropy < 0.5) {
    recommendations.push('Response distribution has low entropy (concentrated). Consider increasing temperature for more variance.');
  }

  return {
    actual: {
      frequencies,
      proportions,
      entropy: actualEntropy,
      normalizedEntropy,
      count: total
    },
    expected: {
      frequencies: expected.frequencies,
      entropyTarget: expected.entropyTarget ?? DEFAULT_DISTRIBUTIONS.multiple_choice.entropyTarget
    },
    deviation,
    withinTolerance,
    recommendations
  };
}

/**
 * Analyzes the distribution of ranking responses
 * @param {Object[]} responses - Array of responses
 * @param {string[]} items - Items being ranked
 * @param {Object} [expected] - Expected distribution parameters
 * @returns {DistributionAnalysis} Analysis results
 */
function analyzeRankingDistribution(responses, items, expected = {}) {
  const rankings = responses.map(r => r.answer).filter(Array.isArray);
  const total = rankings.length;

  if (total === 0) {
    return {
      actual: { positionFrequencies: {}, count: 0 },
      expected,
      deviation: 1,
      withinTolerance: false,
      recommendations: ['No valid responses to analyze']
    };
  }

  // Calculate position frequencies for each item
  const positionFrequencies = {};
  for (const item of items) {
    positionFrequencies[item] = {};
    for (let pos = 0; pos < items.length; pos++) {
      positionFrequencies[item][pos] = 0;
    }
  }

  for (const ranking of rankings) {
    for (let pos = 0; pos < ranking.length; pos++) {
      const item = ranking[pos];
      if (positionFrequencies[item]) {
        positionFrequencies[item][pos]++;
      }
    }
  }

  // Calculate average position for each item
  const averagePositions = {};
  for (const [item, positions] of Object.entries(positionFrequencies)) {
    let weightedSum = 0;
    let count = 0;
    for (const [pos, freq] of Object.entries(positions)) {
      weightedSum += parseInt(pos) * freq;
      count += freq;
    }
    averagePositions[item] = count > 0 ? weightedSum / count : null;
  }

  // Calculate variance per position
  const positionVariances = [];
  for (let pos = 0; pos < items.length; pos++) {
    const countsAtPosition = items.map(item => positionFrequencies[item][pos]);
    const variance = calculateStdDev(countsAtPosition) / total;
    positionVariances.push(variance);
  }

  const averageVariance = calculateMean(positionVariances);
  const targetVariance = expected.positionVariance ?? DEFAULT_DISTRIBUTIONS.ranking.positionVariance;
  const deviation = Math.abs(averageVariance - targetVariance);

  const tolerance = expected.tolerance ?? 0.2;
  const withinTolerance = deviation <= tolerance;

  // Generate recommendations
  const recommendations = [];

  if (averageVariance < targetVariance * 0.5) {
    recommendations.push('Rankings are too consistent across personas. Increase diversity in persona segments.');
  }

  // Check for items that always rank first or last
  for (const item of items) {
    const firstCount = positionFrequencies[item][0] / total;
    const lastCount = positionFrequencies[item][items.length - 1] / total;

    if (firstCount > 0.6) {
      recommendations.push(`"${item}" is ranked first ${(firstCount * 100).toFixed(0)}% of the time. Consider if this is realistic.`);
    }
    if (lastCount > 0.6) {
      recommendations.push(`"${item}" is ranked last ${(lastCount * 100).toFixed(0)}% of the time. Consider if this is realistic.`);
    }
  }

  return {
    actual: {
      positionFrequencies,
      averagePositions,
      positionVariances,
      averageVariance,
      count: total
    },
    expected: {
      positionVariance: targetVariance
    },
    deviation,
    withinTolerance,
    recommendations
  };
}

/**
 * Generates calibration settings based on distribution analysis
 * @param {DistributionAnalysis} analysis - Analysis of current distribution
 * @param {string} questionType - Type of question
 * @returns {CalibrationSettings} Recommended calibration settings
 */
function generateCalibrationSettings(analysis, questionType) {
  const settings = {
    temperature: 1.0,
    biasFactor: 0,
    adjustments: {}
  };

  if (analysis.withinTolerance) {
    return settings; // No calibration needed
  }

  // Adjust temperature based on variance
  if (questionType === 'likert') {
    const { actual, expected } = analysis;
    if (actual.stdDev < expected.stdDev * 0.7) {
      settings.temperature = 1.3; // Increase variance
    } else if (actual.stdDev > expected.stdDev * 1.3) {
      settings.temperature = 0.7; // Decrease variance
    }

    // Adjust bias based on mean
    if (actual.mean < expected.mean) {
      settings.biasFactor = 0.2; // Bias toward higher values
    } else if (actual.mean > expected.mean) {
      settings.biasFactor = -0.2; // Bias toward lower values
    }
  }

  if (questionType === 'multiple_choice') {
    const { actual } = analysis;
    if (actual.normalizedEntropy < 0.5) {
      settings.temperature = 1.5; // Increase variance significantly
    } else if (actual.normalizedEntropy > 0.95) {
      settings.temperature = 0.8; // Slightly reduce variance
    }
  }

  return settings;
}

/**
 * Applies calibration to a set of response weights
 * @param {number[]} weights - Original weights
 * @param {CalibrationSettings} settings - Calibration settings
 * @returns {number[]} Calibrated weights
 */
function applyCalibration(weights, settings) {
  const { temperature, biasFactor } = settings;

  // Apply temperature scaling
  let calibrated = weights.map(w => Math.pow(w, 1 / temperature));

  // Apply bias (shift weights toward beginning or end)
  if (biasFactor !== 0) {
    calibrated = calibrated.map((w, i) => {
      const positionFactor = (i / (calibrated.length - 1)) - 0.5; // -0.5 to 0.5
      return w * (1 + biasFactor * positionFactor);
    });
  }

  // Normalize
  const sum = calibrated.reduce((a, b) => a + b, 0);
  return calibrated.map(w => w / sum);
}

/**
 * Tracks and compares expected vs actual distributions over time
 * @param {Object} tracker - Distribution tracker object
 * @param {string} questionId - Question ID
 * @param {*} response - New response to track
 * @returns {Object} Updated tracker
 */
function trackDistribution(tracker, questionId, response) {
  if (!tracker.questions) tracker.questions = {};
  if (!tracker.questions[questionId]) {
    tracker.questions[questionId] = {
      responses: [],
      lastAnalysis: null
    };
  }

  tracker.questions[questionId].responses.push(response);
  tracker.updatedAt = new Date().toISOString();

  return tracker;
}

/**
 * Analyzes distribution for any question type
 * @param {Object[]} responses - Array of responses
 * @param {Object} question - Question configuration
 * @param {Object} [expected] - Expected distribution
 * @returns {DistributionAnalysis} Analysis results
 */
function analyzeDistribution(responses, question, expected = {}) {
  switch (question.type) {
    case 'likert':
      return analyzeLikertDistribution(responses, question.scale, expected);
    case 'multiple_choice':
      return analyzeMultipleChoiceDistribution(responses, question.options, expected);
    case 'ranking':
      return analyzeRankingDistribution(responses, question.options, expected);
    default:
      return {
        actual: { count: responses.length },
        expected,
        deviation: 0,
        withinTolerance: true,
        recommendations: [`Distribution analysis not available for ${question.type} questions`]
      };
  }
}

/**
 * Generates a distribution report for a complete survey
 * @param {Object[]} responses - All responses
 * @param {Object[]} questions - All questions
 * @param {Object} [expectedDistributions] - Expected distributions per question
 * @returns {Object} Complete distribution report
 */
function generateDistributionReport(responses, questions, expectedDistributions = {}) {
  const report = {
    questionAnalyses: {},
    overallHealth: 'good',
    totalRecommendations: [],
    summary: {}
  };

  let deviationSum = 0;
  let questionsAnalyzed = 0;

  for (const question of questions) {
    const questionResponses = responses.filter(r => r.questionId === question.id);
    const expected = expectedDistributions[question.id] || {};
    
    const analysis = analyzeDistribution(questionResponses, question, expected);
    report.questionAnalyses[question.id] = analysis;

    if (!isNaN(analysis.deviation)) {
      deviationSum += analysis.deviation;
      questionsAnalyzed++;
    }

    report.totalRecommendations.push(...analysis.recommendations.map(r => ({
      questionId: question.id,
      recommendation: r
    })));
  }

  // Determine overall health
  const averageDeviation = questionsAnalyzed > 0 ? deviationSum / questionsAnalyzed : 0;
  if (averageDeviation > 0.4) {
    report.overallHealth = 'poor';
  } else if (averageDeviation > 0.2) {
    report.overallHealth = 'fair';
  }

  report.summary = {
    questionsAnalyzed,
    averageDeviation,
    questionsWithinTolerance: Object.values(report.questionAnalyses)
      .filter(a => a.withinTolerance).length,
    totalRecommendations: report.totalRecommendations.length
  };

  return report;
}

module.exports = {
  analyzeLikertDistribution,
  analyzeMultipleChoiceDistribution,
  analyzeRankingDistribution,
  analyzeDistribution,
  generateCalibrationSettings,
  applyCalibration,
  trackDistribution,
  generateDistributionReport,
  calculateMean,
  calculateStdDev,
  calculateEntropy,
  DEFAULT_DISTRIBUTIONS
};
