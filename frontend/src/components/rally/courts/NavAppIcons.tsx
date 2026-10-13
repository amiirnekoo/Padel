import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * آیکون رسمی اپلیکیشن نشان (Neshan)
 */
export const NeshanIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="8" fill="#0066FF" />
    <path
      d="M16 6.5L25 24L16 20.2L7 24L16 6.5Z"
      fill="white"
    />
    <path
      d="M16 6.5L25 24L16 20.2V6.5Z"
      fill="#E6F0FF"
    />
  </svg>
);

/**
 * آیکون رسمی اپلیکیشن بلد (Balad)
 */
export const BaladIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="8" fill="#00A651" />
    {/* Balad stylized locator pin */}
    <path
      d="M16 6C11.58 6 8 9.58 8 14C8 19.8 16 26.5 16 26.5C16 26.5 24 19.8 24 14C24 9.58 20.42 6 16 6Z"
      fill="white"
    />
    <circle cx="16" cy="13.5" r="3.5" fill="#00A651" />
  </svg>
);

/**
 * آیکون رسمی ۴ رنگ گوگل مپس (Google Maps)
 */
export const GoogleMapsIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="8" fill="#FFFFFF" />
    {/* Red Top */}
    <path
      d="M16 5C11.6 5 8 8.6 8 13C8 16.5 10.5 19.8 13 22.8L16 27L19 22.8C21.5 19.8 24 16.5 24 13C24 8.6 20.4 5 16 5Z"
      fill="#EA4335"
    />
    {/* Yellow Left curve */}
    <path
      d="M8 13C8 16.2 10.2 19.4 12.5 22.2L16 16L11 9C9.2 10.1 8 11.4 8 13Z"
      fill="#FBBC04"
    />
    {/* Green Bottom point */}
    <path
      d="M12.5 22.2L16 27L19.5 22.2L16 16L12.5 22.2Z"
      fill="#34A853"
    />
    {/* Blue Right curve */}
    <path
      d="M16 16L19.5 22.2C21.8 19.4 24 16.2 24 13C24 11.4 22.8 10.1 21 9L16 16Z"
      fill="#4285F4"
    />
    {/* Center circle */}
    <circle cx="16" cy="12.5" r="3.2" fill="white" />
  </svg>
);

/**
 * آیکون رسمی ویز (Waze) با چهره خندان و چرخ‌های خودرو
 */
export const WazeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="8" fill="#33CCFF" />
    {/* White Waze body */}
    <path
      d="M23 10C20.5 7.5 14.5 7.5 11.5 10C8.5 12.5 8 16.5 9.5 19.5L8.5 22.5L11.8 22C13.2 22.8 14.8 23.2 16.5 23.2C21.2 23.2 24.8 19.8 24.8 15.2C24.8 13.2 24.2 11.2 23 10Z"
      fill="white"
    />
    {/* Wheels */}
    <circle cx="12" cy="23.5" r="1.8" fill="#222222" />
    <circle cx="19.5" cy="23.5" r="1.8" fill="#222222" />
    {/* Eyes */}
    <circle cx="14" cy="14" r="1.4" fill="#222222" />
    <circle cx="19" cy="14" r="1.4" fill="#222222" />
    {/* Smile */}
    <path
      d="M14 17.5C14.8 19 18.2 19 19 17.5"
      stroke="#222222"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * استرینگ‌های SVG برای استفاده در پاپ‌آپ‌های HTML لیفلت
 */
export const NAV_SVG_STRINGS = {
  neshan: `<svg width="14" height="14" viewBox="0 0 32 32" fill="none" style="vertical-align:middle; display:inline-block; margin-left:3px;"><rect width="32" height="32" rx="8" fill="#0066FF"/><path d="M16 6.5L25 24L16 20.2L7 24L16 6.5Z" fill="white"/></svg>`,
  balad: `<svg width="14" height="14" viewBox="0 0 32 32" fill="none" style="vertical-align:middle; display:inline-block; margin-left:3px;"><rect width="32" height="32" rx="8" fill="#00A651"/><path d="M16 6C11.58 6 8 9.58 8 14C8 19.8 16 26.5 16 26.5C16 26.5 24 19.8 24 14C24 9.58 20.42 6 16 6Z" fill="white"/><circle cx="16" cy="13.5" r="3.5" fill="#00A651"/></svg>`,
  google: `<svg width="14" height="14" viewBox="0 0 32 32" fill="none" style="vertical-align:middle; display:inline-block; margin-left:3px;"><rect width="32" height="32" rx="8" fill="#FFFFFF"/><path d="M16 5C11.6 5 8 8.6 8 13C8 16.5 10.5 19.8 13 22.8L16 27L19 22.8C21.5 19.8 24 16.5 24 13C24 8.6 20.4 5 16 5Z" fill="#EA4335"/><path d="M8 13C8 16.2 10.2 19.4 12.5 22.2L16 16L11 9C9.2 10.1 8 11.4 8 13Z" fill="#FBBC04"/><path d="M12.5 22.2L16 27L19.5 22.2L16 16L12.5 22.2Z" fill="#34A853"/><path d="M16 16L19.5 22.2C21.8 19.4 24 16.2 24 13C24 11.4 22.8 10.1 21 9L16 16Z" fill="#4285F4"/><circle cx="16" cy="12.5" r="3.2" fill="white"/></svg>`,
  waze: `<svg width="14" height="14" viewBox="0 0 32 32" fill="none" style="vertical-align:middle; display:inline-block; margin-left:3px;"><rect width="32" height="32" rx="8" fill="#33CCFF"/><path d="M23 10C20.5 7.5 14.5 7.5 11.5 10C8.5 12.5 8 16.5 9.5 19.5L8.5 22.5L11.8 22C13.2 22.8 14.8 23.2 16.5 23.2C21.2 23.2 24.8 19.8 24.8 15.2C24.8 13.2 24.2 11.2 23 10Z" fill="white"/><circle cx="12" cy="23.5" r="1.8" fill="#222222"/><circle cx="19.5" cy="23.5" r="1.8" fill="#222222"/><circle cx="14" cy="14" r="1.4" fill="#222222"/><circle cx="19" cy="14" r="1.4" fill="#222222"/><path d="M14 17.5C14.8 19 18.2 19 19 17.5" stroke="#222222" strokeWidth="1.3" strokeLinecap="round"/></svg>`
};
