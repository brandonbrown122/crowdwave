'use client';

import { useState, useEffect } from 'react';

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const res = await fetch('/api/data-sources');
      if (res.ok) {
        setDataSources(await res.json());
      }
    } catch (err) {
      console.error('Failed to load data sources');
    }
    setLoading(false);
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadProgress(10);
    
    try {
      const res = await fetch('/api/data-sources/upload', {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        setUploadProgress(100);
        setTimeout(() => {
          setShowUpload(false);
          setUploadProgress(0);
          fetchDataSources();
        }, 500);
      }
    } catch (err) {
      console.error('Upload failed');
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const calibrationSources = [
    { name: 'Gallup Polling', type: 'Political/Social', records: '50K+', status: 'active', lastSync: '2026-02-09' },
    { name: 'Pew Research Center', type: 'Demographics', records: '100K+', status: 'active', lastSync: '2026-02-08' },
    { name: 'Conference Board', type: 'Executive/Business', records: '10K+', status: 'active', lastSync: '2026-02-07' },
    { name: 'JD Power', type: 'Consumer Satisfaction', records: '25K+', status: 'active', lastSync: '2026-02-05' },
    { name: 'NIMH/CDC', type: 'Mental Health', records: '15K+', status: 'active', lastSync: '2026-02-04' },
    { name: 'U. Michigan', type: 'Consumer Sentiment', records: '5K+', status: 'active', lastSync: '2026-02-01' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
          <p className="text-gray-600 mt-1">Manage calibration data and upload survey results</p>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Upload Data
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full m-4">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Upload Data</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="text-4xl mb-4">📁</div>
                <div className="font-medium text-gray-900">Drop files here or click to upload</div>
                <div className="text-sm text-gray-500 mt-1">CSV, XLSX, or JSON files supported</div>
                <input
                  type="file"
                  className="hidden"
                  id="fileInput"
                  accept=".csv,.xlsx,.json"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="fileInput"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  Select File
                </label>
              </div>

              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 mt-1 text-center">
                    {uploadProgress === 100 ? 'Complete!' : `Uploading... ${uploadProgress}%`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Calibration Sources */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Calibration Sources</h2>
          <span className="text-sm text-gray-500">{calibrationSources.length} sources</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Source</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Records</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {calibrationSources.map((source, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{source.name}</td>
                  <td className="p-4 text-sm text-gray-600">{source.type}</td>
                  <td className="p-4 text-sm text-gray-600">{source.records}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm text-green-700">Active</span>
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{source.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Uploaded Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Uploaded Data</h2>
          <span className="text-sm text-gray-500">{dataSources.length} files</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : dataSources.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900">No uploaded data</h3>
            <p className="text-gray-500 mt-1">Upload survey results to improve calibration</p>
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              + Upload Data
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {dataSources.map(source => (
              <div key={source.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{source.name}</h3>
                  <p className="text-sm text-gray-500">{source.records} records • {source.uploadDate}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm">View</button>
                  <button className="px-3 py-1.5 text-red-500 hover:text-red-700 text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Data Sources Work</h3>
        <p className="text-sm text-blue-700">
          Crowdwave uses calibration data from authoritative sources to improve simulation accuracy.
          Upload your own survey results to create custom calibrations for your specific audience segments.
        </p>
        <ul className="mt-3 text-sm text-blue-600 space-y-1">
          <li>• Calibration sources are automatically synced weekly</li>
          <li>• Uploaded data is used to train segment-specific models</li>
          <li>• More data = more accurate simulations</li>
        </ul>
      </div>
    </div>
  );
}
