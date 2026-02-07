/**
 * Data Processor Service
 * Handles processing of various file types: Excel, PDF, Images, Video
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Process uploaded data source based on file type
 * @param {string} filepath - Path to uploaded file
 * @param {string} type - File type (excel, pdf, image, video)
 * @returns {Object} - Processed content and metadata
 */
async function processDataSource(filepath, type) {
  switch (type) {
    case 'excel':
      return processExcel(filepath);
    case 'pdf':
      return processPdf(filepath);
    case 'image':
      return processImage(filepath);
    case 'video':
      return processVideo(filepath);
    default:
      return { content: '', metadata: { type: 'unknown' } };
  }
}

/**
 * Process Excel files
 */
function processExcel(filepath) {
  try {
    const workbook = XLSX.readFile(filepath);
    const sheets = {};
    const summaries = [];
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      sheets[sheetName] = data;
      
      // Generate summary
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        const summary = `Sheet "${sheetName}": ${data.length} rows, columns: ${columns.join(', ')}`;
        summaries.push(summary);
        
        // Sample first few rows for context
        const sample = data.slice(0, 5).map(row => JSON.stringify(row)).join('\n');
        summaries.push(`Sample data:\n${sample}`);
      }
    }

    return {
      content: summaries.join('\n\n'),
      metadata: {
        type: 'excel',
        sheets: workbook.SheetNames,
        totalRows: Object.values(sheets).reduce((sum, s) => sum + s.length, 0),
        parsedData: sheets
      }
    };
  } catch (error) {
    console.error('Excel processing error:', error);
    return {
      content: `Error processing Excel: ${error.message}`,
      metadata: { type: 'excel', error: error.message }
    };
  }
}

/**
 * Process PDF files
 */
async function processPdf(filepath) {
  try {
    // Dynamic import for pdf-parse (it can have issues with static import)
    let pdfParse;
    try {
      pdfParse = require('pdf-parse');
    } catch (e) {
      // If pdf-parse not available, return placeholder
      return {
        content: '[PDF content - install pdf-parse for text extraction]',
        metadata: { type: 'pdf', note: 'pdf-parse not installed' }
      };
    }

    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdfParse(dataBuffer);
    
    return {
      content: data.text,
      metadata: {
        type: 'pdf',
        pages: data.numpages,
        info: data.info,
        textLength: data.text.length
      }
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    return {
      content: `Error processing PDF: ${error.message}`,
      metadata: { type: 'pdf', error: error.message }
    };
  }
}

/**
 * Process image files
 * Stores path for later LLM vision analysis
 */
function processImage(filepath) {
  try {
    const stats = fs.statSync(filepath);
    const ext = path.extname(filepath).toLowerCase();
    
    return {
      content: `[Image file: ${path.basename(filepath)}]`,
      metadata: {
        type: 'image',
        format: ext.replace('.', ''),
        size: stats.size,
        filepath: filepath,
        note: 'Image available for vision analysis during simulation'
      }
    };
  } catch (error) {
    return {
      content: `Error processing image: ${error.message}`,
      metadata: { type: 'image', error: error.message }
    };
  }
}

/**
 * Process video files
 * Stores path for potential transcription
 */
function processVideo(filepath) {
  try {
    const stats = fs.statSync(filepath);
    const ext = path.extname(filepath).toLowerCase();
    
    return {
      content: `[Video file: ${path.basename(filepath)}]`,
      metadata: {
        type: 'video',
        format: ext.replace('.', ''),
        size: stats.size,
        filepath: filepath,
        note: 'Video transcription can be added - currently stored for reference'
      }
    };
  } catch (error) {
    return {
      content: `Error processing video: ${error.message}`,
      metadata: { type: 'video', error: error.message }
    };
  }
}

/**
 * Extract structured data from Excel for persona generation
 */
function extractDataForPersonas(dataSources) {
  const extracted = {
    demographics: [],
    behaviors: [],
    preferences: [],
    quotes: [],
    statistics: []
  };

  for (const ds of dataSources) {
    if (ds.metadata?.parsedData) {
      for (const [sheetName, rows] of Object.entries(ds.metadata.parsedData)) {
        for (const row of rows) {
          // Look for demographic fields
          const demoFields = ['age', 'gender', 'income', 'location', 'education'];
          const behaviorFields = ['purchase', 'frequency', 'channel', 'behavior'];
          const prefFields = ['preference', 'like', 'favorite', 'prefer'];
          
          for (const [key, value] of Object.entries(row)) {
            const keyLower = key.toLowerCase();
            if (demoFields.some(f => keyLower.includes(f))) {
              extracted.demographics.push({ field: key, value });
            } else if (behaviorFields.some(f => keyLower.includes(f))) {
              extracted.behaviors.push({ field: key, value });
            } else if (prefFields.some(f => keyLower.includes(f))) {
              extracted.preferences.push({ field: key, value });
            }
          }
        }
      }
    }
  }

  return extracted;
}

module.exports = { 
  processDataSource,
  extractDataForPersonas
};
