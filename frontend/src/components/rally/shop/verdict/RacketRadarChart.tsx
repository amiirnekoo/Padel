import React, { useState } from 'react';
import { RacketVerdictParameters } from '../../../../types/racketVerdict';

interface RacketRadarChartProps {
  parameters: RacketVerdictParameters;
  activeKey?: string | null;
  onHoverParam?: (key: string | null) => void;
}

interface AxisConfig {
  key: keyof RacketVerdictParameters;
  label_fa: string;
  label_en: string;
}

const RADAR_AXES: AxisConfig[] = [
  { key: 'power', label_fa: 'قدرت', label_en: 'Power' },
  { key: 'control', label_fa: 'کنترل', label_en: 'Control' },
  { key: 'maneuverability', label_fa: 'مانورپذیری', label_en: 'Maneuv.' },
  { key: 'spin', label_fa: 'پیچ‌دهی', label_en: 'Spin' },
  { key: 'comfort', label_fa: 'راحتی دست', label_en: 'Comfort' },
  { key: 'sweetspot', label_fa: 'سوییت اسپات', label_en: 'Sweetspot' },
  { key: 'playability', label_fa: 'سهولت بازی', label_en: 'Playability' },
  { key: 'stability', label_fa: 'پایداری فریم', label_en: 'Stability' },
];

export const RacketRadarChart: React.FC<RacketRadarChartProps> = React.memo(({
  parameters,
  activeKey,
  onHoverParam
}) => {
  const [internalHover, setInternalHover] = useState<string | null>(null);
  const hovered = activeKey !== undefined ? activeKey : internalHover;

  const size = 300;
  const center = size / 2;
  const radius = 100;
  const totalAxes = RADAR_AXES.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  // محاسبه مختصات یک نقطه در زاویه معین با درصد مشخص
  const getCoordinates = (index: number, valueRatio: number) => {
    // از بالای چارت شروع می‌کنیم (منفی پی/۲)
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueRatio;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // حلقه‌های ۸ ضلعی پس‌زمینه (۲۰٪ تا ۱۰۰٪)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // محاسبه چندضلعی داده‌های راکت
  const polygonPoints = RADAR_AXES.map((axis, i) => {
    const val = parameters[axis.key] || 7.0;
    const ratio = Math.min(1, Math.max(0, val / 10));
    const pt = getCoordinates(i, ratio);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const handleMouseEnter = (k: string) => {
    setInternalHover(k);
    if (onHoverParam) onHoverParam(k);
  };

  const handleMouseLeave = () => {
    setInternalHover(null);
    if (onHoverParam) onHoverParam(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 select-none">
      <div className="flex items-center justify-between w-full mb-1 px-2">
        <span className="text-[11px] font-bold tracking-wider text-cyan-400">
          رادار عملکرد ۸ گانه (PERFORMANCE RADAR)
        </span>
        <span className="text-[10px] text-slate-400">
          برای مشاهده امتیاز روی هر راس نگه دارید
        </span>
      </div>

      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* شبکه‌های چندضلعی متحدالمرکز */}
          {gridLevels.map((lvl) => {
            const pts = RADAR_AXES.map((_, i) => {
              const pt = getCoordinates(i, lvl);
              return `${pt.x},${pt.y}`;
            }).join(' ');
            return (
              <polygon
                key={lvl}
                points={pts}
                fill="none"
                stroke="#1e293b"
                strokeWidth={lvl === 1 ? '1.5' : '1'}
                strokeDasharray={lvl === 1 ? undefined : '2,2'}
              />
            );
          })}

          {/* خطوط محور از مرکز به راس‌ها */}
          {RADAR_AXES.map((_, i) => {
            const pt = getCoordinates(i, 1.0);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={pt.x}
                y2={pt.y}
                stroke="#1e293b"
                strokeWidth="1"
              />
            );
          })}

          {/* پلی‌گان رنگی نمرات راکت */}
          <polygon
            points={polygonPoints}
            fill="rgba(6, 182, 212, 0.28)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* نقاط (نودها) روی رئوس */}
          {RADAR_AXES.map((axis, i) => {
            const val = parameters[axis.key] || 7.0;
            const ratio = Math.min(1, Math.max(0, val / 10));
            const pt = getCoordinates(i, ratio);
            const isHovered = hovered === axis.key;

            return (
              <g key={axis.key}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#38bdf8' : '#06b6d4'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(axis.key)}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}

          {/* برچسب‌های متنی دور چارت */}
          {RADAR_AXES.map((axis, i) => {
            const pt = getCoordinates(i, 1.22);
            const val = parameters[axis.key] || 7.0;
            const isHovered = hovered === axis.key;

            return (
              <text
                key={axis.key}
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isHovered ? '11' : '10'}
                fontWeight={isHovered ? '800' : '600'}
                fill={isHovered ? '#38bdf8' : '#94a3b8'}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => handleMouseEnter(axis.key)}
                onMouseLeave={handleMouseLeave}
              >
                {axis.label_fa} ({val.toFixed(1)})
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
});

RacketRadarChart.displayName = 'RacketRadarChart';
