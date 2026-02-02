// src/screens/WelcomeScreen.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// SWITCH brand colors
const COLORS = {
  gold: '#FFC300',
  darkBlue: '#1E3A5F',
  green: '#28A745',
  lightBg: '#F8F9FA'
};

function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/profile');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(newLang);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${COLORS.gold} 0%, ${COLORS.gold} 30%, white 30%)`,
      padding: '0'
    }}>
      {/* Header with SWITCH branding */}
      <div style={{
        background: COLORS.gold,
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button 
            onClick={toggleLanguage}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {i18n.language === 'it' ? '🇬🇧 EN' : '🇮🇹 IT'}
          </button>
        </div>

        <div style={{
          fontSize: '0.8rem',
          color: COLORS.darkBlue,
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          SWITCH PROJECT
        </div>
        
        <h1 style={{ 
          fontSize: '2.2rem', 
          marginBottom: '8px',
          color: COLORS.darkBlue,
          fontWeight: 'bold'
        }}>
          🥬 {t('welcome.title')}
        </h1>
        <p style={{ 
          color: COLORS.darkBlue,
          opacity: 0.8,
          margin: 0,
          fontSize: '1rem'
        }}>
          {t('welcome.subtitle')}
        </p>
      </div>

      {/* Content Card */}
      <div style={{
        margin: '-20px 16px 20px',
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          marginBottom: '20px',
          color: COLORS.darkBlue,
          fontSize: '1.1rem'
        }}>
          {t('welcome.howItWorks')}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: '📱', text: t('welcome.step1') },
            { icon: '📸', text: t('welcome.step2') },
            { icon: '🧠', text: i18n.language === 'it' ? 'Rispondi al quiz sulla conoscenza' : 'Answer the knowledge quiz' },
            { icon: '📊', text: t('welcome.step4') }
          ].map((step, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              padding: '12px',
              background: COLORS.lightBg,
              borderRadius: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: COLORS.gold,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}>
                {step.icon}
              </div>
              <span style={{ color: COLORS.darkBlue, flex: 1 }}>{step.text}</span>
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
            background: COLORS.green,
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
          }}
        >
          {t('welcome.start')} →
        </button>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: '#888',
        fontSize: '0.75rem'
      }}>
        <img 
          src="https://switchdiet.eu/wp-content/uploads/2022/12/logo-white-1.svg" 
          alt="SWITCH"
          style={{ height: '30px', marginBottom: '8px', filter: 'brightness(0.3)' }}
          onError={(e) => e.target.style.display = 'none'}
        />
        <div>Horizon Europe Research Project</div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
