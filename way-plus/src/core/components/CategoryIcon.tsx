import React from 'react';
import { useAccessibilityConfig } from '@/core/stores/configStore';

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

// --- STANDARD ICONS ---

const RegulationIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="34" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="1"/>
    <ellipse cx="36" cy="28" rx="10" ry="11" fill="#F5C4B3" stroke="#D85A30" strokeWidth="0.8"/>
    <path d="M28 38 Q36 45 44 38" fill="#F5C4B3" stroke="#D85A30" strokeWidth="0.8"/>
    <path d="M26 50 Q36 56 46 50" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 32 Q32 30 34 32" fill="none" stroke="#3C3489" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M38 32 Q40 30 42 32" fill="none" stroke="#3C3489" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M22 20 Q36 10 50 20" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,2"/>
  </svg>
);

const AutonomyIcon: React.FC<{ size: number }> = ({ size }) => (
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
);

// --- SIMPLIFIED ICONS (ASD FRIENDLY) ---

const SimpleRegulation: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="32" fill="#1D9E75" />
    <circle cx="36" cy="36" r="24" fill="white" />
    <path d="M24 36 Q36 48 48 36" stroke="#1D9E75" strokeWidth="6" strokeLinecap="round" />
    <circle cx="28" cy="28" r="4" fill="#1D9E75" />
    <circle cx="44" cy="28" r="4" fill="#1D9E75" />
  </svg>
);

const SimpleAutonomy: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="12" width="48" height="48" rx="12" fill="#7F77DD" />
    <path d="M24 36 L32 44 L48 28" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SimpleSocial: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="36" r="20" fill="#378ADD" />
    <circle cx="48" cy="36" r="20" fill="#534AB7" opacity="0.8" />
    <path d="M30 36 A6 6 0 0 1 42 36" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const SimpleAssertiveness: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="32" fill="#EF9F27" />
    <path d="M24 36 L48 36 M40 28 L48 36 L40 44" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SimplePersistence: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="32" fill="#639922" />
    <path d="M36 48 V24 M28 32 L36 24 L44 32" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const standardIcons: Record<string, React.FC<{ size: number }>> = {
  regulation: RegulationIcon,
  autonomy: AutonomyIcon,
  social: (props) => (
    <svg width={props.size} height={props.size} viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="34" fill="#E6F1FB" stroke="#378ADD" strokeWidth="1"/>
      <circle cx="24" cy="24" r="8" fill="#F5C4B3" />
      <circle cx="48" cy="24" r="8" fill="#AFA9EC" />
      <rect x="16" y="36" width="40" height="20" rx="10" fill="#378ADD" />
    </svg>
  ),
  assertiveness: (props) => (
    <svg width={props.size} height={props.size} viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="34" fill="#FAEEDA" stroke="#EF9F27" strokeWidth="1"/>
      <rect x="26" y="26" width="20" height="20" rx="4" fill="#EF9F27" />
      <path d="M48 36 L58 36" stroke="#EF9F27" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  persistence: (props) => (
    <svg width={props.size} height={props.size} viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="34" fill="#EAF3DE" stroke="#639922" strokeWidth="1"/>
      <path d="M36 50 V20 M26 30 L36 20 L46 30" stroke="#639922" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
};

const simpleIcons: Record<string, React.FC<{ size: number }>> = {
  regulation: SimpleRegulation,
  autonomy: SimpleAutonomy,
  social: SimpleSocial,
  assertiveness: SimpleAssertiveness,
  persistence: SimplePersistence,
  relaxation: SimpleRegulation,
  'self-esteem': SimpleAutonomy,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 48 
}) => {
  const { highAccessibility: isHighAccessibility } = useAccessibilityConfig();
  
  const iconSet = isHighAccessibility ? simpleIcons : standardIcons;
  const Icon = iconSet[category] || iconSet.regulation;
  
  return <Icon size={size} />;
};

