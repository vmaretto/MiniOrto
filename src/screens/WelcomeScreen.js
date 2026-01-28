// src/screens/WelcomeScreen.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
    <div className="screen welcome-screen">
      <div className="card">
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button 
            onClick={toggleLanguage}
            style={{
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {i18n.language === 'it' ? '🇬🇧 EN' : '🇮🇹 IT'}
          </button>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🥬 MINI-ORTO</h1>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'normal', color: '#666', marginBottom: '30px' }}>
          {t('welcome.subtitle')}
        </h2>

        <div style={{
          background: '#e8f5e9',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '15px' }}>{t('welcome.howItWorks')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>📱</span>
              <span>{t('welcome.step1')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>📸</span>
              <span>{t('welcome.step2')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🔍</span>
              <span>{t('welcome.step3')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>📊</span>
              <span>{t('welcome.step4')}</span>
            </div>
          </div>
        </div>

        <p style={{ 
          fontSize: '0.85rem', 
          color: '#666', 
          marginBottom: '20px',
          lineHeight: '1.5'
        }}>
          {t('welcome.privacy')}
        </p>

        <button className="btn btn-primary" onClick={handleStart}>
          {t('welcome.start')}
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
