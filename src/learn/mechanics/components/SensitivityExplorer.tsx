import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ParameterConfig, TopicDefinition } from '../types/mechanics';
import { solveTopicMechanics } from '../solvers';

interface SensitivityExplorerProps {
  topic: TopicDefinition;
  parameters: Record<string, number>;
  isDark: boolean;
}

export const SensitivityExplorer: React.FC<SensitivityExplorerProps> = ({
  topic,
  parameters,
  isDark,
}) => {
  // Choose parameter to sweep
  const [sweepParamId, setSweepParamId] = useState<string>(() => {
    return topic.parameterConfigs[0]?.id || '';
  });

  const activeConfig = topic.parameterConfigs.find((c) => c.id === sweepParamId) || topic.parameterConfigs[0];

  // Generate 20-point sensitivity response curve
  const curveData = useMemo(() => {
    if (!activeConfig) return [];
    const min = activeConfig.min;
    const max = activeConfig.max;
    const steps = 20;
    const stepSize = (max - min) / steps;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const sweptVal = min + i * stepSize;
      const trialParams = { ...parameters, [activeConfig.id]: sweptVal };
      const res = solveTopicMechanics(topic.id, trialParams);

      // Extract primary response metric
      let metricVal = 0;
      let metricLabel = 'Response';

      if (topic.id === 'beams') {
        metricVal = res.computedData.maxMoment ?? 0;
        metricLabel = 'Max Moment (N·m)';
      } else if (topic.id === 'newton') {
        metricVal = res.computedData.acceleration ?? 0;
        metricLabel = 'Acceleration (m/s²)';
      } else if (topic.id === 'projectile') {
        metricVal = res.computedData.rangeX ?? 0;
        metricLabel = 'Range (m)';
      } else if (topic.id === 'friction') {
        metricVal = res.computedData.maxStaticFriction ?? res.computedData.acceleration ?? 0;
        metricLabel = 'Friction / Accel';
      } else if (topic.id === 'trusses') {
        metricVal = Math.abs(res.computedData.memberForces?.AC ?? 0);
        metricLabel = 'Member Force (N)';
      } else {
        const firstVal = Object.values(res.computedData)[0];
        metricVal = typeof firstVal === 'number' ? firstVal : 0;
        metricLabel = 'Primary Metric';
      }

      pts.push({
        x: parseFloat(sweptVal.toFixed(2)),
        response: parseFloat(metricVal.toFixed(2)),
        metricLabel,
      });
    }
    return pts;
  }, [topic.id, parameters, activeConfig]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Real-Time Parameter Sensitivity Analysis
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sweep a parameter across its range to observe the physical response gradient
          </p>
        </div>

        {/* Sweep Parameter Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Sweep:</span>
          <select
            value={sweepParamId}
            onChange={(e) => setSweepParamId(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            {topic.parameterConfigs.map((cfg) => (
              <option key={cfg.id} value={cfg.id}>
                {cfg.name} ({cfg.unit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recharts Curve */}
      <div className="h-[220px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={curveData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis
              dataKey="x"
              stroke={isDark ? '#94a3b8' : '#64748b'}
              fontSize={11}
              unit={activeConfig?.unit ? ` ${activeConfig.unit}` : ''}
            />
            <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            />
            <Line
              type="monotone"
              dataKey="response"
              name="Solved Response"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
