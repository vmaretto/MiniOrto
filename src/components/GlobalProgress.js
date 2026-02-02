// src/components/GlobalProgress.js - Progress bar globale a 6 step
import React from 'react';
import { SWITCH_COLORS } from './SwitchLayout';

const STEPS = [
  { id: 'profile', label: { it: 'Profilo', en: 'Profile' }, icon: '👤' },
  { id: 'recognize', label: { it: 'Foto', en: 'Photo' }, icon: '📸' },
  { id: 'quiz', label: { it: 'Quiz', en: 'Quiz' }, icon: '🧠' },
  { id: 'scan', label: { it: 'Scan', en: 'Scan' }, icon: '🔬' },
  { id: 'results', label: { it: 'Confronto', en: 'Compare' }, icon: '📊' },
  { id: 'feedback', label: { it: 'Feedback', en: 'Feedback' }, icon: '⭐' }
];

export default function GlobalProgress({ currentStep, language = 'it' }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);
  
  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Progress bar */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '12px'
      }}>
        {STEPS.map((step, index) => (
          <div 
            key={step.id}
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '3px',
              background: index <= currentIndex 
                ? `linear-gradient(90deg, ${SWITCH_COLORS.gold} 0%, ${SWITCH_COLORS.green} 100%)`
                : '#e0e0e0',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
      
      {/* Step indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.7rem',
        color: '#666'
      }}>
        {STEPS.map((step, index) => (
          <div 
            key={step.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: index <= currentIndex ? 1 : 0.5,
              color: index === currentIndex ? SWITCH_COLORS.gold : '#666',
              fontWeight: index === currentIndex ? '600' : '400'
            }}
          >
            <span style={{ fontSize: '1rem' }}>{step.icon}</span>
            <span style={{ 
              display: index === currentIndex ? 'block' : 'none',
              marginTop: '2px'
            }}>
              {step.label[language]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { STEPS };
