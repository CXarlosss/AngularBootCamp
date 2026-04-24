import React from 'react';
import { useSecretTracker } from '../hooks/useSecretTracker';
import { SecretRevealOverlay } from './SecretRevealOverlay';

export const SecretManager: React.FC = () => {
  // Mounting the tracker globally
  useSecretTracker();
  
  return <SecretRevealOverlay />;
};
