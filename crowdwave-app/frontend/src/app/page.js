'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Simple SVG-based charts for professional look without heavy dependencies

const BarChart = ({ data, title, color = '#3B82F6' }) => {
  const max = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-32 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || color
                }}
              />
            </div>
            <div className="w-16 text-sm font-medium text-gray-900 text-right">
              {item.value}{item.suffix || '%'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DonutChart = ({ data, title, centerLabel }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  
  const segments = data.map((d, i) => {
    const start = cumulative;
    cumulative += d.value;
    const startAngle = (start / total) * 360;
    const endAngle = (cumulative / total) * 360;
    return { ...d, startAngle, endAngle };
  });

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          {segments.map((seg, i) => (
            <path
              key={i}
              d={describeArc(50, 50, 40, seg.startAngle, seg.endAngle)}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeLinecap="round"
            />
          ))}
          <text x="50" y="50" textAnchor="middle" dy="0.35em" className="text-lg font-bold fill-gray-900">
            {centerLabel}
          </text>
        </svg>
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-gray-600">{d.label}</span>
              <span className="font-medium text-gray-900">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LineChart = ({ data, title }) => {
  const values = data.map(d => d.value);
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const range = max - min;
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 280 + 30,
    y: 120 - ((d.value - min) / range) * 100
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <svg viewBox="0 0 320 140" className="w-full h-40">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = 120 - pct;
          return (
            <g key={pct}>
              <line x1="30" y1={y} x2="310" y2={y} stroke="#E5E7EB" strokeWidth="1" />
              <text x="25" y={y + 4} textAnchor="end" className="text-xs fill-gray-400">
                {Math.round(min + (pct / 100) * range)}
              </text>
            </g>
          );
        })}
        
        {/* Line */}
        <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3B82F6" stroke="white" strokeWidth="2" />
        ))}
        
        {/* Labels */}
        {data.map((d, i) => (
          <text key={i} x={points[i].x} y="135" textAnchor="middle" className="text-xs fill-gray-500">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const StatCard = ({ title, value, change, changeLabel, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}% {changeLabel}
          </p>
        )}
      </div>
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
        {icon}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSimulations: 47,
    totalRespondents: 23500,
    avgAccuracy: 97.2,
    activeDomains: 12
  });

  // Accuracy by question type
  const accuracyData = [
    { label: 'Trust/Confidence', value: 98, color: '#22C55E' },
    { label: 'Awareness', value: 97, color: '#22C55E' },
    { label: 'Satisfaction', value: 95, color: '#3B82F6' },
    { label: 'Concern/Worry', value: 94, color: '#3B82F6' },
    { label: 'NPS', value: 92, color: '#F59E0B' },
    { label: 'Purchase Intent', value: 78, color: '#EF4444' },
  ];

  // Calibration coverage
  const calibrationData = [
    { label: 'Calibrated', value: 45, color: '#22C55E' },
    { label: 'Partial', value: 30, color: '#F59E0B' },
    { label: 'Uncalibrated', value: 25, color: '#E5E7EB' },
  ];

  // Simulations over time
  const trendsData = [
    { label: 'Sep', value: 12 },
    { label: 'Oct', value: 18 },
    { label: 'Nov', value: 24 },
    { label: 'Dec', value: 31 },
    { label: 'Jan', value: 38 },
    { label: 'Feb', value: 47 },
  ];

  // Recent simulations
  const recentSims = [
    { name: 'Authoritarianism Survey', audience: 'Independents', date: 'Today', status: 'complete' },
    { name: 'Epstein Files Release', audience: 'By Party', date: 'Today', status: 'complete' },
    { name: 'Mental Health Solutions', audience: 'Adults w/ Anxiety', date: 'Yesterday', status: 'complete' },
    { name: 'B2B Software Purchase', audience: 'IT Decision Makers', date: 'Yesterday', status: 'pending validation' },
    { name: 'Gen Z Social Media', audience: 'Gen Z 18-26', date: 'Yesterday', status: 'pending validation' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Survey simulation performance overview</p>
        </div>
        <Link 
          href="/simulate" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + New Simulation
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total Simulations" value={stats.totalSimulations} change={23} changeLabel="this month" icon="📊" />
        <StatCard title="Respondents Generated" value={stats.totalRespondents.toLocaleString()} change={15} changeLabel="this month" icon="👥" />
        <StatCard title="Avg Accuracy" value={`${stats.avgAccuracy}%`} change={2.1} changeLabel="improvement" icon="🎯" />
        <StatCard title="Calibrated Domains" value={stats.activeDomains} change={3} changeLabel="new this month" icon="✅" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        <BarChart 
          data={accuracyData} 
          title="Accuracy by Question Type"
        />
        <DonutChart 
          data={calibrationData} 
          title="Calibration Coverage"
          centerLabel="45%"
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        <LineChart 
          data={trendsData} 
          title="Simulations Over Time"
        />
        
        {/* Recent Simulations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Simulations</h3>
            <Link href="/results" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentSims.map((sim, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{sim.name}</p>
                  <p className="text-sm text-gray-500">{sim.audience}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{sim.date}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sim.status === 'complete' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {sim.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Queue */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Validation Queue</h3>
            <p className="text-gray-600 mt-1">5 surveys awaiting real-world validation for calibration improvement</p>
          </div>
          <div className="flex gap-3">
            <Link href="/analyze" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium border border-blue-200">
              Analyze Results
            </Link>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
              Export for Validation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
