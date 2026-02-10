'use client';

// Professional SVG Chart Components for Crowdwave

export const BarChartHorizontal = ({ data, title, height = 200, showValues = true, colorScale = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'] }) => {
  const max = Math.max(...data.map(d => d.value));
  
  const getColor = (value, index) => {
    if (data[index].color) return data[index].color;
    if (value >= 90) return colorScale[0];
    if (value >= 70) return colorScale[1];
    if (value >= 50) return colorScale[2];
    return colorScale[3];
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-28 text-xs text-gray-600 truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 bg-gray-100 rounded h-5 overflow-hidden">
              <div 
                className="h-full rounded transition-all duration-700 ease-out"
                style={{ 
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: getColor(item.value, i)
                }}
              />
            </div>
            {showValues && (
              <div className="w-12 text-xs font-medium text-gray-700 text-right">
                {item.value}{item.suffix || '%'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const StackedBar = ({ data, title, categories }) => {
  const colors = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="space-y-3">
        {data.map((row, i) => (
          <div key={i}>
            <div className="text-xs text-gray-600 mb-1">{row.label}</div>
            <div className="flex h-6 rounded overflow-hidden">
              {row.values.map((val, j) => (
                <div
                  key={j}
                  className="h-full transition-all duration-500"
                  style={{ width: `${val}%`, backgroundColor: colors[j % colors.length] }}
                  title={`${categories[j]}: ${val}%`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-gray-600">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SparkLine = ({ data, width = 100, height = 30, color = '#3B82F6' }) => {
  const values = data.map(d => typeof d === 'number' ? d : d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const points = values.map((v, i) => ({
    x: (i / (values.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <svg width={width} height={height} className="inline-block">
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
    </svg>
  );
};

export const GaugeChart = ({ value, max = 100, label, size = 120 }) => {
  const percentage = (value / max) * 100;
  const angle = (percentage / 100) * 180;
  const radius = size / 2 - 10;
  
  const getColor = () => {
    if (percentage >= 80) return '#22C55E';
    if (percentage >= 60) return '#3B82F6';
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };
  
  const x = size / 2 + radius * Math.cos((180 - angle) * Math.PI / 180);
  const y = size / 2 - radius * Math.sin((180 - angle) * Math.PI / 180);
  
  return (
    <div className="text-center">
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${x} ${y}`}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <text x={size / 2} y={size / 2 - 5} textAnchor="middle" className="text-xl font-bold" fill="#111827">
          {value}%
        </text>
      </svg>
      {label && <div className="text-xs text-gray-500 mt-1">{label}</div>}
    </div>
  );
};

export const DistributionChart = ({ data, title, labels }) => {
  const values = Object.values(data);
  const max = Math.max(...values);
  const total = values.reduce((a, b) => a + b, 0);
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="flex items-end gap-1 h-24">
        {Object.entries(data).map(([key, value], i) => (
          <div key={key} className="flex-1 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">{((value / total) * 100).toFixed(0)}%</div>
            <div 
              className="w-full bg-blue-500 rounded-t transition-all duration-500"
              style={{ height: `${(value / max) * 100}%`, minHeight: 4 }}
            />
            <div className="text-xs text-gray-600 mt-1">{labels?.[i] || key}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ComparisonTable = ({ data, columns, title }) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">{columns[0]}</th>
              {columns.slice(1).map((col, i) => (
                <th key={i} className="text-right py-2 text-gray-500 font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 text-gray-900">{row.label}</td>
                {row.values.map((val, j) => (
                  <td key={j} className="text-right py-2 font-medium text-gray-900">
                    {typeof val === 'number' ? `${val}%` : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TrendIndicator = ({ value, previousValue, label }) => {
  const change = value - previousValue;
  const percentChange = previousValue ? ((change / previousValue) * 100).toFixed(1) : 0;
  const isPositive = change >= 0;
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-gray-900">{value}%</span>
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <span>{isPositive ? '↑' : '↓'}</span>
        <span>{Math.abs(percentChange)}%</span>
      </div>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
};
