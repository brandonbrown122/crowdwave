'use client';

import { useState, useEffect } from 'react';

export default function SegmentsPage() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    demographics: {
      ageRange: [18, 65],
      gender: 'all',
      income: 'all',
      geography: 'USA'
    },
    psychographics: {
      values: [],
      interests: []
    },
    size: 500
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const res = await fetch('/api/segments');
      setSegments(await res.json());
    } catch (err) {
      console.error('Failed to load segments');
    }
    setLoading(false);
  };

  const presetSegments = [
    { 
      name: 'Gen Z Adults', 
      description: 'Ages 18-26, digital natives',
      demographics: { ageRange: [18, 26], gender: 'all' },
      icon: '📱'
    },
    { 
      name: 'Millennials', 
      description: 'Ages 27-42, career focused',
      demographics: { ageRange: [27, 42], gender: 'all' },
      icon: '💼'
    },
    { 
      name: 'Boomers', 
      description: 'Ages 60-78, established',
      demographics: { ageRange: [60, 78], gender: 'all' },
      icon: '🏠'
    },
    { 
      name: 'High Income', 
      description: 'HH income $150K+',
      demographics: { income: '$150K+' },
      icon: '💎'
    },
    { 
      name: 'Parents', 
      description: 'With children under 18',
      demographics: { hasChildren: true },
      icon: '👨‍👩‍👧'
    },
    { 
      name: 'Democrats', 
      description: 'Democratic party affiliation',
      demographics: { party: 'democrat' },
      icon: '🔵'
    },
    { 
      name: 'Republicans', 
      description: 'Republican party affiliation',
      demographics: { party: 'republican' },
      icon: '🔴'
    },
    { 
      name: 'Independents', 
      description: 'No party affiliation',
      demographics: { party: 'independent' },
      icon: '🟣'
    },
  ];

  const calibrationStatus = {
    'Gen Z Adults': 'partial',
    'Millennials': 'partial',
    'Boomers': 'calibrated',
    'High Income': 'uncalibrated',
    'Parents': 'partial',
    'Democrats': 'calibrated',
    'Republicans': 'calibrated',
    'Independents': 'calibrated'
  };

  const getStatusBadge = (status) => {
    const styles = {
      calibrated: 'bg-green-100 text-green-700',
      partial: 'bg-yellow-100 text-yellow-700',
      uncalibrated: 'bg-gray-100 text-gray-500'
    };
    return styles[status] || styles.uncalibrated;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audience Segments</h1>
          <p className="text-gray-600 mt-1">Define target audiences for simulation</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Create Segment
        </button>
      </div>

      {/* Calibration Guide */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-xl">💡</div>
          <div>
            <h3 className="font-medium text-blue-900">Calibration Status Guide</h3>
            <p className="text-sm text-blue-700 mt-1">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Calibrated:</span> Validated with real data (2-3pt error) • 
              <span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Partial:</span> Some calibration (3-5pt error) • 
              <span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 bg-gray-400 rounded-full"></span> Uncalibrated:</span> Default benchmarks (5pt+ error)
            </p>
          </div>
        </div>
      </div>

      {/* Preset Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Segments</h2>
        <div className="grid grid-cols-4 gap-4">
          {presetSegments.map((seg, i) => (
            <button
              key={i}
              className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition group"
            >
              <div className="flex justify-between items-start">
                <div className="text-2xl mb-2">{seg.icon}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(calibrationStatus[seg.name])}`}>
                  {calibrationStatus[seg.name]}
                </span>
              </div>
              <div className="font-medium text-gray-900">{seg.name}</div>
              <div className="text-sm text-gray-500">{seg.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Custom Segments</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : segments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900">No custom segments</h3>
            <p className="text-gray-500 mt-1">Use quick segments above or create a custom one</p>
          </div>
        ) : (
          <div className="divide-y">
            {segments.map(seg => (
              <div key={seg.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{seg.name}</h3>
                  <p className="text-sm text-gray-500">{seg.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm">Edit</button>
                  <button className="px-3 py-1.5 text-red-500 hover:text-red-700 text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full m-4">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Segment</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segment Name</label>
                <input
                  type="text"
                  value={newSegment.name}
                  onChange={e => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="e.g., Young Urban Professionals"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newSegment.description}
                  onChange={e => setNewSegment(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Brief description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                  <div className="flex gap-2">
                    <input type="number" className="w-full p-2 border rounded-lg" placeholder="Min" defaultValue={18} />
                    <span className="self-center">-</span>
                    <input type="number" className="w-full p-2 border rounded-lg" placeholder="Max" defaultValue={65} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geography</label>
                <select className="w-full p-2 border rounded-lg">
                  <option value="USA">United States</option>
                  <option value="urban">Urban USA</option>
                  <option value="suburban">Suburban USA</option>
                  <option value="rural">Rural USA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sample Size</label>
                <input
                  type="number"
                  value={newSegment.size}
                  onChange={e => setNewSegment(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
