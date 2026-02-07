/**
 * Insights Generator for Crowdwave
 * 
 * Generates summary insights from synthetic audience research data.
 * Produces key findings, segment comparisons, statistical summaries,
 * and identifies notable patterns.
 * 
 * @module insightsGenerator
 */

const { QUESTION_TYPES } = require('./csvExporter');

/**
 * Insight severity levels
 */
const INSIGHT_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Generate comprehensive insights from study data
 * Supports both new format (studyData object) and legacy format (separate arrays)
 * @param {Object|Array} questionsOrStudyData - Study data object or questions array
 * @param {Array} [respondents] - Respondents array (legacy format)
 * @param {Array} [segments] - Segments array (legacy format)
 * @returns {Object} Structured insights object
 */
async function generateInsights(questionsOrStudyData, respondents, segments) {
  // Handle both new and legacy API
  let studyData;
  if (Array.isArray(questionsOrStudyData)) {
    // Legacy format: generateInsights(questions, respondents, segments)
    studyData = {
      questions: questionsOrStudyData,
      respondents: respondents || [],
      segments: segments || []
    };
  } else {
    // New format: generateInsights(studyData)
    studyData = questionsOrStudyData;
  }

  const { 
    respondents: resps = [], 
    questions = [], 
    segments: segs = [],
    studyMetadata = {} 
  } = studyData;

  const insights = {
    summary: generateSummary(questions, resps, segs, studyMetadata),
    keyFindings: [],
    questionInsights: {},
    by_question: {},      // Legacy compatibility
    by_segment: {},       // Legacy compatibility
    segmentComparisons: null,
    cross_segment_comparisons: [], // Legacy compatibility
    patterns: [],
    outliers: [],
    recommendations: [],
    statistical_summary: generateStatisticalSummary(resps, questions),
    generatedAt: new Date().toISOString()
  };

  // Generate per-question insights
  for (const question of questions) {
    const analysis = analyzeQuestion(question, resps);
    insights.by_question[question.id] = analysis;
    insights.questionInsights[question.id] = {
      questionText: question.question || question.text,
      type: question.type,
      n: analysis.response_count,
      statistics: extractStatistics(analysis),
      distribution: analysis.distribution || {},
      chartData: formatChartData(analysis, question),
      interpretation: analysis.interpretation || generateInterpretation(analysis, question)
    };
  }

  // Generate segment insights
  for (const segment of segs) {
    insights.by_segment[segment.id] = analyzeSegment(segment, resps, questions);
  }

  // Cross-segment comparisons
  if (segs.length > 1) {
    insights.cross_segment_comparisons = generateCrossSegmentInsights(segs, resps, questions);
    insights.segmentComparisons = {
      available: true,
      segmentsCompared: segs.map(s => s.name),
      comparisons: insights.cross_segment_comparisons.map(c => ({
        questionId: c.question_id,
        questionText: c.question_text,
        segmentStats: c.segment_results,
        significantDifferences: [{ description: c.insight }],
        chartData: formatSegmentChartData(c.segment_results, questions.find(q => q.id === c.question_id))
      }))
    };
  } else {
    insights.segmentComparisons = { available: false, message: 'Need 2+ segments for comparison' };
  }

  // Generate key findings
  insights.keyFindings = extractKeyFindings(insights, studyData);
  insights.key_findings = insights.keyFindings.map(f => ({
    type: f.type,
    finding: f.finding,
    question_id: f.questionId
  }));

  // Identify patterns
  insights.patterns = identifyPatterns(studyData, insights);

  // Identify outliers
  insights.outliers = identifyOutliers(studyData);

  // Generate recommendations
  insights.recommendations = generateRecommendations(insights, studyData);

  return insights;
}

/**
 * Generate executive summary
 */
function generateSummary(questions, respondents, segments, metadata = {}) {
  const segmentCounts = {};
  for (const r of respondents) {
    const seg = r.segment_id || r.segment || 'Unknown';
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
  }

  return {
    // New format
    totalRespondents: respondents.length,
    totalQuestions: questions.length,
    segmentsAnalyzed: segments.length || Object.keys(segmentCounts).length,
    segmentBreakdown: segmentCounts,
    studyTitle: metadata.title || 'Untitled Study',
    studyObjective: metadata.objective || '',
    completionRate: calculateCompletionRate(respondents, questions),
    averageConfidence: calculateAverageConfidence(respondents),
    
    // Legacy format compatibility
    total_respondents: respondents.length,
    segments_analyzed: segments.length || Object.keys(segmentCounts).length,
    questions_asked: questions.length,
    question_types: [...new Set(questions.map(q => q.type))],
    segments_breakdown: segments.map(s => ({
      name: s.name,
      count: respondents.filter(r => r.segment_id === s.id).length
    }))
  };
}

/**
 * Analyze a single question
 */
function analyzeQuestion(question, respondents) {
  const responses = respondents
    .map(r => {
      const resp = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
      let answer;
      if (Array.isArray(resp)) {
        const found = resp.find(x => x.question_id === question.id);
        answer = found?.answer;
      } else {
        answer = resp?.[question.id];
      }
      return answer !== undefined ? { 
        answer, 
        segment_id: r.segment_id || r.segment,
        segment_name: r.segment_name || r.segment
      } : null;
    })
    .filter(Boolean);

  const analysis = {
    question_id: question.id,
    question_text: question.question || question.text,
    question_type: question.type,
    response_count: responses.length,
    n: responses.length
  };

  switch (question.type) {
    case 'multiple_choice':
    case 'single_choice':
      Object.assign(analysis, analyzeMultipleChoice(question, responses));
      break;
    case 'likert':
    case 'scale':
      Object.assign(analysis, analyzeLikert(question, responses));
      break;
    case 'open_ended':
    case 'open_text':
      Object.assign(analysis, analyzeOpenEnded(question, responses));
      break;
    case 'ranking':
      Object.assign(analysis, analyzeRanking(question, responses));
      break;
    case 'nps':
      Object.assign(analysis, analyzeNPS(question, responses));
      break;
    case 'yes_no':
      Object.assign(analysis, analyzeYesNo(question, responses));
      break;
  }

  return analysis;
}

/**
 * Analyze multiple choice responses
 */
function analyzeMultipleChoice(question, responses) {
  const counts = {};
  const bySegment = {};

  for (const resp of responses) {
    const answer = resp.answer;
    counts[answer] = (counts[answer] || 0) + 1;
    
    const segId = resp.segment_id || 'default';
    if (!bySegment[segId]) {
      bySegment[segId] = { segment_name: resp.segment_name || segId, counts: {} };
    }
    bySegment[segId].counts[answer] = (bySegment[segId].counts[answer] || 0) + 1;
  }

  const total = responses.length;
  const distribution = {};
  for (const [option, count] of Object.entries(counts)) {
    distribution[option] = {
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    };
  }

  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return {
    distribution,
    by_segment: Object.entries(bySegment).map(([id, data]) => ({
      segment_id: id,
      segment_name: data.segment_name,
      distribution: Object.entries(data.counts).map(([opt, cnt]) => ({
        option: opt,
        count: cnt,
        percentage: Math.round((cnt / Object.values(data.counts).reduce((a, b) => a + b, 0)) * 100)
      }))
    })),
    top_answer: winner ? { 
      option: winner[0], 
      count: winner[1], 
      percentage: total > 0 ? Math.round((winner[1] / total) * 100) : 0 
    } : null,
    topResponse: winner?.[0],
    topResponsePct: total > 0 ? ((winner?.[1] || 0) / total * 100).toFixed(1) : '0'
  };
}

/**
 * Analyze Likert scale responses
 */
function analyzeLikert(question, responses) {
  const ratings = responses.map(r => r.answer).filter(r => typeof r === 'number');
  const scale = question.scale || 5;
  
  if (ratings.length === 0) {
    return { mean: null, std_dev: null, distribution: {} };
  }
  
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
  const stdDev = Math.sqrt(variance);
  
  const distribution = {};
  for (let i = 1; i <= scale; i++) {
    const count = ratings.filter(r => r === i).length;
    distribution[i] = {
      count,
      percentage: Math.round((count / ratings.length) * 100)
    };
  }

  const bySegment = {};
  for (const resp of responses) {
    const segId = resp.segment_id || 'default';
    if (!bySegment[segId]) {
      bySegment[segId] = { segment_name: resp.segment_name || segId, ratings: [] };
    }
    if (typeof resp.answer === 'number') {
      bySegment[segId].ratings.push(resp.answer);
    }
  }

  const segmentStats = Object.entries(bySegment).map(([id, data]) => {
    const segMean = data.ratings.length > 0 
      ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length 
      : 0;
    return {
      segment_id: id,
      segment_name: data.segment_name,
      mean: Math.round(segMean * 100) / 100,
      count: data.ratings.length
    };
  });

  return {
    scale,
    mean: Math.round(mean * 100) / 100,
    std_dev: Math.round(stdDev * 100) / 100,
    median: calculateMedian(ratings),
    min: Math.min(...ratings),
    max: Math.max(...ratings),
    distribution,
    by_segment: segmentStats,
    interpretation: interpretLikert(mean, scale)
  };
}

/**
 * Analyze NPS responses
 */
function analyzeNPS(question, responses) {
  const ratings = responses.map(r => r.answer).filter(r => typeof r === 'number' && r >= 0 && r <= 10);
  
  if (ratings.length === 0) {
    return { nps: null };
  }

  const promoters = ratings.filter(r => r >= 9).length;
  const detractors = ratings.filter(r => r <= 6).length;
  const passives = ratings.filter(r => r === 7 || r === 8).length;
  
  const nps = Math.round(((promoters - detractors) / ratings.length) * 100);
  
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  
  const distribution = {};
  for (let i = 0; i <= 10; i++) {
    const count = ratings.filter(r => r === i).length;
    distribution[i] = {
      count,
      percentage: Math.round((count / ratings.length) * 100)
    };
  }

  return {
    nps,
    promoters,
    detractors,
    passives,
    promotersPct: Math.round((promoters / ratings.length) * 100),
    detractorsPct: Math.round((detractors / ratings.length) * 100),
    passivesPct: Math.round((passives / ratings.length) * 100),
    mean: Math.round(mean * 100) / 100,
    distribution,
    interpretation: nps >= 50 ? 'Excellent' : nps >= 0 ? 'Good' : 'Needs Improvement'
  };
}

/**
 * Analyze yes/no responses
 */
function analyzeYesNo(question, responses) {
  const yes = responses.filter(r => r.answer === true || r.answer === 'Yes' || r.answer === 'yes').length;
  const no = responses.filter(r => r.answer === false || r.answer === 'No' || r.answer === 'no').length;
  const total = yes + no;

  return {
    distribution: {
      'Yes': { count: yes, percentage: total > 0 ? Math.round((yes / total) * 100) : 0 },
      'No': { count: no, percentage: total > 0 ? Math.round((no / total) * 100) : 0 }
    },
    top_answer: yes >= no 
      ? { option: 'Yes', count: yes, percentage: total > 0 ? Math.round((yes / total) * 100) : 0 }
      : { option: 'No', count: no, percentage: total > 0 ? Math.round((no / total) * 100) : 0 },
    topResponse: yes >= no ? 'Yes' : 'No',
    topResponsePct: total > 0 ? ((Math.max(yes, no) / total) * 100).toFixed(1) : '0'
  };
}

/**
 * Analyze open-ended responses
 */
function analyzeOpenEnded(question, responses) {
  const allThemes = responses.flatMap(r => r.themes_reflected || []);
  const themeCounts = {};
  for (const theme of allThemes) {
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
  }

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme, count]) => ({ 
      theme, 
      count, 
      percentage: Math.round((count / responses.length) * 100) 
    }));

  const wordCounts = responses.map(r => {
    const answer = typeof r.answer === 'string' ? r.answer : '';
    return answer.split(/\s+/).filter(w => w.length > 0).length;
  });
  const avgWordCount = wordCounts.length > 0 
    ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
    : 0;

  const sampleResponses = responses
    .slice(0, 5)
    .map(r => ({
      segment: r.segment_name,
      response: String(r.answer || '').substring(0, 200) + (String(r.answer || '').length > 200 ? '...' : '')
    }));

  return {
    top_themes: topThemes,
    avg_word_count: avgWordCount,
    sample_responses: sampleResponses
  };
}

/**
 * Analyze ranking responses
 */
function analyzeRanking(question, responses) {
  const items = question.items || [];
  const avgRanks = {};

  for (const item of items) {
    avgRanks[item] = { totalRank: 0, count: 0 };
  }

  for (const resp of responses) {
    const answer = resp.answer;
    if (Array.isArray(answer)) {
      answer.forEach((item, idx) => {
        if (avgRanks[item]) {
          avgRanks[item].totalRank += idx + 1;
          avgRanks[item].count++;
        }
      });
    } else if (resp.ranking_details) {
      for (const { item, rank } of resp.ranking_details) {
        if (avgRanks[item]) {
          avgRanks[item].totalRank += rank;
          avgRanks[item].count++;
        }
      }
    }
  }

  const rankings = Object.entries(avgRanks)
    .map(([item, data]) => ({
      item,
      avg_rank: data.count > 0 ? Math.round((data.totalRank / data.count) * 100) / 100 : null,
      response_count: data.count
    }))
    .sort((a, b) => (a.avg_rank || 999) - (b.avg_rank || 999));

  return {
    rankings,
    top_item: rankings[0]?.item,
    bottom_item: rankings[rankings.length - 1]?.item
  };
}

/**
 * Analyze a segment's responses
 */
function analyzeSegment(segment, respondents, questions) {
  const segmentRespondents = respondents.filter(r => 
    r.segment_id === segment.id || r.segment === segment.id || r.segment === segment.name
  );
  
  return {
    segment_id: segment.id,
    segment_name: segment.name,
    respondent_count: segmentRespondents.length,
    traits_summary: summarizeTraits(segment.traits || {}),
    response_patterns: questions.map(q => ({
      question_id: q.id,
      question_type: q.type,
      ...getSegmentQuestionSummary(q, segmentRespondents)
    }))
  };
}

/**
 * Get summary for a question within a segment
 */
function getSegmentQuestionSummary(question, segmentRespondents) {
  const responses = segmentRespondents
    .map(r => {
      const resp = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
      if (Array.isArray(resp)) {
        return resp.find(x => x.question_id === question.id);
      }
      return resp?.[question.id] !== undefined ? { answer: resp[question.id] } : null;
    })
    .filter(Boolean);

  if (question.type === 'multiple_choice' || question.type === 'single_choice') {
    const topAnswer = getMostCommon(responses.map(r => r.answer));
    return { top_answer: topAnswer.value, percentage: topAnswer.percentage };
  }
  
  if (question.type === 'likert' || question.type === 'scale') {
    const ratings = responses.map(r => r.answer).filter(r => typeof r === 'number');
    const mean = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { mean: Math.round(mean * 100) / 100 };
  }

  return { response_count: responses.length };
}

/**
 * Generate cross-segment comparisons
 */
function generateCrossSegmentInsights(segments, respondents, questions) {
  const comparisons = [];

  for (const question of questions) {
    if (!['multiple_choice', 'single_choice', 'likert', 'scale', 'nps', 'yes_no'].includes(question.type)) {
      continue;
    }

    const segmentResults = segments.map(seg => {
      const segRespondents = respondents.filter(r => 
        r.segment_id === seg.id || r.segment === seg.id || r.segment === seg.name
      );
      
      const responses = segRespondents
        .map(r => {
          const resp = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
          if (Array.isArray(resp)) {
            return resp.find(x => x.question_id === question.id);
          }
          return resp?.[question.id] !== undefined ? { answer: resp[question.id] } : null;
        })
        .filter(Boolean);

      if (question.type === 'likert' || question.type === 'scale' || question.type === 'nps') {
        const ratings = responses.map(r => r.answer).filter(r => typeof r === 'number');
        const mean = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        return { segment: seg.name, mean: Math.round(mean * 100) / 100, count: ratings.length };
      } else {
        const topAnswer = getMostCommon(responses.map(r => r.answer));
        return { segment: seg.name, top_answer: topAnswer.value, percentage: topAnswer.percentage, count: responses.length };
      }
    });

    // Check for significant differences
    if (question.type === 'likert' || question.type === 'scale' || question.type === 'nps') {
      const means = segmentResults.map(r => r.mean).filter(m => m !== null);
      if (means.length >= 2) {
        const diff = Math.max(...means) - Math.min(...means);
        if (diff > 0.5) {
          comparisons.push({
            question_id: question.id,
            question_text: question.question || question.text,
            type: 'likert_difference',
            difference: Math.round(diff * 100) / 100,
            segment_results: segmentResults,
            insight: `Notable difference of ${Math.round(diff * 100) / 100} points between segments`
          });
        }
      }
    } else {
      const answers = segmentResults.map(r => r.top_answer).filter(Boolean);
      if (new Set(answers).size > 1) {
        comparisons.push({
          question_id: question.id,
          question_text: question.question || question.text,
          type: 'different_preferences',
          segment_results: segmentResults,
          insight: 'Segments show different preferences for this question'
        });
      }
    }
  }

  return comparisons;
}

/**
 * Extract key findings
 */
function extractKeyFindings(insights, studyData) {
  const findings = [];

  // Summary finding
  findings.push({
    level: INSIGHT_LEVELS.MEDIUM,
    type: 'summary',
    finding: `Analyzed ${insights.summary.totalRespondents} synthetic respondents across ${insights.summary.segmentsAnalyzed} segment(s)`
  });

  // Per-question findings
  for (const [qId, analysis] of Object.entries(insights.by_question)) {
    // Strong consensus
    if (analysis.top_answer && analysis.top_answer.percentage > 70) {
      findings.push({
        level: INSIGHT_LEVELS.HIGH,
        type: 'consensus',
        questionId: qId,
        questionText: analysis.question_text,
        finding: `Strong consensus: ${analysis.top_answer.percentage}% selected "${analysis.top_answer.option}"`,
        data: analysis
      });
    }

    // NPS findings
    if (analysis.nps !== undefined) {
      const level = analysis.nps >= 50 ? INSIGHT_LEVELS.HIGH : INSIGHT_LEVELS.MEDIUM;
      findings.push({
        level,
        type: 'nps',
        questionId: qId,
        questionText: analysis.question_text,
        finding: `Net Promoter Score: ${analysis.nps} (${analysis.interpretation})`,
        data: analysis
      });
    }

    // Likert sentiment
    if (analysis.mean && analysis.scale) {
      const midpoint = (analysis.scale + 1) / 2;
      if (Math.abs(analysis.mean - midpoint) > 0.5) {
        findings.push({
          level: INSIGHT_LEVELS.MEDIUM,
          type: 'likert_sentiment',
          questionId: qId,
          questionText: analysis.question_text,
          finding: `${analysis.interpretation} (${analysis.mean}/${analysis.scale})`
        });
      }
    }
  }

  // Cross-segment findings
  if (insights.cross_segment_comparisons.length > 0) {
    findings.push({
      level: INSIGHT_LEVELS.HIGH,
      type: 'segment_difference',
      finding: `Found ${insights.cross_segment_comparisons.length} notable difference(s) between segments`
    });
  }

  // Sort by level
  const levelOrder = { [INSIGHT_LEVELS.HIGH]: 0, [INSIGHT_LEVELS.MEDIUM]: 1, [INSIGHT_LEVELS.LOW]: 2 };
  findings.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  return findings.slice(0, 10);
}

/**
 * Identify patterns across questions
 */
function identifyPatterns(studyData, insights) {
  const patterns = [];
  const { respondents = [], questions = [] } = studyData;

  // Look for correlation patterns
  const numericQuestions = questions.filter(q => 
    ['likert', 'scale', 'nps'].includes(q.type)
  );

  for (let i = 0; i < numericQuestions.length; i++) {
    for (let j = i + 1; j < numericQuestions.length; j++) {
      const q1 = numericQuestions[i];
      const q2 = numericQuestions[j];
      
      const correlation = calculateCorrelation(respondents, q1.id, q2.id);
      
      if (Math.abs(correlation) > 0.5) {
        patterns.push({
          type: 'correlation',
          strength: Math.abs(correlation) > 0.7 ? 'strong' : 'moderate',
          direction: correlation > 0 ? 'positive' : 'negative',
          questions: [q1.id, q2.id],
          questionTexts: [q1.question || q1.text, q2.question || q2.text],
          correlation: correlation.toFixed(3),
          description: `${correlation > 0 ? 'Positive' : 'Negative'} correlation (r=${correlation.toFixed(2)})`
        });
      }
    }
  }

  return patterns;
}

/**
 * Identify statistical outliers
 */
function identifyOutliers(studyData) {
  const { respondents = [], questions = [] } = studyData;
  const outliers = [];

  for (const question of questions) {
    if (!['likert', 'scale', 'nps'].includes(question.type)) continue;

    const responses = respondents
      .map(r => {
        const resp = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
        if (Array.isArray(resp)) {
          return resp.find(x => x.question_id === question.id)?.answer;
        }
        return resp?.[question.id];
      })
      .filter(r => typeof r === 'number');

    if (responses.length < 10) continue;

    const mean = responses.reduce((a, b) => a + b, 0) / responses.length;
    const stdDev = Math.sqrt(
      responses.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / responses.length
    );

    const outlierResponses = responses.filter(r => Math.abs(r - mean) > 2 * stdDev);

    if (outlierResponses.length > 0) {
      outliers.push({
        questionId: question.id,
        questionText: question.question || question.text,
        mean: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        outlierCount: outlierResponses.length,
        outlierPct: ((outlierResponses.length / responses.length) * 100).toFixed(1) + '%'
      });
    }
  }

  return outliers;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(insights, studyData) {
  const { respondents = [], questions = [] } = studyData;
  const recommendations = [];

  if (respondents.length < 100) {
    recommendations.push({
      priority: 'high',
      area: 'methodology',
      recommendation: 'Consider increasing sample size for more reliable results',
      rationale: `Current sample (n=${respondents.length}) may have higher margin of error`
    });
  }

  if (insights.summary.completionRate < 0.9) {
    recommendations.push({
      priority: 'medium',
      area: 'data_quality',
      recommendation: 'Review questions with high skip rates',
      rationale: `Overall completion rate is ${(insights.summary.completionRate * 100).toFixed(1)}%`
    });
  }

  if (insights.summary.averageConfidence < 70) {
    recommendations.push({
      priority: 'high',
      area: 'validation',
      recommendation: 'Consider validating results with real-world data',
      rationale: `Average confidence score (${insights.summary.averageConfidence.toFixed(1)}) is below recommended threshold`
    });
  }

  return recommendations;
}

/**
 * Format insights as human-readable text
 */
function formatAsText(insights) {
  const lines = [];
  
  lines.push('='.repeat(60));
  lines.push('CROWDWAVE INSIGHTS REPORT');
  lines.push('='.repeat(60));
  lines.push('');
  
  lines.push('EXECUTIVE SUMMARY');
  lines.push('-'.repeat(40));
  lines.push(`Total Respondents: ${insights.summary.totalRespondents}`);
  lines.push(`Questions Analyzed: ${insights.summary.totalQuestions}`);
  lines.push(`Segments: ${insights.summary.segmentsAnalyzed}`);
  lines.push('');
  
  lines.push('KEY FINDINGS');
  lines.push('-'.repeat(40));
  for (const finding of (insights.keyFindings || insights.key_findings || [])) {
    lines.push(`• ${finding.finding}`);
  }
  lines.push('');
  
  if (insights.recommendations && insights.recommendations.length > 0) {
    lines.push('RECOMMENDATIONS');
    lines.push('-'.repeat(40));
    for (const rec of insights.recommendations) {
      lines.push(`[${rec.priority.toUpperCase()}] ${rec.recommendation}`);
    }
  }
  
  lines.push('');
  lines.push(`Report generated: ${insights.generatedAt}`);
  
  return lines.join('\n');
}

// ============ Utility Functions ============

function generateStatisticalSummary(respondents, questions) {
  return {
    total_responses: respondents.length * questions.length,
    responses_per_question: respondents.length,
    questions_by_type: questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {})
  };
}

function calculateCompletionRate(respondents, questions) {
  if (respondents.length === 0 || questions.length === 0) return 1;
  
  let answered = 0;
  const total = respondents.length * questions.length;
  
  for (const r of respondents) {
    const resp = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
    if (Array.isArray(resp)) {
      answered += resp.length;
    } else if (resp) {
      answered += Object.keys(resp).length;
    }
  }
  
  return total > 0 ? answered / total : 1;
}

function calculateAverageConfidence(respondents) {
  const scores = respondents
    .map(r => r.confidenceScore || r.confidence_score)
    .filter(s => typeof s === 'number');
  
  return scores.length > 0 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : 75;
}

function calculateMedian(nums) {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateCorrelation(respondents, q1Id, q2Id) {
  const pairs = [];
  
  for (const r of respondents) {
    const resp = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
    let v1, v2;
    
    if (Array.isArray(resp)) {
      v1 = resp.find(x => x.question_id === q1Id)?.answer;
      v2 = resp.find(x => x.question_id === q2Id)?.answer;
    } else {
      v1 = resp?.[q1Id];
      v2 = resp?.[q2Id];
    }
    
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      pairs.push([v1, v2]);
    }
  }
  
  if (pairs.length < 10) return 0;
  
  const n = pairs.length;
  const sum1 = pairs.reduce((acc, p) => acc + p[0], 0);
  const sum2 = pairs.reduce((acc, p) => acc + p[1], 0);
  const sum1Sq = pairs.reduce((acc, p) => acc + p[0] * p[0], 0);
  const sum2Sq = pairs.reduce((acc, p) => acc + p[1] * p[1], 0);
  const pSum = pairs.reduce((acc, p) => acc + p[0] * p[1], 0);
  
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
  
  return den === 0 ? 0 : num / den;
}

function getMostCommon(arr) {
  const counts = {};
  for (const item of arr) {
    if (item !== null && item !== undefined) {
      counts[item] = (counts[item] || 0) + 1;
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  return top ? { 
    value: top[0], 
    count: top[1], 
    percentage: arr.length > 0 ? Math.round((top[1] / arr.length) * 100) : 0
  } : { value: null, count: 0, percentage: 0 };
}

function interpretLikert(mean, scale) {
  const midpoint = (scale + 1) / 2;
  if (mean >= midpoint + 1) return 'Strongly positive';
  if (mean >= midpoint + 0.3) return 'Moderately positive';
  if (mean >= midpoint - 0.3) return 'Neutral';
  if (mean >= midpoint - 1) return 'Moderately negative';
  return 'Strongly negative';
}

function summarizeTraits(traits) {
  const summary = [];
  if (traits.demographics?.age_range) {
    summary.push(`Age: ${traits.demographics.age_range.join('-')}`);
  }
  if (traits.demographics?.income_level) {
    summary.push(`Income: ${traits.demographics.income_level}`);
  }
  if (traits.psychographics?.values) {
    summary.push(`Values: ${traits.psychographics.values.slice(0, 3).join(', ')}`);
  }
  return summary.join('; ');
}

function extractStatistics(analysis) {
  return {
    mean: analysis.mean,
    median: analysis.median,
    stdDev: analysis.std_dev,
    min: analysis.min,
    max: analysis.max,
    topResponse: analysis.topResponse || analysis.top_answer?.option,
    topResponsePct: analysis.topResponsePct || analysis.top_answer?.percentage
  };
}

function formatChartData(analysis, question) {
  const chartData = {
    type: 'bar',
    labels: [],
    datasets: [{ data: [], percentages: [] }]
  };

  if (analysis.distribution) {
    for (const [label, data] of Object.entries(analysis.distribution)) {
      chartData.labels.push(label);
      chartData.datasets[0].data.push(data.count);
      chartData.datasets[0].percentages.push(data.percentage);
    }
  }

  if (question.type === 'nps') {
    chartData.type = 'gauge';
    chartData.value = analysis.nps;
    chartData.breakdown = {
      promoters: analysis.promoters,
      passives: analysis.passives,
      detractors: analysis.detractors
    };
  }

  if (question.type === 'likert' || question.type === 'scale') {
    chartData.type = 'histogram';
    chartData.mean = analysis.mean;
    chartData.median = analysis.median;
  }

  return chartData;
}

function formatSegmentChartData(segmentResults, question) {
  return {
    type: 'grouped_bar',
    segments: segmentResults.map(r => r.segment),
    data: segmentResults.map(r => r.mean || r.percentage || 0)
  };
}

function generateInterpretation(analysis, question) {
  const parts = [`Based on ${analysis.response_count || analysis.n || 0} responses:`];

  if (analysis.top_answer) {
    const strength = analysis.top_answer.percentage > 60 ? 'strongly' : 
                     analysis.top_answer.percentage > 40 ? 'moderately' : 'slightly';
    parts.push(`Respondents ${strength} favor "${analysis.top_answer.option}" (${analysis.top_answer.percentage}%).`);
  }

  if (analysis.mean !== undefined && analysis.scale) {
    const midpoint = (analysis.scale + 1) / 2;
    const position = analysis.mean > midpoint ? 'above' : analysis.mean < midpoint ? 'below' : 'at';
    parts.push(`Average rating is ${analysis.mean} (${position} midpoint).`);
  }

  if (analysis.nps !== undefined) {
    parts.push(`NPS of ${analysis.nps} indicates ${analysis.interpretation} sentiment.`);
  }

  return parts.join(' ');
}

module.exports = { 
  generateInsights,
  formatAsText,
  extractKeyFindings,
  identifyPatterns,
  identifyOutliers,
  INSIGHT_LEVELS
};
