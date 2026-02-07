/**
 * Confidence Report Generator for Crowdwave
 * 
 * Generates per-question confidence assessments for synthetic audience research.
 * Evaluates factors affecting confidence and provides recommendations.
 * 
 * @module confidenceReport
 */

const { QUESTION_TYPES } = require('./csvExporter');

/**
 * Confidence rating thresholds
 */
const CONFIDENCE_RATINGS = {
  HIGH: { min: 80, label: 'High', color: '#27ae60', description: 'Results are highly reliable' },
  GOOD: { min: 70, label: 'Good', color: '#2ecc71', description: 'Results are reliable for most purposes' },
  MODERATE: { min: 60, label: 'Moderate', color: '#f39c12', description: 'Results should be interpreted with some caution' },
  LOW: { min: 50, label: 'Low', color: '#e67e22', description: 'Results require validation before use' },
  VERY_LOW: { min: 0, label: 'Very Low', color: '#e74c3c', description: 'Results should not be relied upon without validation' }
};

/**
 * Factors that affect confidence scoring
 */
const CONFIDENCE_FACTORS = {
  SAMPLE_SIZE: 'sample_size',
  RESPONSE_CONSISTENCY: 'response_consistency',
  PERSONA_CALIBRATION: 'persona_calibration',
  QUESTION_CLARITY: 'question_clarity',
  DISTRIBUTION_REALISM: 'distribution_realism',
  SEGMENT_COVERAGE: 'segment_coverage',
  BENCHMARK_ALIGNMENT: 'benchmark_alignment'
};

/**
 * Generate comprehensive confidence report
 * @param {Object} studyData - Complete study data
 * @returns {Object} Confidence report
 */
function generateConfidenceReport(studyData) {
  const { respondents = [], questions = [], benchmarks = {} } = studyData;

  // Calculate per-question confidence
  const questionConfidence = questions.map(q => 
    calculateQuestionConfidence(q, respondents, benchmarks)
  );

  // Calculate overall confidence
  const overallConfidence = calculateOverallConfidence(questionConfidence, studyData);

  // Identify low-confidence flags
  const lowConfidenceFlags = identifyLowConfidenceFlags(questionConfidence, studyData);

  // Generate recommendations
  const recommendations = generateConfidenceRecommendations(questionConfidence, lowConfidenceFlags);

  return {
    overallConfidence: overallConfidence.score,
    overallRating: getRating(overallConfidence.score),
    overallFactors: overallConfidence.factors,
    questions: questionConfidence,
    lowConfidenceFlags,
    recommendations,
    summary: generateConfidenceSummary(overallConfidence, questionConfidence),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Calculate confidence score for a single question
 * @param {Object} question - Question definition
 * @param {Object[]} respondents - All respondents
 * @param {Object} benchmarks - Benchmark data if available
 * @returns {Object} Question confidence assessment
 */
function calculateQuestionConfidence(question, respondents, benchmarks = {}) {
  const responses = respondents
    .map(r => r.responses?.[question.id])
    .filter(r => r !== null && r !== undefined);

  const factors = {};
  const issues = [];
  const strengths = [];

  // Factor 1: Sample Size
  const sampleSizeScore = calculateSampleSizeScore(responses.length);
  factors[CONFIDENCE_FACTORS.SAMPLE_SIZE] = {
    score: sampleSizeScore,
    weight: 0.25,
    details: `n=${responses.length}`
  };
  if (sampleSizeScore < 60) {
    issues.push({ factor: 'Sample Size', message: `Low sample (n=${responses.length}). Consider n≥100 for reliable results.` });
  } else if (sampleSizeScore >= 80) {
    strengths.push('Adequate sample size for statistical reliability');
  }

  // Factor 2: Response Consistency
  const consistencyScore = calculateConsistencyScore(responses, question);
  factors[CONFIDENCE_FACTORS.RESPONSE_CONSISTENCY] = {
    score: consistencyScore.score,
    weight: 0.20,
    details: consistencyScore.details
  };
  if (consistencyScore.score < 60) {
    issues.push({ factor: 'Consistency', message: 'High variance in responses may indicate unclear question or diverse opinions.' });
  }

  // Factor 3: Distribution Realism
  const distributionScore = calculateDistributionRealism(responses, question);
  factors[CONFIDENCE_FACTORS.DISTRIBUTION_REALISM] = {
    score: distributionScore.score,
    weight: 0.20,
    details: distributionScore.details
  };
  if (distributionScore.score < 60) {
    issues.push({ factor: 'Distribution', message: distributionScore.issue || 'Response distribution seems unrealistic.' });
  } else if (distributionScore.score >= 80) {
    strengths.push('Response distribution appears realistic');
  }

  // Factor 4: Question Clarity (based on type and response patterns)
  const clarityScore = assessQuestionClarity(question, responses);
  factors[CONFIDENCE_FACTORS.QUESTION_CLARITY] = {
    score: clarityScore.score,
    weight: 0.15,
    details: clarityScore.details
  };
  if (clarityScore.score < 60) {
    issues.push({ factor: 'Question Clarity', message: clarityScore.issue || 'Question may be ambiguous or complex.' });
  }

  // Factor 5: Segment Coverage
  const segmentScore = calculateSegmentCoverage(question, respondents);
  factors[CONFIDENCE_FACTORS.SEGMENT_COVERAGE] = {
    score: segmentScore.score,
    weight: 0.10,
    details: segmentScore.details
  };

  // Factor 6: Benchmark Alignment (if benchmarks available)
  const benchmarkData = benchmarks[question.id];
  if (benchmarkData) {
    const alignmentScore = calculateBenchmarkAlignment(responses, question, benchmarkData);
    factors[CONFIDENCE_FACTORS.BENCHMARK_ALIGNMENT] = {
      score: alignmentScore.score,
      weight: 0.10,
      details: alignmentScore.details
    };
    if (alignmentScore.score >= 80) {
      strengths.push('Results align with benchmark data');
    } else if (alignmentScore.score < 60) {
      issues.push({ factor: 'Benchmark', message: 'Results deviate from benchmark data.' });
    }
  }

  // Calculate weighted score
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, factor] of Object.entries(factors)) {
    weightedSum += factor.score * factor.weight;
    totalWeight += factor.weight;
  }
  const confidenceScore = totalWeight > 0 ? weightedSum / totalWeight : 50;

  return {
    questionId: question.id,
    questionText: question.text,
    questionType: question.type,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    rating: getRating(confidenceScore),
    factors,
    issues,
    strengths,
    recommendation: generateQuestionRecommendation(confidenceScore, issues)
  };
}

/**
 * Calculate sample size confidence score
 */
function calculateSampleSizeScore(n) {
  // Ideal: n≥100 for most research
  // Minimum: n≥30 for basic statistics
  if (n >= 500) return 100;
  if (n >= 200) return 90;
  if (n >= 100) return 80;
  if (n >= 50) return 65;
  if (n >= 30) return 50;
  if (n >= 10) return 35;
  return 20;
}

/**
 * Calculate response consistency score
 */
function calculateConsistencyScore(responses, question) {
  if (responses.length < 5) {
    return { score: 40, details: 'Insufficient data for consistency analysis' };
  }

  // For numeric questions, check standard deviation
  if ([QUESTION_TYPES.SCALE, QUESTION_TYPES.NET_PROMOTER].includes(question.type)) {
    const nums = responses.filter(r => typeof r === 'number');
    if (nums.length < 5) {
      return { score: 50, details: 'Limited numeric responses' };
    }

    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / nums.length;
    const stdDev = Math.sqrt(variance);
    
    // Expected stdDev based on scale range
    const scale = question.scale || { min: 1, max: 5 };
    const range = scale.max - scale.min;
    const coefficientOfVariation = stdDev / range;

    // Lower CV = more consistent = higher score
    let score;
    if (coefficientOfVariation < 0.1) score = 95;      // Very consistent
    else if (coefficientOfVariation < 0.2) score = 85;
    else if (coefficientOfVariation < 0.3) score = 75;
    else if (coefficientOfVariation < 0.4) score = 65;
    else score = 50;                                     // High variance

    return {
      score,
      details: `CV=${(coefficientOfVariation * 100).toFixed(1)}%, σ=${stdDev.toFixed(2)}`
    };
  }

  // For choice questions, check if there's a clear preference
  const counts = {};
  for (const r of responses) {
    const key = Array.isArray(r) ? r.join('+') : String(r);
    counts[key] = (counts[key] || 0) + 1;
  }

  const sorted = Object.values(counts).sort((a, b) => b - a);
  const topPct = sorted[0] / responses.length;

  // Moderate consistency is expected and realistic
  let score;
  if (topPct > 0.9) score = 70;        // Too consistent (suspicious)
  else if (topPct > 0.7) score = 90;   // Strong but realistic consensus
  else if (topPct > 0.5) score = 85;   // Moderate consensus
  else if (topPct > 0.3) score = 75;   // Distributed opinions
  else score = 60;                      // Very fragmented

  return {
    score,
    details: `Top response: ${(topPct * 100).toFixed(1)}%`
  };
}

/**
 * Assess distribution realism
 */
function calculateDistributionRealism(responses, question) {
  if (responses.length < 10) {
    return { score: 50, details: 'Insufficient data for distribution analysis' };
  }

  // For scale questions, check for realistic distribution shape
  if ([QUESTION_TYPES.SCALE, QUESTION_TYPES.NET_PROMOTER].includes(question.type)) {
    const nums = responses.filter(r => typeof r === 'number');
    const counts = {};
    for (const n of nums) {
      counts[n] = (counts[n] || 0) + 1;
    }

    // Check for suspicious patterns
    const values = Object.values(counts);
    const maxCount = Math.max(...values);
    const totalUnique = Object.keys(counts).length;

    // Flag: All responses same value (unrealistic)
    if (totalUnique === 1) {
      return { score: 30, details: 'All responses identical', issue: 'No variance in responses - unrealistic distribution' };
    }

    // Flag: Perfect uniform distribution (unlikely in real data)
    const isUniform = values.every(v => Math.abs(v - values[0]) < 2);
    if (isUniform && totalUnique > 3) {
      return { score: 60, details: 'Suspiciously uniform distribution', issue: 'Distribution may be artificially uniform' };
    }

    // Normal-ish distribution is good
    return { score: 85, details: `${totalUnique} unique values observed` };
  }

  // For choice questions, check for realistic spread
  const counts = {};
  for (const r of responses) {
    const key = String(r);
    counts[key] = (counts[key] || 0) + 1;
  }

  const percentages = Object.values(counts).map(c => c / responses.length);
  
  // Flag: One option has 100%
  if (percentages.some(p => p === 1)) {
    return { score: 30, details: 'Single option selected by all', issue: 'Unanimous agreement is rare in real audiences' };
  }

  // Flag: All options equal (suspicious)
  const isEqual = percentages.every(p => Math.abs(p - percentages[0]) < 0.05);
  if (isEqual && percentages.length > 2) {
    return { score: 65, details: 'Suspiciously equal distribution' };
  }

  return { score: 80, details: `${Object.keys(counts).length} options selected` };
}

/**
 * Assess question clarity based on response patterns
 */
function assessQuestionClarity(question, responses) {
  // Short question text is typically clearer
  const textLength = (question.text || '').length;
  let lengthScore = textLength < 100 ? 90 : textLength < 200 ? 75 : 60;

  // Questions with clear type are easier to answer
  const typeClarity = {
    [QUESTION_TYPES.YES_NO]: 95,
    [QUESTION_TYPES.SINGLE_CHOICE]: 85,
    [QUESTION_TYPES.SCALE]: 85,
    [QUESTION_TYPES.NET_PROMOTER]: 80,
    [QUESTION_TYPES.MULTIPLE_CHOICE]: 75,
    [QUESTION_TYPES.RANKING]: 70,
    [QUESTION_TYPES.MATRIX]: 65,
    [QUESTION_TYPES.OPEN_TEXT]: 70
  };
  const typeScore = typeClarity[question.type] || 70;

  // Check for non-responses (might indicate confusion)
  const nonResponseRate = 1 - (responses.length / (responses.length || 1));
  const completionScore = nonResponseRate < 0.05 ? 90 : nonResponseRate < 0.1 ? 75 : 60;

  const score = (lengthScore + typeScore + completionScore) / 3;

  return {
    score: Math.round(score),
    details: `${textLength} chars, ${question.type}`,
    issue: score < 60 ? 'Question complexity may affect response quality' : null
  };
}

/**
 * Calculate segment coverage score
 */
function calculateSegmentCoverage(question, respondents) {
  const segmentResponses = {};
  
  for (const r of respondents) {
    const seg = r.segment || 'Unknown';
    if (r.responses?.[question.id] != null) {
      segmentResponses[seg] = (segmentResponses[seg] || 0) + 1;
    }
  }

  const segments = Object.keys(segmentResponses);
  const counts = Object.values(segmentResponses);

  if (segments.length === 0) {
    return { score: 50, details: 'No segment data' };
  }

  // Check for balanced representation
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const ratio = min / max;

  let score;
  if (segments.length >= 3 && ratio >= 0.5) score = 90;
  else if (segments.length >= 2 && ratio >= 0.3) score = 75;
  else if (segments.length >= 2) score = 60;
  else score = 50;

  return {
    score,
    details: `${segments.length} segments, balance ratio ${ratio.toFixed(2)}`
  };
}

/**
 * Calculate alignment with benchmark data
 */
function calculateBenchmarkAlignment(responses, question, benchmarkData) {
  // benchmarkData should contain expected distribution
  if (!benchmarkData.expected) {
    return { score: 70, details: 'No benchmark comparison available' };
  }

  // Calculate actual distribution
  const actual = {};
  for (const r of responses) {
    const key = String(r);
    actual[key] = (actual[key] || 0) / responses.length;
  }

  // Compare with expected
  let totalDeviation = 0;
  let comparisons = 0;

  for (const [key, expectedPct] of Object.entries(benchmarkData.expected)) {
    const actualPct = actual[key] || 0;
    totalDeviation += Math.abs(actualPct - expectedPct);
    comparisons++;
  }

  const avgDeviation = comparisons > 0 ? totalDeviation / comparisons : 0;

  // Score based on deviation
  let score;
  if (avgDeviation < 0.05) score = 95;     // <5% deviation
  else if (avgDeviation < 0.10) score = 85;
  else if (avgDeviation < 0.15) score = 70;
  else if (avgDeviation < 0.20) score = 55;
  else score = 40;

  return {
    score,
    details: `Avg deviation: ${(avgDeviation * 100).toFixed(1)}%`
  };
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(questionConfidence, studyData) {
  const { respondents = [] } = studyData;

  // Average of question confidence scores
  const questionScores = questionConfidence.map(q => q.confidenceScore);
  const avgQuestionScore = questionScores.length > 0
    ? questionScores.reduce((a, b) => a + b, 0) / questionScores.length
    : 50;

  // Study-level factors
  const factors = {};

  // Overall sample size
  const sampleScore = calculateSampleSizeScore(respondents.length);
  factors.sampleSize = { score: sampleScore, weight: 0.3 };

  // Segment diversity
  const segments = [...new Set(respondents.map(r => r.segment).filter(Boolean))];
  const segmentScore = segments.length >= 3 ? 90 : segments.length === 2 ? 70 : 50;
  factors.segmentDiversity = { score: segmentScore, weight: 0.15 };

  // Question scores
  factors.questionQuality = { score: avgQuestionScore, weight: 0.55 };

  // Calculate weighted overall
  let totalWeight = 0;
  let weightedSum = 0;
  for (const factor of Object.values(factors)) {
    weightedSum += factor.score * factor.weight;
    totalWeight += factor.weight;
  }

  return {
    score: Math.round((weightedSum / totalWeight) * 100) / 100,
    factors
  };
}

/**
 * Identify flags for low confidence results
 */
function identifyLowConfidenceFlags(questionConfidence, studyData) {
  const flags = [];
  const { respondents = [] } = studyData;

  // Study-level flags
  if (respondents.length < 50) {
    flags.push({
      level: 'warning',
      scope: 'study',
      message: `Small sample size (n=${respondents.length}). Results have higher margin of error.`,
      recommendation: 'Increase sample size to n≥100 for more reliable results.'
    });
  }

  const segments = [...new Set(respondents.map(r => r.segment).filter(Boolean))];
  if (segments.length < 2) {
    flags.push({
      level: 'info',
      scope: 'study',
      message: 'Single segment analyzed. Cross-segment validation not possible.',
      recommendation: 'Consider adding additional segments for comparison.'
    });
  }

  // Question-level flags
  for (const q of questionConfidence) {
    if (q.confidenceScore < 50) {
      flags.push({
        level: 'critical',
        scope: 'question',
        questionId: q.questionId,
        message: `Very low confidence for "${q.questionText.substring(0, 50)}..."`,
        issues: q.issues,
        recommendation: q.recommendation
      });
    } else if (q.confidenceScore < 70) {
      flags.push({
        level: 'warning',
        scope: 'question',
        questionId: q.questionId,
        message: `Moderate confidence for "${q.questionText.substring(0, 50)}..."`,
        issues: q.issues,
        recommendation: q.recommendation
      });
    }
  }

  return flags;
}

/**
 * Generate recommendations based on confidence analysis
 */
function generateConfidenceRecommendations(questionConfidence, flags) {
  const recommendations = [];

  // Critical flags first
  const criticalFlags = flags.filter(f => f.level === 'critical');
  if (criticalFlags.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'validation',
      action: 'Do not rely on low-confidence results without validation',
      details: `${criticalFlags.length} questions have critical confidence issues`,
      affectedQuestions: criticalFlags.map(f => f.questionId).filter(Boolean)
    });
  }

  // Sample size issues
  const sampleFlags = flags.filter(f => f.message.includes('sample size'));
  if (sampleFlags.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'methodology',
      action: 'Increase synthetic panel size',
      details: 'Sample size of at least 100 recommended for reliable statistical inference'
    });
  }

  // Question-specific improvements
  const questionIssues = {};
  for (const q of questionConfidence) {
    for (const issue of q.issues) {
      const factor = issue.factor;
      questionIssues[factor] = questionIssues[factor] || [];
      questionIssues[factor].push(q.questionId);
    }
  }

  if (questionIssues['Question Clarity']?.length > 2) {
    recommendations.push({
      priority: 'medium',
      category: 'question_design',
      action: 'Review and simplify complex questions',
      details: `${questionIssues['Question Clarity'].length} questions may benefit from clearer wording`
    });
  }

  if (questionIssues['Distribution']?.length > 2) {
    recommendations.push({
      priority: 'medium',
      category: 'calibration',
      action: 'Review persona calibration for realistic response distributions',
      details: 'Several questions show unrealistic response patterns'
    });
  }

  // If overall confidence is good
  if (flags.length === 0) {
    recommendations.push({
      priority: 'low',
      category: 'validation',
      action: 'Consider spot-checking results with real-world data',
      details: 'Confidence is high, but periodic validation maintains accuracy'
    });
  }

  return recommendations;
}

/**
 * Generate recommendation for a specific question
 */
function generateQuestionRecommendation(score, issues) {
  if (score >= 80) {
    return 'Results are reliable for decision-making.';
  }
  
  if (score >= 60) {
    return 'Results are directionally useful but consider validation for critical decisions.';
  }

  if (issues.length > 0) {
    const topIssue = issues[0];
    return `Address ${topIssue.factor.toLowerCase()} concerns: ${topIssue.message}`;
  }

  return 'Review question design and consider additional calibration.';
}

/**
 * Get rating label from score
 */
function getRating(score) {
  for (const [key, rating] of Object.entries(CONFIDENCE_RATINGS)) {
    if (score >= rating.min) {
      return rating.label;
    }
  }
  return CONFIDENCE_RATINGS.VERY_LOW.label;
}

/**
 * Generate confidence summary text
 */
function generateConfidenceSummary(overallConfidence, questionConfidence) {
  const score = overallConfidence.score;
  const rating = getRating(score);
  
  const highConfidence = questionConfidence.filter(q => q.confidenceScore >= 80).length;
  const lowConfidence = questionConfidence.filter(q => q.confidenceScore < 60).length;
  const total = questionConfidence.length;

  let summary = `Overall confidence is ${rating.toLowerCase()} at ${score.toFixed(1)}%. `;

  if (highConfidence === total) {
    summary += 'All questions show high confidence. Results are suitable for decision-making.';
  } else if (lowConfidence === 0) {
    summary += `${highConfidence} of ${total} questions have high confidence. Results are generally reliable.`;
  } else if (lowConfidence > total / 2) {
    summary += `${lowConfidence} of ${total} questions have low confidence. Results require careful interpretation and validation.`;
  } else {
    summary += `Mixed confidence across questions. Review flagged items before acting on results.`;
  }

  return summary;
}

/**
 * Format confidence report for display
 * @param {Object} report - Confidence report
 * @returns {Object} Display-formatted report
 */
function formatForDisplay(report) {
  return {
    overallScore: {
      value: report.overallConfidence,
      rating: report.overallRating,
      color: Object.values(CONFIDENCE_RATINGS).find(r => r.label === report.overallRating)?.color || '#666'
    },
    summary: report.summary,
    questionScores: report.questions.map(q => ({
      id: q.questionId,
      text: q.questionText.substring(0, 50) + (q.questionText.length > 50 ? '...' : ''),
      score: q.confidenceScore,
      rating: q.rating,
      hasIssues: q.issues.length > 0
    })),
    flags: report.lowConfidenceFlags.map(f => ({
      level: f.level,
      message: f.message,
      icon: f.level === 'critical' ? '🔴' : f.level === 'warning' ? '🟡' : 'ℹ️'
    })),
    actionItems: report.recommendations.filter(r => r.priority === 'high').length
  };
}

module.exports = {
  generateConfidenceReport,
  calculateQuestionConfidence,
  formatForDisplay,
  getRating,
  CONFIDENCE_RATINGS,
  CONFIDENCE_FACTORS
};
