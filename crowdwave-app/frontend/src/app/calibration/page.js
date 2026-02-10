'use client';

import { useState, useEffect } from 'react';

export default function CalibrationPage() {
  const calibrations = [
    // Political
    { category: 'Political', topic: 'Party Affiliation', status: 'calibrated', source: 'Pew/Gallup 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Political', topic: 'Transparency (Partisan)', status: 'calibrated', source: 'Internal validation', error: '1.5pt', lastValidated: '2026-02' },
    { category: 'Political', topic: 'Climate Policy', status: 'calibrated', source: 'Pew 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Political', topic: 'Gun Policy', status: 'calibrated', source: 'Gallup 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Political', topic: 'Immigration Policy', status: 'calibrated', source: 'Pew 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Political', topic: 'Healthcare Policy', status: 'calibrated', source: 'KFF 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Political', topic: 'Media Trust', status: 'calibrated', source: 'Gallup 2025', error: '2-3pt', lastValidated: '2026-02' },
    
    // Consumer
    { category: 'Consumer', topic: 'Streaming Satisfaction', status: 'calibrated', source: 'JD Power 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Consumer', topic: 'Streaming Cancellation Intent', status: 'calibrated', source: 'Antenna Data', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Consumer', topic: 'Cruise Satisfaction', status: 'calibrated', source: 'CLIA 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Consumer', topic: 'Subscription Services', status: 'partial', source: 'Amazon S&S validation', error: '3-4pt', lastValidated: '2026-02' },
    
    // Work
    { category: 'Work', topic: 'Remote Work Satisfaction', status: 'calibrated', source: 'Gallup 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Work', topic: 'Remote Productivity', status: 'calibrated', source: 'Gallup 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Work', topic: 'Return to Office Preference', status: 'calibrated', source: 'Gallup/Pew 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Work', topic: 'Flexible Schedule Importance', status: 'calibrated', source: 'Gallup 2025', error: '2-3pt', lastValidated: '2026-02' },
    
    // Executive
    { category: 'Executive', topic: 'C-Suite Cyber Concern', status: 'calibrated', source: 'Conference Board 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Executive', topic: 'C-Suite Recession Outlook', status: 'calibrated', source: 'Conference Board 2025', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Executive', topic: 'C-Suite AI Investment', status: 'calibrated', source: 'Conference Board 2025', error: '2-3pt', lastValidated: '2026-02' },
    
    // Health
    { category: 'Health', topic: 'Healthcare Concerns', status: 'calibrated', source: 'Gallup 2026', error: '2-3pt', lastValidated: '2026-01' },
    { category: 'Health', topic: 'Mental Health Prevalence', status: 'calibrated', source: 'NIMH/CDC 2025', error: '1-2pt', lastValidated: '2026-02' },
    { category: 'Health', topic: 'Therapy Satisfaction', status: 'calibrated', source: 'Internal validation', error: '2-3pt', lastValidated: '2026-02' },
    
    // Economics
    { category: 'Economics', topic: 'Consumer Sentiment', status: 'calibrated', source: 'U. Michigan Index', error: '2-3pt', lastValidated: '2026-02' },
    { category: 'Economics', topic: 'Recession Expectations', status: 'calibrated', source: 'Fed/Conference Board', error: '2-3pt', lastValidated: '2026-02' },
    
    // Demographics
    { category: 'Demographics', topic: 'Gen Z Attitudes', status: 'partial', source: 'Pew 2025', error: '3-5pt', lastValidated: '2025-12' },
    { category: 'Demographics', topic: 'Boomer Attitudes', status: 'calibrated', source: 'Pew 2025', error: '2-3pt', lastValidated: '2026-01' },
    { category: 'Demographics', topic: 'Hispanic/Latino', status: 'uncalibrated', source: 'N/A', error: '5pt+', lastValidated: 'N/A' },
  ];

  const categories = [...new Set(calibrations.map(c => c.category))];
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all' 
    ? calibrations 
    : calibrations.filter(c => c.category === activeCategory);

  const stats = {
    calibrated: calibrations.filter(c => c.status === 'calibrated').length,
    partial: calibrations.filter(c => c.status === 'partial').length,
    uncalibrated: calibrations.filter(c => c.status === 'uncalibrated').length,
  };

  const getStatusStyle = (status) => {
    const styles = {
      calibrated: 'bg-green-100 text-green-700',
      partial: 'bg-yellow-100 text-yellow-700',
      uncalibrated: 'bg-red-100 text-red-600'
    };
    return styles[status] || styles.uncalibrated;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calibration Status</h1>
        <p className="text-gray-600 mt-1">View calibrated topics and validation data sources</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-700">{stats.calibrated}</div>
          <div className="text-sm text-green-600">Fully Calibrated</div>
          <div className="text-xs text-green-500 mt-1">2-3pt expected error</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-700">{stats.partial}</div>
          <div className="text-sm text-yellow-600">Partially Calibrated</div>
          <div className="text-xs text-yellow-500 mt-1">3-5pt expected error</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-700">{stats.uncalibrated}</div>
          <div className="text-sm text-red-600">Uncalibrated</div>
          <div className="text-xs text-red-500 mt-1">5pt+ expected error</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({calibrations.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat} ({calibrations.filter(c => c.category === cat).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Topic</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Category</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Expected Error</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Source</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Last Validated</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((cal, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{cal.topic}</td>
                <td className="p-4 text-sm text-gray-600">{cal.category}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(cal.status)}`}>
                    {cal.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">{cal.error}</td>
                <td className="p-4 text-sm text-gray-500">{cal.source}</td>
                <td className="p-4 text-sm text-gray-500">{cal.lastValidated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">About Calibration</h3>
        <div className="prose prose-sm text-gray-600">
          <p>
            Crowdwave calibrates its synthetic population against real-world survey data and authoritative sources.
            Calibrated topics use validated distributions that have been compared against actual survey results.
          </p>
          <ul className="mt-2">
            <li><strong>Calibrated:</strong> Validated against real data with &lt;3pt mean absolute error</li>
            <li><strong>Partial:</strong> Some reference data available, 3-5pt expected error</li>
            <li><strong>Uncalibrated:</strong> Uses general population benchmarks only</li>
          </ul>
          <p className="mt-2">
            To improve accuracy for uncalibrated topics, run parallel real surveys and submit results for validation.
          </p>
        </div>
      </div>
    </div>
  );
}
