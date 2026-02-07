'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ResultDetailPage() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/results/${id}`);
        if (!res.ok) throw new Error('Failed to load results');
        setResults(await res.json());
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

  const getConfidenceColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading results...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>;
  if (!results) return <div className="text-center py-8 text-gray-500">Results not found</div>;

  const { simulation, survey, segments, insights, confidence_scores, respondent_count } = results;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/results" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">← Back to Results</Link>
          <h1 className="text-2xl font-bold text-gray-900">{survey?.name || 'Simulation Results'}</h1>
          <p className="text-gray-600 mt-1">{respondent_count} respondents • {segments?.length || 0} segment(s)</p>
        </div>
        <button onClick={downloadCsv} className="bg-crowdwave-600 text-white px-4 py-2 rounded-lg hover:bg-crowdwave-700 flex items-center gap-2">
          📥 Download CSV
        </button>
      </div>

      {/* Overall Confidence */}
      {confidence_scores?._overall && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Overall Confidence</h2>
              <p className="text-sm text-gray-600">{confidence_scores._overall.note}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getConfidenceColor(confidence_scores._overall.score)}`}>
              {confidence_scores._overall.score}%
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['insights', 'questions', 'respondents', 'confidence'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-1 border-b-2 font-medium text-sm transition ${activeTab === tab ? 'border-crowdwave-500 text-crowdwave-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'insights' && insights && (
        <div className="space-y-6">
          {/* Key Findings */}
          {insights.key_findings?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">🔑 Key Findings</h2>
              <ul className="space-y-3">
                {insights.key_findings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-crowdwave-600">•</span>
                    <span className="text-gray-700">{finding.finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cross-Segment Comparisons */}
          {insights.cross_segment_comparisons?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">📊 Segment Differences</h2>
              <div className="space-y-4">
                {insights.cross_segment_comparisons.map((comp, i) => (
                  <div key={i} className="border-l-4 border-crowdwave-500 pl-4">
                    <p className="font-medium text-gray-900">{comp.question_text}</p>
                    <p className="text-sm text-gray-600 mt-1">{comp.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'questions' && insights?.by_question && (
        <div className="space-y-4">
          {Object.entries(insights.by_question).map(([qId, analysis]) => (
            <div key={qId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-3">{analysis.question_text}</h3>
              <div className="text-sm text-gray-500 mb-4">{analysis.question_type.replace('_', ' ')}</div>
              
              {/* Multiple Choice */}
              {analysis.distribution && (
                <div className="space-y-2">
                  {Object.entries(analysis.distribution).map(([option, data]) => (
                    <div key={option} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-gray-700 truncate">{option}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div className="bg-crowdwave-500 h-full" style={{ width: `${data.percentage}%` }} />
                      </div>
                      <div className="w-16 text-right text-sm text-gray-600">{data.percentage}%</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Likert */}
              {analysis.mean && (
                <div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-crowdwave-600">{analysis.mean}</span>
                    <span className="text-gray-500">/ {analysis.scale}</span>
                    <span className="text-sm text-gray-600">({analysis.interpretation})</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">Std Dev: {analysis.std_dev}</div>
                </div>
              )}

              {/* Open Ended */}
              {analysis.top_themes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Top Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.top_themes.map((theme, i) => (
                      <span key={i} className="bg-crowdwave-100 text-crowdwave-800 px-3 py-1 rounded-full text-sm">
                        {theme.theme} ({theme.percentage}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ranking */}
              {analysis.rankings && (
                <div className="space-y-2">
                  {analysis.rankings.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-crowdwave-100 text-crowdwave-800 rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                      <span className="text-gray-700">{item.item}</span>
                      <span className="text-sm text-gray-500">(avg rank: {item.avg_rank})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'respondents' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Respondent Data</h2>
            <button onClick={downloadCsv} className="text-crowdwave-600 hover:text-crowdwave-800 text-sm">Download Full CSV →</button>
          </div>
          <p className="text-gray-600 mb-4">{respondent_count} synthetic respondents generated</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">ID</th>
                  <th className="text-left px-3 py-2">Segment</th>
                  <th className="text-left px-3 py-2">Age</th>
                  <th className="text-left px-3 py-2">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.respondents?.slice(0, 20).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{r.id.slice(0, 8)}...</td>
                    <td className="px-3 py-2">{r.persona?.segment_name}</td>
                    <td className="px-3 py-2">{r.persona?.demographics?.age}</td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-md">{r.persona?.profile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {respondent_count > 20 && (
              <p className="text-center text-gray-500 text-sm mt-4">Showing 20 of {respondent_count} respondents. Download CSV for full data.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'confidence' && confidence_scores && (
        <div className="space-y-4">
          {Object.entries(confidence_scores).filter(([k]) => k !== '_overall').map(([qId, score]) => (
            <div key={qId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{qId}</h3>
                  <p className="text-sm text-gray-600">{score.level} confidence</p>
                </div>
                <div className={`px-3 py-1 rounded-lg font-bold ${getConfidenceColor(score.score)}`}>
                  {score.score}%
                </div>
              </div>
              
              {score.factors && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(score.factors).map(([factor, data]) => (
                    <div key={factor} className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-500">{factor.replace(/_/g, ' ')}</div>
                      <div className="font-medium">{Math.round(data.score * 100)}%</div>
                    </div>
                  ))}
                </div>
              )}

              {score.recommendations?.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {score.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
