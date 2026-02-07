/**
 * CSV Exporter for Crowdwave
 * 
 * Generates clean CSV files with respondent-level data.
 * Handles all question types with proper escaping and formatting.
 * 
 * @module csvExporter
 */

/**
 * Question types supported by the platform
 */
const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  SINGLE_CHOICE: 'single_choice',
  LIKERT: 'likert',
  SCALE: 'scale',
  OPEN_TEXT: 'open_ended',
  OPEN_ENDED: 'open_ended',
  RANKING: 'ranking',
  MATRIX: 'matrix',
  NET_PROMOTER: 'nps',
  YES_NO: 'yes_no'
};

/**
 * Escape a value for CSV output
 * Handles commas, quotes, and newlines
 * @param {any} value - Value to escape
 * @returns {string} CSV-safe string
 */
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Format a response value based on question type
 * @param {any} response - The response value
 * @param {Object} question - Question metadata
 * @returns {string} Formatted response
 */
function formatResponse(response, question) {
  if (response === null || response === undefined) {
    return '';
  }

  const type = question.type;

  if (type === QUESTION_TYPES.MULTIPLE_CHOICE && Array.isArray(response)) {
    return response.join('; ');
  }

  if (type === QUESTION_TYPES.RANKING) {
    if (Array.isArray(response)) {
      return response.map((item, idx) => `${idx + 1}. ${item}`).join('; ');
    }
    return String(response);
  }

  if (type === QUESTION_TYPES.MATRIX) {
    if (typeof response === 'object') {
      return Object.entries(response)
        .map(([row, val]) => `${row}: ${val}`)
        .join('; ');
    }
    return String(response);
  }

  if (type === QUESTION_TYPES.YES_NO) {
    return response ? 'Yes' : 'No';
  }

  if (type === QUESTION_TYPES.OPEN_TEXT || type === QUESTION_TYPES.OPEN_ENDED) {
    return String(response).trim();
  }

  return String(response);
}

/**
 * Build column headers for the CSV
 * @param {Object[]} questions - Array of question definitions
 * @param {string[]} demographicFields - Demographic field names
 * @returns {string[]} Array of column headers
 */
function buildHeaders(questions, demographicFields = []) {
  const headers = ['respondent_id', 'segment_id', 'segment_name'];
  
  // Add demographic fields
  headers.push(...demographicFields);
  
  // Add question columns
  for (const question of questions) {
    const qId = question.id;
    
    if (question.type === QUESTION_TYPES.MATRIX && question.rows) {
      for (const row of question.rows) {
        headers.push(`${qId}_${row}`);
      }
    } else if (question.type === QUESTION_TYPES.RANKING) {
      headers.push(`${qId}_answer`);
      headers.push(`${qId}_rank_1`);
      headers.push(`${qId}_rank_2`);
      headers.push(`${qId}_rank_3`);
    } else if (question.type === QUESTION_TYPES.LIKERT || question.type === QUESTION_TYPES.SCALE) {
      headers.push(`${qId}_answer`);
      headers.push(`${qId}_scale`);
    } else {
      headers.push(`${qId}_answer`);
    }
  }
  
  // Add metadata columns
  headers.push('generated_at', 'confidence_score');
  
  return headers;
}

/**
 * Build a single row of data for a respondent
 * @param {Object} respondent - Respondent data
 * @param {Object[]} questions - Question definitions
 * @param {string[]} demographicFields - Demographic field names
 * @param {Object} segmentMap - Map of segment IDs to names
 * @returns {string[]} Array of values for this row
 */
function buildRow(respondent, questions, demographicFields, segmentMap = {}) {
  // Parse persona/demographics if string
  const persona = typeof respondent.persona === 'string' 
    ? JSON.parse(respondent.persona) 
    : (respondent.persona || {});
  
  // Parse responses if string  
  const responsesRaw = typeof respondent.responses === 'string'
    ? JSON.parse(respondent.responses)
    : (respondent.responses || []);
  
  const demographics = persona.demographics || respondent.demographics || {};
  
  const row = [
    respondent.id,
    respondent.segment_id || respondent.segment || '',
    segmentMap[respondent.segment_id] || persona.segment_name || respondent.segment || ''
  ];
  
  // Add demographics
  for (const field of demographicFields) {
    row.push(demographics[field] ?? '');
  }
  
  // Add responses
  for (const question of questions) {
    // Find response - handle both array and object formats
    let response;
    if (Array.isArray(responsesRaw)) {
      const found = responsesRaw.find(r => r.question_id === question.id);
      response = found?.answer;
    } else if (typeof responsesRaw === 'object') {
      response = responsesRaw[question.id];
    }
    
    if (question.type === QUESTION_TYPES.MATRIX && question.rows) {
      for (const matrixRow of question.rows) {
        row.push(response?.[matrixRow] ?? '');
      }
    } else if (question.type === QUESTION_TYPES.RANKING) {
      row.push(formatResponse(response, question));
      const ranked = Array.isArray(response) ? response : [];
      row.push(ranked[0] || '');
      row.push(ranked[1] || '');
      row.push(ranked[2] || '');
    } else if (question.type === QUESTION_TYPES.LIKERT || question.type === QUESTION_TYPES.SCALE) {
      row.push(response ?? '');
      row.push(question.scale || 5);
    } else {
      row.push(formatResponse(response, question));
    }
  }
  
  // Add metadata
  row.push(respondent.generatedAt || respondent.generated_at || new Date().toISOString());
  row.push(respondent.confidenceScore || respondent.confidence_score || '');
  
  return row;
}

/**
 * Generate CSV content from study results
 * @param {Object} studyData - Complete study data
 * @param {Object[]} studyData.respondents - Array of respondent objects
 * @param {Object[]} studyData.questions - Array of question definitions
 * @param {string[]} [studyData.demographicFields] - Demographic field names
 * @param {Object} [options] - Export options
 * @returns {string} CSV content as string
 */
function generateCSV(studyData, options = {}) {
  const {
    respondents = [],
    questions = [],
    demographicFields = ['age', 'gender', 'income', 'location', 'education', 'occupation'],
    segmentMap = {}
  } = studyData;
  
  const {
    includeHeaders = true,
    delimiter = ',',
    lineEnding = '\r\n'
  } = options;
  
  const rows = [];
  
  // Build headers
  if (includeHeaders) {
    const headers = buildHeaders(questions, demographicFields);
    rows.push(headers.map(escapeCSV).join(delimiter));
  }
  
  // Build data rows
  for (const respondent of respondents) {
    const row = buildRow(respondent, questions, demographicFields, segmentMap);
    rows.push(row.map(escapeCSV).join(delimiter));
  }
  
  return rows.join(lineEnding);
}

/**
 * Export respondent data to CSV (legacy API compatibility)
 * @param {Array} respondents - Respondent records
 * @param {Array} questions - Survey questions
 * @param {Object} segmentMap - Map of segment IDs to names
 * @returns {string} - CSV content
 */
function exportToCsv(respondents, questions, segmentMap = {}) {
  if (!respondents || respondents.length === 0) {
    return 'No data to export';
  }

  return generateCSV({
    respondents,
    questions,
    segmentMap,
    demographicFields: ['age', 'gender', 'income', 'location', 'occupation', 'education']
  });
}

/**
 * Generate a summary CSV with aggregated statistics
 * @param {Object} studyData - Complete study data
 * @returns {string} CSV content with summary statistics
 */
function generateSummaryCSV(studyData) {
  const { questions = [], respondents = [] } = studyData;
  const rows = [];
  
  // Header
  rows.push(['question_id', 'question_text', 'type', 'n', 'mean', 'median', 'std_dev', 'top_response', 'top_response_pct'].map(escapeCSV).join(','));
  
  for (const question of questions) {
    // Get responses for this question
    const responses = respondents
      .map(r => {
        const resp = typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses;
        if (Array.isArray(resp)) {
          const found = resp.find(x => x.question_id === question.id);
          return found?.answer;
        }
        return resp?.[question.id];
      })
      .filter(r => r !== null && r !== undefined);
    
    const stats = calculateQuestionStats(responses, question);
    
    rows.push([
      question.id,
      question.question || question.text || '',
      question.type,
      responses.length,
      stats.mean ?? '',
      stats.median ?? '',
      stats.stdDev ?? '',
      stats.topResponse ?? '',
      stats.topResponsePct ?? ''
    ].map(escapeCSV).join(','));
  }
  
  return rows.join('\r\n');
}

/**
 * Calculate statistics for a question's responses
 */
function calculateQuestionStats(responses, question) {
  if (responses.length === 0) {
    return {};
  }
  
  const stats = {};
  
  // For numeric questions (likert, scale, NPS), calculate mean/median/stddev
  if ([QUESTION_TYPES.SCALE, QUESTION_TYPES.LIKERT, QUESTION_TYPES.NET_PROMOTER].includes(question.type)) {
    const nums = responses.filter(r => typeof r === 'number');
    if (nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0);
      stats.mean = (sum / nums.length).toFixed(2);
      
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      stats.median = sorted.length % 2 ? sorted[mid] : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2);
      
      const variance = nums.reduce((acc, val) => acc + Math.pow(val - stats.mean, 2), 0) / nums.length;
      stats.stdDev = Math.sqrt(variance).toFixed(2);
    }
  }
  
  // For choice questions, find top response
  if ([QUESTION_TYPES.SINGLE_CHOICE, QUESTION_TYPES.MULTIPLE_CHOICE, QUESTION_TYPES.YES_NO].includes(question.type)) {
    const counts = {};
    for (const r of responses) {
      const key = String(r);
      counts[key] = (counts[key] || 0) + 1;
    }
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      stats.topResponse = sorted[0][0];
      stats.topResponsePct = ((sorted[0][1] / responses.length) * 100).toFixed(1) + '%';
    }
  }
  
  return stats;
}

/**
 * Generate CSV for a specific segment
 */
function generateSegmentCSV(studyData, segmentName, options = {}) {
  const filteredData = {
    ...studyData,
    respondents: studyData.respondents.filter(r => 
      r.segment === segmentName || r.segment_name === segmentName || r.segment_id === segmentName
    )
  };
  
  return generateCSV(filteredData, options);
}

/**
 * Generate cross-tabulation CSV
 */
function generateCrosstabCSV(studyData, questionId, breakdownField) {
  const { respondents = [], questions = [] } = studyData;
  const question = questions.find(q => q.id === questionId);
  
  if (!question) {
    throw new Error(`Question ${questionId} not found`);
  }
  
  // Get breakdown groups
  const groups = {};
  for (const respondent of respondents) {
    const persona = typeof respondent.persona === 'string' 
      ? JSON.parse(respondent.persona) 
      : (respondent.persona || {});
    
    const groupValue = getNestedValue(respondent, breakdownField) || 
                       getNestedValue(persona, breakdownField) ||
                       'Unknown';
    
    if (!groups[groupValue]) {
      groups[groupValue] = [];
    }
    
    // Get response
    const resp = typeof respondent.responses === 'string' 
      ? JSON.parse(respondent.responses) 
      : respondent.responses;
    
    let answer;
    if (Array.isArray(resp)) {
      const found = resp.find(r => r.question_id === questionId);
      answer = found?.answer;
    } else {
      answer = resp?.[questionId];
    }
    
    groups[groupValue].push(answer);
  }
  
  // Get all unique response options
  const allResponses = new Set();
  for (const responses of Object.values(groups)) {
    for (const r of responses) {
      if (r !== null && r !== undefined) {
        allResponses.add(String(r));
      }
    }
  }
  const responseOptions = Array.from(allResponses).sort();
  
  // Build CSV
  const rows = [];
  
  // Header row
  rows.push(['', ...Object.keys(groups), 'Total'].map(escapeCSV).join(','));
  
  // Data rows
  for (const option of responseOptions) {
    const row = [option];
    let total = 0;
    
    for (const groupName of Object.keys(groups)) {
      const count = groups[groupName].filter(r => String(r) === option).length;
      const pct = groups[groupName].length > 0 
        ? ((count / groups[groupName].length) * 100).toFixed(1) + '%'
        : '0%';
      row.push(pct);
      total += count;
    }
    
    const totalPct = respondents.length > 0 
      ? ((total / respondents.length) * 100).toFixed(1) + '%'
      : '0%';
    row.push(totalPct);
    
    rows.push(row.map(escapeCSV).join(','));
  }
  
  // N row
  const nRow = ['N'];
  for (const groupName of Object.keys(groups)) {
    nRow.push(groups[groupName].length);
  }
  nRow.push(respondents.length);
  rows.push(nRow.map(escapeCSV).join(','));
  
  return rows.join('\r\n');
}

/**
 * Export insights summary to CSV
 */
function exportInsightsToCsv(insights) {
  const rows = [
    ['Crowdwave Insights Summary'],
    [''],
    ['Total Respondents', insights.summary?.total_respondents || insights.summary?.totalRespondents || 0],
    ['Segments Analyzed', insights.summary?.segments_analyzed || insights.summary?.segmentsAnalyzed || 0],
    ['Questions Asked', insights.summary?.questions_asked || insights.summary?.totalQuestions || 0],
    [''],
    ['Key Findings'],
  ];

  const findings = insights.key_findings || insights.keyFindings || [];
  for (const finding of findings) {
    rows.push([finding.type, finding.finding]);
  }

  rows.push(['']);
  rows.push(['Question Results']);

  const byQuestion = insights.by_question || insights.questionInsights || {};
  for (const [qId, analysis] of Object.entries(byQuestion)) {
    rows.push([`Question: ${qId}`, analysis.question_text || analysis.questionText || '']);
    if (analysis.top_answer || analysis.topResponse) {
      const top = analysis.top_answer || { option: analysis.topResponse, percentage: analysis.topResponsePct };
      rows.push(['Top Answer', top.option, `${top.percentage}%`]);
    }
    if (analysis.mean) {
      rows.push(['Mean Rating', analysis.mean, `out of ${analysis.scale || 5}`]);
    }
    rows.push(['']);
  }

  return rows.map(row => row.map(cell => escapeCSV(cell)).join(',')).join('\n');
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

module.exports = {
  generateCSV,
  generateSummaryCSV,
  generateSegmentCSV,
  generateCrosstabCSV,
  exportToCsv,
  exportInsightsToCsv,
  escapeCSV,
  formatResponse,
  buildHeaders,
  buildRow,
  QUESTION_TYPES
};
