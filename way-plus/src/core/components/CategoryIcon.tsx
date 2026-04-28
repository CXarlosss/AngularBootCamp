import React from 'react';

export type Category = 
  | 'autonomy' 
  | 'assertiveness' 
  | 'regulation' 
  | 'relaxation'
  | 'social' 
  | 'persistence'
  | 'self-esteem';

interface CategoryIconProps {
  category: Category;
  size?: number;
}

const icons: Record<Category, React.FC<{ size: number }>> = {
  regulation: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="34" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="1"/>
      <ellipse cx="36" cy="28" rx="10" ry="11" fill="#F5C4B3" stroke="#D85A30" strokeWidth="0.8"/>
      <path d="M28 38 Q36 45 44 38" fill="#F5C4B3" stroke="#D85A30" strokeWidth="0.8"/>
      <path d="M26 50 Q36 56 46 50" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 32 Q32 30 34 32" fill="none" stroke="#3C3489" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M38 32 Q40 30 42 32" fill="none" stroke="#3C3489" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M22 20 Q36 10 50 20" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2"/>
      <path d="M22 20 L20 28" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M50 20 L52 28" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  autonomy: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="34" fill="#EEEDFE" stroke="#7F77DD" strokeWidth="1"/>
      <ellipse cx="36" cy="22" rx="9" ry="10" fill="#F5C4B3" stroke="#D85A30" strokeWidth="0.8"/>
      <rect x="27" y="31" width="18" height="16" rx="4" fill="#7F77DD"/>
      <line x1="27" y1="37" x2="20" y2="42" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="45" y1="37" x2="52" y2="42" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="47" x2="28" y2="58" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="42" y1="47" x2="44" y2="58" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <path d="M42 48 L50 40 L54 44" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  social: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="34" fill="#E6F1FB" stroke="#378ADD" strokeWidth="1"/>
      <ellipse cx="24" cy="24" rx="8" ry="8.5" fill="#F5C4B3" stroke="#D85A30" strokeWidth="0.8"/>
      <ellipse cx="48" cy="24" rx="8" ry="8.5" fill="#AFA9EC" stroke="#534AB7" strokeWidth="0.8"/>
      <rect x="16" y="31" width="15" height="13" rx="3" fill="#378ADD"/>
      <rect x="41" y="31" width="15" height="13" rx="3" fill="#534AB7"/>
      <path d="M31 40 Q36 46 41 40" fill="none" stroke="#EF9F27" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="29" y="48" width="14" height="8" rx="3" fill="#EF9F27"/>
      <path d="M32 52 L34 54 L40 49" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  assertiveness: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="34" fill="#FAEEDA" stroke="#EF9F27" strokeWidth="1"/>
      <ellipse cx="36" cy="22" rx="9" ry="10" fill="#F5C4B3" stroke="#D85A30" strokeWidth="0.8"/>
      <rect x="27" y="31" width="18" height="16" rx="4" fill="#EF9F27"/>
      <line x1="27" y1="37" x2="20" y2="42" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="45" y1="37" x2="52" y2="34" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="47" x2="28" y2="58" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="42" y1="47" x2="44" y2="58" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <path d="M48 28 L58 28" fill="none" stroke="#A32D2D" strokeWidth="2" strokeLinecap="round"/>
      <path d="M53 23 L58 28 L53 33" fill="none" stroke="#A32D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  persistence: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="34" fill="#EAF3DE" stroke="#639922" strokeWidth="1"/>
      <ellipse cx="36" cy="22" rx="9" ry="10" fill="#F5C4B3" stroke="#D85A30" strokeWidth="0.8"/>
      <rect x="27" y="31" width="18" height="16" rx="4" fill="#639922"/>
      <line x1="27" y1="37" x2="20" y2="42" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="45" y1="37" x2="52" y2="42" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="47" x2="28" y2="58" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <line x1="42" y1="47" x2="44" y2="58" stroke="#F5C4B3" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 16 L36 8 L40 16" fill="#EF9F27" stroke="#BA7517" strokeWidth="0.8"/>
      <path d="M30 12 L36 4 L42 12" fill="none" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// Aliases
icons.relaxation = icons.regulation;
icons['self-esteem'] = icons.autonomy;

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 48 
}) => {
  const Icon = icons[category] || icons.relaxation; // Fallback to relaxation icon
  return <Icon size={size} />;
};
