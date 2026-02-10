'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnalyzePage() {
  const [data, setData] = useState(null);
  const [segments, setSegments] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [crossTabVar, setCrossTabVar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Failed to load results:', err);
    }
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        const parsed = parseCSV(csv);
        setData(parsed);
        extractSegments(parsed);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((h, i) => row[h.trim()] = values[i]?.trim());
      return row;
    });
    return { headers, rows };
  };

  const extractSegments = (data) => {
    const segmentCols = data.headers.filter(h => 
      ['audience', 'party', 'age', 'gender', 'region', 'segment'].includes(h.toLowerCase())
    );
    setSegments(segmentCols);
  };

  const getDistribution = (questionCol, filterFn = null) => {
    if (!data) return {};
    let rows = data.rows;
    if (filterFn) rows = rows.filter(filterFn);
    
    const counts = {};
    rows.forEach(row => {
      const val = row[questionCol];
      if (val) counts[val] = (counts[val] || 0) + 1;
    });
    
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const dist = {};
    Object.entries(counts).forEach(([k, v]) => {
      dist[k] = ((v / total) * 100).toFixed(1);
    });
    return dist;
  };

  const getCrossTab = (questionCol, segmentCol) => {
    if (!data) return {};
    const segmentValues = [...new Set(data.rows.map(r => r[segmentCol]))];
    const crossTab = {};
    
    segmentValues.forEach(seg => {
      crossTab[seg] = getDistribution(questionCol, row => row[segmentCol] === seg);
    });
    return crossTab;
  };

  const questionCols = data?.headers.filter(h => 
    h.startsWith('Q') || h.includes('question') || h.includes('_')
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analyze Results</h1>
          <p className="text-gray-600 mt-1">Cross-tabs, filters, and export</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['summary', 'crosstabs', 'export'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Load Data</h2>
        <div className="flex gap-4">
          <label className="flex-1">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <p className="text-gray-600">Drop CSV or click to upload</p>
              <p className="text-sm text-gray-400 mt-1">Respondent-level data</p>
            </div>
          </label>
          {results.length > 0 && (
            <div className="flex-1">
              <select 
                className="w-full p-4 border rounded-lg"
                onChange={(e) => {
                  if (e.target.value) {
                    // Load from API
                    fetch(`/api/results/${e.target.value}/csv`)
                      .then(r => r.text())
                      .then(csv => {
                        const parsed = parseCSV(csv);
                        setData(parsed);
                        extractSegments(parsed);
                      });
                  }
                }}
              >
                <option value="">Or select a simulation...</option>
                {results.map(r => (
                  <option key={r.id} value={r.id}>{r.name || `Simulation ${r.id}`}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {data && (
          <p className="mt-4 text-sm text-green-600">
            ✓ Loaded {data.rows.length} respondents, {data.headers.length} columns
          </p>
        )}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Question Summary</h2>
          <div className="space-y-6">
            {questionCols.map(q => {
              const dist = getDistribution(q);
              return (
                <div key={q} className="border-b pb-4">
                  <h3 className="font-medium text-gray-800 mb-2">{q}</h3>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(dist).sort((a, b) => b[1] - a[1]).map(([val, pct]) => (
                      <div key={val} className="bg-gray-50 px-3 py-2 rounded">
                        <span className="font-medium">{val}:</span> {pct}%
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CrossTabs Tab */}
      {activeTab === 'crosstabs' && data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Cross-Tabulation</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <select 
                className="w-full p-2 border rounded-lg"
                onChange={(e) => setCrossTabVar(prev => ({ ...prev, question: e.target.value }))}
              >
                <option value="">Select question...</option>
                {questionCols.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Segment By</label>
              <select 
                className="w-full p-2 border rounded-lg"
                onChange={(e) => setCrossTabVar(prev => ({ ...prev, segment: e.target.value }))}
              >
                <option value="">Select segment...</option>
                {segments.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {crossTabVar?.question && crossTabVar?.segment && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {crossTabVar.segment}
                    </th>
                    {Object.keys(getDistribution(crossTabVar.question)).map(opt => (
                      <th key={opt} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {opt}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(getCrossTab(crossTabVar.question, crossTabVar.segment)).map(([seg, dist]) => (
                    <tr key={seg}>
                      <td className="px-4 py-3 font-medium">{seg}</td>
                      {Object.entries(dist).map(([opt, pct]) => (
                        <td key={opt} className="px-4 py-3">{pct}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && data && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Export Data</h2>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => {
                const csv = [data.headers.join(','), ...data.rows.map(r => data.headers.map(h => r[h]).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'survey_respondents.csv';
                a.click();
              }}
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">Respondent CSV</div>
              <div className="text-sm text-gray-500">Individual responses</div>
            </button>
            <button 
              onClick={() => {
                let summary = 'Question,Option,Percentage\n';
                questionCols.forEach(q => {
                  const dist = getDistribution(q);
                  Object.entries(dist).forEach(([opt, pct]) => {
                    summary += `${q},${opt},${pct}\n`;
                  });
                });
                const blob = new Blob([summary], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'survey_summary.csv';
                a.click();
              }}
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Summary CSV</div>
              <div className="text-sm text-gray-500">Aggregate percentages</div>
            </button>
            <button 
              onClick={() => {
                const json = JSON.stringify({ 
                  respondents: data.rows.length,
                  questions: questionCols,
                  distributions: Object.fromEntries(questionCols.map(q => [q, getDistribution(q)]))
                }, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'survey_data.json';
                a.click();
              }}
              className="p-4 border rounded-lg hover:bg-gray-50 text-center"
            >
              <div className="text-2xl mb-2">{ }</div>
              <div className="font-medium">JSON Export</div>
              <div className="text-sm text-gray-500">Structured data</div>
            </button>
          </div>
        </div>
      )}

      {!data && (
        <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500">
          Upload a CSV or select a simulation to begin analysis
        </div>
      )}
    </div>
  );
}
