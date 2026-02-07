/**
 * Crowdwave Services - Main Entry Point
 * 
 * Exports all output processing, insights, and reporting modules.
 * 
 * @module services
 */

// Core services
const csvExporter = require('./csvExporter');
const insightsGenerator = require('./insightsGenerator');
const reportBuilder = require('./reportBuilder');
const confidenceReport = require('./confidenceReport');

// Optional simulation services (may not exist yet)
let personaEngine, responseGenerator, distributionCalibrator, confidenceScorer, simulator, dataProcessor;

try { personaEngine = require('./personaEngine'); } catch (e) { personaEngine = null; }
try { responseGenerator = require('./responseGenerator'); } catch (e) { responseGenerator = null; }
try { distributionCalibrator = require('./distributionCalibrator'); } catch (e) { distributionCalibrator = null; }
try { confidenceScorer = require('./confidenceScorer'); } catch (e) { confidenceScorer = null; }
try { simulator = require('./simulator'); } catch (e) { simulator = null; }
try { dataProcessor = require('./dataProcessor'); } catch (e) { dataProcessor = null; }

/**
 * Generate a complete output package with all data
 * @param {Object} studyData - Complete study data
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Complete output package
 */
async function generateCompleteOutput(studyData, options = {}) {
  const {
    includeCSV = true,
    includeInsights = true,
    includeReport = true,
    includeConfidence = true,
    reportFormat = 'json'
  } = options;

  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      studyTitle: studyData.studyMetadata?.title || 'Untitled Study',
      respondentCount: studyData.respondents?.length || 0,
      questionCount: studyData.questions?.length || 0
    }
  };

  // Generate insights first (used by other modules)
  if (includeInsights || includeReport) {
    output.insights = await insightsGenerator.generateInsights(studyData);
  }

  // Generate confidence report
  if (includeConfidence || includeReport) {
    output.confidence = confidenceReport.generateConfidenceReport(studyData);
  }

  // Generate CSVs
  if (includeCSV) {
    output.csvData = {
      fullData: {
        content: csvExporter.generateCSV(studyData),
        filename: `crowdwave_data_${Date.now()}.csv`
      },
      summary: {
        content: csvExporter.generateSummaryCSV(studyData),
        filename: `crowdwave_summary_${Date.now()}.csv`
      }
    };
  }

  // Generate full report
  if (includeReport) {
    output.report = reportBuilder.buildReport(studyData, { format: reportFormat });
  }

  // Frontend-ready summary
  output.frontendData = formatForFrontend(studyData, output);

  return output;
}

/**
 * Format data specifically for frontend consumption
 */
function formatForFrontend(studyData, output) {
  const { respondents = [], questions = [] } = studyData;
  const insights = output.insights || {};
  const confidence = output.confidence || {};

  return {
    summary: {
      totalRespondents: respondents.length,
      totalQuestions: questions.length,
      segments: [...new Set(respondents.map(r => r.segment || r.segment_id).filter(Boolean))],
      overallConfidence: confidence.overallConfidence || 75,
      confidenceRating: confidence.overallRating || 'Good',
      completionRate: insights.summary?.completionRate || 1
    },

    highlights: (insights.keyFindings || []).slice(0, 5).map(f => ({
      id: f.questionId,
      type: f.type,
      level: f.level,
      title: f.finding,
      questionText: f.questionText
    })),

    charts: questions.map(q => {
      const qi = insights.questionInsights?.[q.id] || {};
      return {
        questionId: q.id,
        questionText: q.text || q.question,
        questionType: q.type,
        chartType: determineChartType(q.type),
        data: qi.chartData || { labels: [], datasets: [{ data: [] }] },
        stats: {
          n: qi.n || 0,
          mean: qi.statistics?.mean,
          topResponse: qi.statistics?.topResponse,
          topResponsePct: qi.statistics?.topResponsePct
        },
        confidence: confidence.questions?.find(cq => cq.questionId === q.id)?.confidenceScore || 75
      };
    }),

    segmentData: formatSegmentDataForFrontend(insights.segmentComparisons),

    confidenceIndicators: {
      overall: {
        score: confidence.overallConfidence || 75,
        rating: confidence.overallRating || 'Good'
      },
      flags: (confidence.lowConfidenceFlags || []).map(f => ({
        level: f.level,
        message: f.message
      })),
      questionScores: (confidence.questions || []).map(q => ({
        id: q.questionId,
        score: q.confidenceScore,
        rating: q.rating
      }))
    },

    downloads: {
      csv: {
        available: !!output.csvData,
        filename: output.csvData?.fullData?.filename
      },
      summary: {
        available: !!output.csvData?.summary,
        filename: output.csvData?.summary?.filename
      }
    },

    recommendations: (insights.recommendations || []).map(r => ({
      priority: r.priority,
      action: r.recommendation,
      context: r.rationale
    }))
  };
}

function determineChartType(questionType) {
  const chartTypes = {
    single_choice: 'pie',
    multiple_choice: 'bar',
    likert: 'histogram',
    scale: 'histogram',
    nps: 'gauge',
    yes_no: 'donut',
    ranking: 'horizontal_bar',
    matrix: 'grouped_bar',
    open_ended: 'wordcloud',
    open_text: 'wordcloud'
  };
  return chartTypes[questionType] || 'bar';
}

function formatSegmentDataForFrontend(segmentComparisons) {
  if (!segmentComparisons?.available) {
    return { available: false };
  }
  return {
    available: true,
    segments: segmentComparisons.segmentsCompared,
    topDifferences: (segmentComparisons.comparisons || []).slice(0, 5).map(c => ({
      questionId: c.questionId,
      questionText: c.questionText,
      chartData: c.chartData,
      differences: c.significantDifferences
    }))
  };
}

// ============ Exports ============

module.exports = {
  // CSV Exporter
  generateCSV: csvExporter.generateCSV,
  generateSummaryCSV: csvExporter.generateSummaryCSV,
  generateSegmentCSV: csvExporter.generateSegmentCSV,
  generateCrosstabCSV: csvExporter.generateCrosstabCSV,
  exportToCsv: csvExporter.exportToCsv,
  exportInsightsToCsv: csvExporter.exportInsightsToCsv,
  QUESTION_TYPES: csvExporter.QUESTION_TYPES,

  // Insights Generator
  generateInsights: insightsGenerator.generateInsights,
  formatInsightsAsText: insightsGenerator.formatAsText,
  INSIGHT_LEVELS: insightsGenerator.INSIGHT_LEVELS,

  // Report Builder
  buildReport: reportBuilder.buildReport,
  formatReportAsText: reportBuilder.formatReportAsText,
  formatReportAsHTML: reportBuilder.formatReportAsHTML,
  REPORT_SECTIONS: reportBuilder.REPORT_SECTIONS,

  // Confidence Report
  generateConfidenceReport: confidenceReport.generateConfidenceReport,
  formatConfidenceForDisplay: confidenceReport.formatForDisplay,
  CONFIDENCE_RATINGS: confidenceReport.CONFIDENCE_RATINGS,

  // Complete output package
  generateCompleteOutput,
  formatForFrontend,

  // Full module access
  csvExporter,
  insightsGenerator,
  reportBuilder,
  confidenceReport,

  // Simulation services (if available)
  personaEngine,
  responseGenerator,
  distributionCalibrator,
  confidenceScorer,
  simulator,
  dataProcessor
};
