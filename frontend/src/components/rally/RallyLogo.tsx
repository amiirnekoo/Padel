import React from 'react';

interface RallyLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  height?: number;
}

export const RallyLogo: React.FC<RallyLogoProps> = ({
  className = 'h-10 sm:h-12 w-auto',
  variant = 'light',
  height = 44
}) => {
  return (
    <div className={`relative flex items-center shrink-0 ${className}`}>
      <img
        src="/images/rally_logo.svg?v=20261007_v3"
        alt="رالی | RALLY"
        height={height}
        className="h-full w-auto object-contain select-none"
        onError={(e) => {
          // Fallback to crisp extracted PNG if needed
          const target = e.currentTarget;
          if (!target.src.includes('rally_logo_crisp.png')) {
            target.src = '/images/rally_logo_crisp.png?v=20261007_v3';
          }
        }}
      />
    </div>
  );
};
