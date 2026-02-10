'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultSampleSize: 500,
    confidenceThreshold: 70,
    showCalibrationWarnings: true,
    autoExportCsv: false,
    timezone: 'America/Chicago',
    apiKey: '',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('crowdwave_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure simulation defaults and preferences</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {/* Simulation Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Defaults</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Sample Size</label>
            <select 
              value={settings.defaultSampleSize}
              onChange={e => setSettings(prev => ({ ...prev, defaultSampleSize: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={100}>100 respondents</option>
              <option value={250}>250 respondents</option>
              <option value={500}>500 respondents</option>
              <option value={1000}>1,000 respondents</option>
              <option value={2000}>2,000 respondents</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Larger samples provide more stable distributions</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Threshold</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={50}
                max={95}
                value={settings.confidenceThreshold}
                onChange={e => setSettings(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">{settings.confidenceThreshold}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum confidence score to trust results</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-900">Show Calibration Warnings</div>
              <div className="text-sm text-gray-500">Display warnings for uncalibrated topics</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, showCalibrationWarnings: !prev.showCalibrationWarnings }))}
              className={`w-12 h-6 rounded-full transition ${settings.showCalibrationWarnings ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition ${settings.showCalibrationWarnings ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium text-gray-900">Auto-export CSV</div>
              <div className="text-sm text-gray-500">Automatically download CSV after simulation</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, autoExportCsv: !prev.autoExportCsv }))}
              className={`w-12 h-6 rounded-full transition ${settings.autoExportCsv ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition ${settings.autoExportCsv ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Regional</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select 
            value={settings.timezone}
            onChange={e => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full p-2 border rounded-lg"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>

      {/* API Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Access</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={settings.apiKey}
              onChange={e => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              className="flex-1 p-2 border rounded-lg font-mono"
              placeholder="sk-..."
            />
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Used for programmatic access to the API</p>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Version</span>
            <span className="text-gray-900">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Engine</span>
            <span className="text-gray-900">Crowdwave Engine v1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Calibrated Topics</span>
            <span className="text-gray-900">26</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Expected Accuracy</span>
            <span className="text-green-600">2-3pt on calibrated topics</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
