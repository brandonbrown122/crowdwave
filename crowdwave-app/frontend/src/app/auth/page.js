'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Set auth cookie
    document.cookie = `crowdwave_auth=${password}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    
    // Small delay then redirect
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crowdwave-600 to-crowdwave-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🌊 Crowdwave</h1>
          <p className="text-gray-600">Enter team password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Team Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-crowdwave-500 focus:border-crowdwave-500 text-lg"
              placeholder="Enter password..."
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
              loading || !password
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-crowdwave-600 hover:bg-crowdwave-700'
            }`}
          >
            {loading ? 'Authenticating...' : 'Enter Crowdwave'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Synthetic Audience Research Platform
        </p>
      </div>
    </div>
  );
}
