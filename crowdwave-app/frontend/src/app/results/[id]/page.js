'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResultDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/results/${id}`);
        if (!res.ok) throw new Error('Failed to load results');
        const json = await res.json();
        console.log('Results data:', json);
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id]);

  async function downloadCsv() {
    window.open(`/api/results/${id}/csv`, '_blank');
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading results...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>;
  if (!data) return <div className="text-center py-8 text-gray-500">Results not found</div>;

  const results = data.results || {};
  const responses = results.responses || [];
  const aggregates = results.aggregates || {};
  const segments = data.segments || results.segments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/results" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">← Back to Results</Link>
          <h1 className="text-2xl font-bold text-gray-900">{data.surveyName || 'Simulation Results'}</h1>
          <p className="text-gray-600 mt-1">
            {responses.length} respondents • {segments.length} segment(s) • 
            Status: <span className={data.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>{data.status}</span>
          </p>
        </div>
        <button onClick={downloadCsv} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          📥 Download CSV
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">📊 Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{responses.length}</div>
            <div className="text-sm text-gray-600">Respondents</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{Object.keys(aggregates).length}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{segments.length}</div>
            <div className="text-sm text-gray-600">Segments</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{data.status === 'completed' ? '✓' : '...'}</div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['overview', 'questions', 'respondents'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Segments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">👥 Segments</h2>
            <div className="flex flex-wrap gap-2">
              {segments.map((seg, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {seg.name || seg}
                </span>
              ))}
            </div>
          </div>

          {/* Question Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">📋 Question Results</h2>
            {Object.entries(aggregates).length === 0 ? (
              <p className="text-gray-500">No aggregate data available</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(aggregates).map(([qId, qData]) => (
                  <div key={qId} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="font-medium text-gray-900 mb-2">{qData.questionText || qId}</h3>
                    <p className="text-sm text-gray-500 mb-3">Type: {qData.type}</p>
                    
                    {/* Show distribution for each segment */}
                    {qData.bySegment && Object.entries(qData.bySegment).map(([segId, segData]) => (
                      <div key={segId} className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {segments.find(s => s.id === segId)?.name || segId}
                        </p>
                        
                        {/* Average for likert */}
                        {segData.average && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-bold text-blue-600">{segData.average}</span>
                            <span className="text-gray-500">average rating</span>
                          </div>
                        )}
                        
                        {/* Distribution */}
                        {segData.distribution && (
                          <div className="space-y-1">
                            {Object.entries(segData.distribution).map(([value, count]) => {
                              const total = Object.values(segData.distribution).reduce((a, b) => a + b, 0);
                              const pct = Math.round((count / total) * 100);
                              return (
                                <div key={value} className="flex items-center gap-3">
                                  <div className="w-8 text-sm text-gray-700">{value}</div>
                                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <div className="w-16 text-right text-sm text-gray-600">{pct}% ({count})</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">📋 All Questions</h2>
          {Object.entries(aggregates).length === 0 ? (
            <p className="text-gray-500">No question data available</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(aggregates).map(([qId, qData]) => (
                <div key={qId} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{qData.questionText || qId}</h3>
                  <p className="text-sm text-gray-500 mb-4">Type: {qData.type}</p>
                  
                  {qData.bySegment && Object.entries(qData.bySegment).map(([segId, segData]) => (
                    <div key={segId} className="mt-4 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Segment: {segments.find(s => s.id === segId)?.name || segId}
                      </p>
                      {segData.average && <p className="text-lg font-bold text-blue-600">Average: {segData.average}</p>}
                      {segData.distribution && (
                        <div className="mt-2 grid grid-cols-5 gap-2 text-center text-sm">
                          {Object.entries(segData.distribution).map(([val, count]) => (
                            <div key={val} className="bg-white rounded p-2">
                              <div className="font-bold">{count}</div>
                              <div className="text-gray-500">Rating {val}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'respondents' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">👤 Respondent Data</h2>
            <button onClick={downloadCsv} className="text-blue-600 hover:text-blue-800 text-sm">Download Full CSV →</button>
          </div>
          <p className="text-gray-600 mb-4">{responses.length} synthetic respondents generated</p>
          
          {responses.length === 0 ? (
            <p className="text-gray-500">No respondent data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">ID</th>
                    <th className="text-left px-3 py-2">Segment</th>
                    <th className="text-left px-3 py-2">Answers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {responses.slice(0, 50).map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs">{r.id?.slice(0, 20)}...</td>
                      <td className="px-3 py-2">{r.segmentName || r.segmentId?.slice(0, 8)}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {r.answers && Object.entries(r.answers).map(([q, a]) => (
                          <span key={q} className="mr-2 bg-gray-100 px-2 py-1 rounded text-xs">
                            {q}: {a}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {responses.length > 50 && (
                <p className="text-center text-gray-500 text-sm mt-4">Showing 50 of {responses.length} respondents. Download CSV for full data.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Debug Info */}
      <details className="text-xs text-gray-400">
        <summary className="cursor-pointer">Debug: Raw Data</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-64">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}
