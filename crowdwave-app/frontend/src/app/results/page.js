'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ResultsPage() {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSimulations() {
      try {
        const res = await fetch('/api/results');
        setSimulations(await res.json());
      } catch (err) {
        setError('Failed to load simulations');
      } finally {
        setLoading(false);
      }
    }
    fetchSimulations();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulation Results</h1>
          <p className="text-gray-600 mt-1">View and export your synthetic research results</p>
        </div>
        <Link href="/simulate" className="bg-crowdwave-600 text-white px-4 py-2 rounded-lg hover:bg-crowdwave-700">
          + New Simulation
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : simulations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600 mb-2">No simulations yet</p>
            <p className="text-sm text-gray-500">Run your first simulation to see results here</p>
            <Link href="/simulate" className="inline-block mt-4 text-crowdwave-600 hover:text-crowdwave-800">
              Run Simulation →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Survey</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Segments</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Sample Size</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {simulations.map((sim) => (
                <tr key={sim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{sim.survey_name || 'Unknown Survey'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {Array.isArray(sim.segment_ids) ? sim.segment_ids.length : 1} segment(s)
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {sim.sample_size} respondents
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(sim.status)}`}>
                      {sim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sim.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {sim.status === 'completed' && (
                      <Link href={`/results/${sim.id}`} className="text-crowdwave-600 hover:text-crowdwave-800 text-sm font-medium">
                        View Results →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
