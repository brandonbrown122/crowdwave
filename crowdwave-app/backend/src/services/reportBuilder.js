/**
 * Report Builder for Crowdwave
 * 
 * Compiles comprehensive research reports combining:
 * - Raw data summaries
 * - Key insights
 * - Per-question breakdowns with chart data
 * - Confidence assessments
 * - Methodology notes
 * 
 * @module reportBuilder
 */

const { generateCSV, generateSummaryCSV } = require('./csvExporter');
const { generateInsights, formatAsText } = require('./insightsGenerator');
const { generateConfidenceReport } = require('./confidenceReport');

/**
 * Report sections that can be included
 */
const REPORT_SECTIONS = {
  EXECUTIVE_SUMMARY: 'executive_summary',
  METHODOLOGY: 'methodology',
  KEY_FINDINGS: 'key_findings',
  QUESTION_BREAKDOWN: 'question_breakdown',
  SEGMENT_ANALYSIS: 'segment_analysis',
  CONFIDENCE_ASSESSMENT: 'confidence_assessment',
  RAW_DATA: 'raw_data',
  RECOMMENDATIONS: 'recommendations',
  APPENDIX: 'appendix'
};

/**
 * Build a complete research report
 * @param {Object} studyData - Complete study data
 * @param {Object} [options] - Report options
 * @returns {Object} Complete report object
 */
function buildReport(studyData, options = {}) {
  const {
    sections = Object.values(REPORT_SECTIONS),
    format = 'json', // json, text, html
    includeRawData = true,
    includeCharts = true
  } = options;

  const report = {
    meta: buildReportMeta(studyData),
    sections: {}
  };

  // Generate insights once for reuse
  const insights = generateInsights(studyData);
  const confidenceReport = generateConfidenceReport(studyData);

  // Build requested sections
  if (sections.includes(REPORT_SECTIONS.EXECUTIVE_SUMMARY)) {
    report.sections.executiveSummary = buildExecutiveSummary(studyData, insights);
  }

  if (sections.includes(REPORT_SECTIONS.METHODOLOGY)) {
    report.sections.methodology = buildMethodologySection(studyData);
  }

  if (sections.includes(REPORT_SECTIONS.KEY_FINDINGS)) {
    report.sections.keyFindings = buildKeyFindingsSection(insights);
  }

  if (sections.includes(REPORT_SECTIONS.QUESTION_BREAKDOWN)) {
    report.sections.questionBreakdown = buildQuestionBreakdown(studyData, insights, includeCharts);
  }

  if (sections.includes(REPORT_SECTIONS.SEGMENT_ANALYSIS)) {
    report.sections.segmentAnalysis = buildSegmentAnalysis(studyData, insights);
  }

  if (sections.includes(REPORT_SECTIONS.CONFIDENCE_ASSESSMENT)) {
    report.sections.confidenceAssessment = confidenceReport;
  }

  if (sections.includes(REPORT_SECTIONS.RAW_DATA) && includeRawData) {
    report.sections.rawData = buildRawDataSection(studyData);
  }

  if (sections.includes(REPORT_SECTIONS.RECOMMENDATIONS)) {
    report.sections.recommendations = buildRecommendationsSection(insights, confidenceReport);
  }

  if (sections.includes(REPORT_SECTIONS.APPENDIX)) {
    report.sections.appendix = buildAppendix(studyData);
  }

  // Format output
  if (format === 'text') {
    return formatReportAsText(report);
  } else if (format === 'html') {
    return formatReportAsHTML(report);
  }

  return report;
}

/**
 * Build report metadata
 */
function buildReportMeta(studyData) {
  const { studyMetadata = {}, respondents = [], questions = [] } = studyData;

  return {
    reportId: generateReportId(),
    studyTitle: studyMetadata.title || 'Untitled Study',
    studyDescription: studyMetadata.description || '',
    generatedAt: new Date().toISOString(),
    generatedBy: 'Crowdwave Synthetic Audience Platform',
    version: '1.0',
    statistics: {
      totalRespondents: respondents.length,
      totalQuestions: questions.length,
      segments: [...new Set(respondents.map(r => r.segment).filter(Boolean))],
      dateRange: {
        earliest: findEarliestDate(respondents),
        latest: findLatestDate(respondents)
      }
    }
  };
}

/**
 * Build executive summary section
 */
function buildExecutiveSummary(studyData, insights) {
  const { studyMetadata = {} } = studyData;
  const summary = insights.summary || {};

  const totalRespondents = summary.totalRespondents || summary.total_respondents || 0;
  const segments = summary.segmentsAnalyzed || summary.segments_analyzed || 0;
  const completionRate = summary.completionRate ?? 1;
  const avgConfidence = summary.averageConfidence ?? 75;

  return {
    title: 'Executive Summary',
    objective: studyMetadata.objective || 'Consumer insights research',
    overview: {
      headline: generateHeadline(insights),
      keyMetrics: {
        totalRespondents,
        segments,
        completionRate: `${(completionRate * 100).toFixed(1)}%`,
        averageConfidence: `${avgConfidence.toFixed(1)}%`
      }
    },
    topFindings: (insights.keyFindings || insights.key_findings || []).slice(0, 3).map(f => ({
      finding: f.finding,
      significance: f.level
    })),
    bottomLine: generateBottomLine(insights),
    readTime: estimateReadTime(insights)
  };
}

/**
 * Build methodology section
 */
function buildMethodologySection(studyData) {
  const { studyMetadata = {}, respondents = [], questions = [] } = studyData;

  // Get segment breakdown
  const segmentCounts = {};
  for (const r of respondents) {
    const seg = r.segment || 'General';
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
  }

  // Get question type breakdown
  const questionTypes = {};
  for (const q of questions) {
    questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
  }

  return {
    title: 'Methodology',
    approach: {
      name: 'Synthetic Audience Research',
      description: 'AI-generated responses from calibrated persona models representing target audience segments.',
      platform: 'Crowdwave Synthetic Audience Platform'
    },
    sampleDesign: {
      totalSample: respondents.length,
      segmentBreakdown: segmentCounts,
      samplingMethod: studyMetadata.samplingMethod || 'Quota sampling by segment'
    },
    instrument: {
      totalQuestions: questions.length,
      questionTypes,
      averageLength: `${questions.length} questions`
    },
    dataCollection: {
      method: 'AI-generated responses',
      period: studyMetadata.collectionPeriod || 'Single session',
      qualityControls: [
        'Persona calibration against demographic benchmarks',
        'Response consistency checks',
        'Distribution validation',
        'Confidence scoring per response'
      ]
    },
    limitations: [
      'Synthetic responses may not capture all nuances of real human behavior',
      'Results should be validated against real-world data for high-stakes decisions',
      'Confidence scores indicate model certainty, not real-world accuracy'
    ],
    confidenceNote: 'Confidence scores reflect the model\'s internal consistency and alignment with training data. Scores above 70% indicate reliable synthetic responses.'
  };
}

/**
 * Build key findings section
 */
function buildKeyFindingsSection(insights) {
  const findings = insights.keyFindings || insights.key_findings || [];
  const patterns = insights.patterns || [];
  
  return {
    title: 'Key Findings',
    summary: `${findings.length} significant findings identified`,
    findings: findings.map((f, idx) => ({
      rank: idx + 1,
      type: f.type,
      level: f.level,
      title: generateFindingTitle(f),
      description: f.finding,
      question: f.questionText || f.question_text,
      data: f.data,
      implication: generateImplication(f)
    })),
    patterns: patterns.slice(0, 5).map(p => ({
      type: p.type,
      description: p.description,
      strength: p.strength
    }))
  };
}

/**
 * Build per-question breakdown
 */
function buildQuestionBreakdown(studyData, insights, includeCharts) {
  const { questions = [] } = studyData;
  const questionInsights = insights.questionInsights || insights.by_question || {};

  return {
    title: 'Question-by-Question Analysis',
    questions: questions.map((q, idx) => {
      const qi = questionInsights[q.id] || {};

      return {
        order: idx + 1,
        id: q.id,
        text: q.text || q.question,
        type: q.type,
        options: q.options || null,
        results: {
          n: qi.n || qi.response_count || 0,
          statistics: qi.statistics || extractStats(qi),
          distribution: qi.distribution || {},
          chartData: includeCharts ? qi.chartData : null
        },
        interpretation: qi.interpretation || '',
        segmentComparison: buildQuestionSegmentComparison(q.id, insights),
        confidenceNote: getQuestionConfidenceNote(q.id, studyData)
      };
    })
  };
}

function extractStats(qi) {
  return {
    mean: qi.mean,
    median: qi.median,
    stdDev: qi.std_dev,
    topResponse: qi.top_answer?.option || qi.topResponse,
    topResponsePct: qi.top_answer?.percentage || qi.topResponsePct
  };
}

/**
 * Build segment analysis section
 */
function buildSegmentAnalysis(studyData, insights) {
  const { respondents = [] } = studyData;
  const segmentComparisons = insights.segmentComparisons || {};
  const comparisons = segmentComparisons.comparisons || insights.cross_segment_comparisons || [];

  // Get unique segments
  const segments = [...new Set(respondents.map(r => r.segment || r.segment_name || r.segment_id).filter(Boolean))];

  if (segments.length < 2) {
    return {
      title: 'Segment Analysis',
      available: false,
      message: 'Segment analysis requires at least 2 segments.'
    };
  }

  // Build segment profiles
  const segmentProfiles = {};
  for (const seg of segments) {
    const segRespondents = respondents.filter(r => 
      r.segment === seg || r.segment_name === seg || r.segment_id === seg
    );
    segmentProfiles[seg] = {
      name: seg,
      count: segRespondents.length,
      percentage: respondents.length > 0 
        ? ((segRespondents.length / respondents.length) * 100).toFixed(1) + '%'
        : '0%',
      demographics: aggregateDemographics(segRespondents)
    };
  }

  return {
    title: 'Segment Analysis',
    available: true,
    segmentsAnalyzed: segments,
    segmentProfiles,
    comparisons: comparisons.slice(0, 10).map(c => ({
      questionId: c.questionId || c.question_id,
      questionText: c.questionText || c.question_text,
      differences: c.significantDifferences || [{ description: c.insight }],
      chartData: c.chartData
    })),
    keyDifferences: comparisons
      .flatMap(c => c.significantDifferences || [{ description: c.insight }])
      .slice(0, 5)
  };
}

/**
 * Build raw data summary section
 */
function buildRawDataSection(studyData) {
  return {
    title: 'Raw Data Summary',
    description: 'Summary statistics and downloadable data files',
    summaryStats: generateSummaryStats(studyData),
    downloads: {
      fullDataCSV: {
        description: 'Complete respondent-level data',
        content: generateCSV(studyData),
        filename: 'crowdwave_full_data.csv'
      },
      summaryCSV: {
        description: 'Summary statistics by question',
        content: generateSummaryCSV(studyData),
        filename: 'crowdwave_summary.csv'
      }
    },
    sampleRows: studyData.respondents.slice(0, 5).map(r => ({
      id: r.id,
      segment: r.segment,
      responseCount: Object.keys(r.responses || {}).length
    }))
  };
}

/**
 * Build recommendations section
 */
function buildRecommendationsSection(insights, confidenceReport) {
  const recommendations = [...(insights.recommendations || [])];
  const confReport = confidenceReport || {};
  const confQuestions = confReport.questions || [];

  // Add confidence-based recommendations
  if (confReport.overallConfidence && confReport.overallConfidence < 70) {
    recommendations.unshift({
      priority: 'high',
      area: 'validation',
      recommendation: 'Consider real-world validation before acting on these results',
      rationale: `Overall confidence (${confReport.overallConfidence.toFixed(1)}%) is below recommended threshold`
    });
  }

  // Add recommendations based on low-confidence questions
  const lowConfidenceQuestions = confQuestions.filter(q => q.confidenceScore < 60);
  if (lowConfidenceQuestions.length > 0) {
    recommendations.push({
      priority: 'medium',
      area: 'question_design',
      recommendation: `Review ${lowConfidenceQuestions.length} questions with low confidence scores`,
      rationale: 'These questions may benefit from clearer wording or additional calibration',
      questions: lowConfidenceQuestions.map(q => q.questionId)
    });
  }

  return {
    title: 'Recommendations',
    count: recommendations.length,
    byPriority: {
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low')
    },
    actionItems: recommendations.map((r, idx) => ({
      order: idx + 1,
      priority: r.priority,
      action: r.recommendation,
      context: r.rationale,
      area: r.area
    }))
  };
}

/**
 * Build appendix section
 */
function buildAppendix(studyData) {
  const { questions = [], respondents = [] } = studyData;

  return {
    title: 'Appendix',
    questionnaire: questions.map((q, idx) => ({
      number: idx + 1,
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options || null,
      required: q.required !== false
    })),
    segmentDefinitions: extractSegmentDefinitions(respondents),
    demographicBreakdown: buildDemographicBreakdown(respondents),
    glossary: {
      'Synthetic Audience': 'AI-generated respondents calibrated to represent specific consumer segments',
      'Confidence Score': 'Model\'s internal assessment of response reliability (0-100)',
      'NPS': 'Net Promoter Score, calculated as % Promoters - % Detractors',
      'Segment': 'A defined group of consumers sharing common characteristics'
    }
  };
}

/**
 * Format report as plain text
 */
function formatReportAsText(report) {
  const lines = [];
  const divider = '='.repeat(70);
  const subDivider = '-'.repeat(50);

  // Header
  lines.push(divider);
  lines.push(`CROWDWAVE RESEARCH REPORT`);
  lines.push(`${report.meta.studyTitle}`);
  lines.push(divider);
  lines.push(`Generated: ${new Date(report.meta.generatedAt).toLocaleString()}`);
  lines.push(`Respondents: ${report.meta.statistics.totalRespondents}`);
  lines.push(`Questions: ${report.meta.statistics.totalQuestions}`);
  lines.push('');

  // Executive Summary
  if (report.sections.executiveSummary) {
    const es = report.sections.executiveSummary;
    lines.push(subDivider);
    lines.push('EXECUTIVE SUMMARY');
    lines.push(subDivider);
    lines.push(es.overview.headline);
    lines.push('');
    lines.push('Key Metrics:');
    for (const [key, value] of Object.entries(es.overview.keyMetrics)) {
      lines.push(`  • ${formatKey(key)}: ${value}`);
    }
    lines.push('');
    lines.push('Top Findings:');
    for (const f of es.topFindings) {
      lines.push(`  • ${f.finding}`);
    }
    lines.push('');
    lines.push(`Bottom Line: ${es.bottomLine}`);
    lines.push('');
  }

  // Key Findings
  if (report.sections.keyFindings) {
    const kf = report.sections.keyFindings;
    lines.push(subDivider);
    lines.push('KEY FINDINGS');
    lines.push(subDivider);
    for (const f of kf.findings) {
      const icon = f.level === 'high' ? '🔴' : f.level === 'medium' ? '🟡' : '🟢';
      lines.push(`${f.rank}. ${icon} ${f.title}`);
      lines.push(`   ${f.description}`);
      lines.push(`   Implication: ${f.implication}`);
      lines.push('');
    }
  }

  // Methodology
  if (report.sections.methodology) {
    const m = report.sections.methodology;
    lines.push(subDivider);
    lines.push('METHODOLOGY');
    lines.push(subDivider);
    lines.push(`Approach: ${m.approach.name}`);
    lines.push(`Sample Size: ${m.sampleDesign.totalSample}`);
    lines.push('');
    lines.push('Limitations:');
    for (const l of m.limitations) {
      lines.push(`  • ${l}`);
    }
    lines.push('');
  }

  // Confidence Assessment
  if (report.sections.confidenceAssessment) {
    const ca = report.sections.confidenceAssessment;
    lines.push(subDivider);
    lines.push('CONFIDENCE ASSESSMENT');
    lines.push(subDivider);
    lines.push(`Overall Confidence: ${ca.overallConfidence.toFixed(1)}% (${ca.overallRating})`);
    lines.push('');
    if (ca.lowConfidenceFlags.length > 0) {
      lines.push('⚠️ Low Confidence Flags:');
      for (const flag of ca.lowConfidenceFlags) {
        lines.push(`  • ${flag.message}`);
      }
    }
    lines.push('');
  }

  // Recommendations
  if (report.sections.recommendations) {
    const r = report.sections.recommendations;
    lines.push(subDivider);
    lines.push('RECOMMENDATIONS');
    lines.push(subDivider);
    for (const action of r.actionItems) {
      const priority = action.priority.toUpperCase();
      lines.push(`[${priority}] ${action.action}`);
      lines.push(`   ${action.context}`);
      lines.push('');
    }
  }

  // Footer
  lines.push(divider);
  lines.push(`Report ID: ${report.meta.reportId}`);
  lines.push(`Generated by: ${report.meta.generatedBy}`);
  lines.push(divider);

  return lines.join('\n');
}

/**
 * Format report as HTML
 */
function formatReportAsHTML(report) {
  const sections = [];

  sections.push(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(report.meta.studyTitle)} - Crowdwave Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a2e; }
    h2 { color: #16213e; border-bottom: 2px solid #0f3460; padding-bottom: 8px; }
    .metric { display: inline-block; padding: 10px 20px; margin: 5px; background: #f0f4f8; border-radius: 8px; }
    .finding { padding: 15px; margin: 10px 0; border-left: 4px solid #0f3460; background: #f8f9fa; }
    .finding.high { border-color: #e74c3c; }
    .finding.medium { border-color: #f39c12; }
    .finding.low { border-color: #27ae60; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 0.8em; text-transform: uppercase; }
    .badge.high { background: #fce4e4; color: #c0392b; }
    .badge.medium { background: #fef5e7; color: #d68910; }
    .badge.low { background: #e8f8f5; color: #1e8449; }
    .confidence-bar { height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
    .confidence-fill { height: 100%; transition: width 0.3s; }
    .confidence-high { background: #27ae60; }
    .confidence-medium { background: #f39c12; }
    .confidence-low { background: #e74c3c; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f0f4f8; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${escapeHTML(report.meta.studyTitle)}</h1>
  <p><em>Generated: ${new Date(report.meta.generatedAt).toLocaleString()}</em></p>`);

  // Executive Summary
  if (report.sections.executiveSummary) {
    const es = report.sections.executiveSummary;
    sections.push(`
  <h2>Executive Summary</h2>
  <p><strong>${escapeHTML(es.overview.headline)}</strong></p>
  <div>
    ${Object.entries(es.overview.keyMetrics).map(([k, v]) => 
      `<div class="metric"><strong>${formatKey(k)}</strong><br>${escapeHTML(String(v))}</div>`
    ).join('')}
  </div>
  <h3>Top Findings</h3>
  <ul>
    ${es.topFindings.map(f => `<li>${escapeHTML(f.finding)}</li>`).join('')}
  </ul>
  <p><strong>Bottom Line:</strong> ${escapeHTML(es.bottomLine)}</p>`);
  }

  // Key Findings
  if (report.sections.keyFindings) {
    sections.push(`
  <h2>Key Findings</h2>
  ${report.sections.keyFindings.findings.map(f => `
    <div class="finding ${f.level}">
      <span class="badge ${f.level}">${f.level}</span>
      <strong>${escapeHTML(f.title)}</strong>
      <p>${escapeHTML(f.description)}</p>
      <p><em>Implication: ${escapeHTML(f.implication)}</em></p>
    </div>
  `).join('')}`);
  }

  // Confidence Assessment
  if (report.sections.confidenceAssessment) {
    const ca = report.sections.confidenceAssessment;
    const confClass = ca.overallConfidence >= 70 ? 'high' : ca.overallConfidence >= 50 ? 'medium' : 'low';
    sections.push(`
  <h2>Confidence Assessment</h2>
  <p><strong>Overall Confidence: ${ca.overallConfidence.toFixed(1)}%</strong> (${ca.overallRating})</p>
  <div class="confidence-bar">
    <div class="confidence-fill confidence-${confClass}" style="width: ${ca.overallConfidence}%"></div>
  </div>
  ${ca.lowConfidenceFlags.length > 0 ? `
  <h3>⚠️ Flags</h3>
  <ul>
    ${ca.lowConfidenceFlags.map(f => `<li>${escapeHTML(f.message)}</li>`).join('')}
  </ul>` : ''}`);
  }

  // Recommendations
  if (report.sections.recommendations) {
    sections.push(`
  <h2>Recommendations</h2>
  <table>
    <tr><th>Priority</th><th>Action</th><th>Rationale</th></tr>
    ${report.sections.recommendations.actionItems.map(a => `
      <tr>
        <td><span class="badge ${a.priority}">${a.priority}</span></td>
        <td>${escapeHTML(a.action)}</td>
        <td>${escapeHTML(a.context)}</td>
      </tr>
    `).join('')}
  </table>`);
  }

  // Footer
  sections.push(`
  <div class="footer">
    <p>Report ID: ${report.meta.reportId}<br>
    Generated by: ${report.meta.generatedBy}</p>
  </div>
</body>
</html>`);

  return sections.join('\n');
}

// ============ Helper Functions ============

function generateReportId() {
  return `CW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function findEarliestDate(respondents) {
  const dates = respondents.map(r => r.generatedAt).filter(Boolean).sort();
  return dates[0] || null;
}

function findLatestDate(respondents) {
  const dates = respondents.map(r => r.generatedAt).filter(Boolean).sort();
  return dates[dates.length - 1] || null;
}

function generateHeadline(insights) {
  const findings = insights.keyFindings || insights.key_findings || [];
  const topFinding = findings[0];
  if (topFinding) {
    return topFinding.finding;
  }
  const total = insights.summary?.totalRespondents || insights.summary?.total_respondents || 0;
  const segs = insights.summary?.segmentsAnalyzed || insights.summary?.segments_analyzed || 0;
  return `Analysis of ${total} synthetic respondents across ${segs} segments`;
}

function generateBottomLine(insights) {
  const findings = insights.keyFindings || insights.key_findings || [];
  const patterns = insights.patterns || [];

  if (findings.length === 0) {
    return 'No significant findings detected. Consider expanding sample size or question variety.';
  }

  if (findings.filter(f => f.level === 'high').length > 2) {
    return 'Multiple high-significance findings suggest strong audience preferences. Recommended for action.';
  }

  if (patterns.length > 2) {
    return 'Notable patterns detected across questions. Further investigation recommended.';
  }

  return 'Results indicate moderate audience signals. Consider validation before major decisions.';
}

function estimateReadTime(insights) {
  const questionCount = Object.keys(insights.questionInsights || insights.by_question || {}).length;
  const findingCount = (insights.keyFindings || insights.key_findings || []).length;
  const minutes = Math.ceil((questionCount * 0.5 + findingCount * 1) / 2) || 1;
  return `${minutes} min read`;
}

function generateFindingTitle(finding) {
  const titles = {
    consensus: 'Strong Audience Consensus',
    polarization: 'Divided Audience Opinion',
    nps: 'Net Promoter Score Insight',
    correlation: 'Cross-Question Pattern',
    demographic_split: 'Demographic Difference'
  };
  return titles[finding.type] || 'Notable Finding';
}

function generateImplication(finding) {
  const implications = {
    consensus: 'Clear direction for decision-making with high confidence.',
    polarization: 'Consider segmented approaches; one-size-fits-all may not work.',
    nps: finding.data?.nps >= 0 
      ? 'Positive advocacy potential. Focus on converting passives.' 
      : 'Detractor concerns need addressing before growth initiatives.',
    correlation: 'Related factors suggest deeper underlying preference structure.',
    demographic_split: 'Targeted messaging by demographic may increase effectiveness.'
  };
  return implications[finding.type] || 'Review data for potential action items.';
}

function buildQuestionSegmentComparison(questionId, insights) {
  const comparison = insights.segmentComparisons?.comparisons?.find(c => c.questionId === questionId);
  if (!comparison) return null;

  return {
    hasSignificantDifferences: comparison.significantDifferences.length > 0,
    differences: comparison.significantDifferences
  };
}

function getQuestionConfidenceNote(questionId, studyData) {
  const { respondents = [] } = studyData;
  const scores = respondents
    .map(r => r.confidenceScores?.[questionId])
    .filter(s => typeof s === 'number');

  if (scores.length === 0) return 'Confidence data not available';

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg >= 80) return 'High confidence in synthetic responses';
  if (avg >= 60) return 'Moderate confidence; consider validation';
  return 'Low confidence; results should be verified';
}

function aggregateDemographics(respondents) {
  const demo = {};
  const fields = ['age', 'gender', 'income', 'location', 'education'];

  for (const field of fields) {
    const values = respondents.map(r => r.demographics?.[field]).filter(Boolean);
    if (values.length > 0) {
      const counts = {};
      for (const v of values) {
        counts[v] = (counts[v] || 0) + 1;
      }
      demo[field] = counts;
    }
  }

  return demo;
}

function extractSegmentDefinitions(respondents) {
  const segments = [...new Set(respondents.map(r => r.segment).filter(Boolean))];
  return segments.map(seg => ({
    name: seg,
    count: respondents.filter(r => r.segment === seg).length
  }));
}

function buildDemographicBreakdown(respondents) {
  return aggregateDemographics(respondents);
}

function generateSummaryStats(studyData) {
  const { respondents = [], questions = [] } = studyData;

  return {
    sampleSize: respondents.length,
    questionCount: questions.length,
    completionRate: calculateCompletionRate(respondents, questions),
    averageResponsesPerRespondent: questions.length
  };
}

function calculateCompletionRate(respondents, questions) {
  if (respondents.length === 0 || questions.length === 0) return 1;

  let total = 0;
  let answered = 0;

  for (const r of respondents) {
    for (const q of questions) {
      total++;
      if (r.responses?.[q.id] != null) answered++;
    }
  }

  return answered / total;
}

function formatKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  buildReport,
  formatReportAsText,
  formatReportAsHTML,
  REPORT_SECTIONS
};
