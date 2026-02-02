// src/screens/WelcomeScreen.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';

function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'it';

  const handleStart = () => {
    navigate('/profile');
  };

  return (
    <SwitchLayout 
      title={`🥬 ${t('welcome.title')}`}
      subtitle={t('welcome.subtitle')}
    >
      <h3 style={{ 
        marginBottom: '20px',
        color: SWITCH_COLORS.darkBlue,
        fontSize: '1.1rem'
      }}>
        {t('welcome.howItWorks')}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          { icon: '📱', text: t('welcome.step1') },
          { icon: '📸', text: t('welcome.step2') },
          { icon: '🧠', text: language === 'it' ? 'Rispondi al quiz sulla conoscenza' : 'Answer the knowledge quiz' },
          { icon: '📊', text: t('welcome.step4') }
        ].map((step, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '12px',
            background: SWITCH_COLORS.lightBg,
            borderRadius: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: SWITCH_COLORS.gold,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              flexShrink: 0
            }}>
              {step.icon}
            </div>
            <span style={{ color: SWITCH_COLORS.darkBlue, flex: 1 }}>{step.text}</span>
          </div>
        ))}
      </div>

      <p style={{ 
        fontSize: '0.8rem', 
        color: '#888', 
        marginTop: '24px',
        marginBottom: '24px',
        lineHeight: '1.5',
        textAlign: 'center'
      }}>
        {t('welcome.privacy')}
      </p>

      <button 
        onClick={handleStart}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: 'white',
          background: SWITCH_COLORS.green,
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: `0 4px 12px ${SWITCH_COLORS.green}50`
        }}
      >
        {t('welcome.start')} →
      </button>
    </SwitchLayout>
  );
}

export default WelcomeScreen;
