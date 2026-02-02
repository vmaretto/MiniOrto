// src/screens/SpectrometerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';

function SpectrometerScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'it';
  
  const [waitingForScan, setWaitingForScan] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const sessionStartRef = useRef(null);
  const foundDataRef = useRef(false);
  
  const recognizedProduct = JSON.parse(sessionStorage.getItem('recognizedProduct') || '{}');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const handleWaitForScan = () => {
    setWaitingForScan(true);
    setCountdown(120);
    sessionStartRef.current = Date.now();
    foundDataRef.current = false;
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleCancelWait();
          alert(language === 'it' ? 'Timeout: nessuno scan ricevuto. Riprova.' : 'Timeout: no scan received. Please try again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    pollIntervalRef.current = setInterval(async () => {
      if (foundDataRef.current) return;
      
      try {
        const response = await fetch(`/api/get-latest-scan?session=${sessionStartRef.current}`);
        const data = await response.json();
        
        if (data.found && data.scan) {
          foundDataRef.current = true;
          handleCancelWait();
          
          sessionStorage.setItem('scioScanData', JSON.stringify(data.scan));
          sessionStorage.setItem('scanMethod', 'direct');
          
          navigate('/results');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);
  };

  const handleCancelWait = () => {
    setWaitingForScan(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const handleUploadInstead = () => {
    navigate('/scan');
  };

  const handleBackToRecognize = () => {
    navigate('/recognize');
  };

  return (
    <SwitchLayout 
      title={`🔬 ${t('spectrometer.title')}`}
      subtitle={language === 'it' ? 'Analisi spettrometrica' : 'Spectrometric analysis'}
      compact={true}
    >
      {recognizedProduct.name && (
        <div style={{
          background: `linear-gradient(135deg, ${SWITCH_COLORS.gold}20 0%, ${SWITCH_COLORS.gold}10 100%)`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `2px solid ${SWITCH_COLORS.gold}`
        }}>
          <span style={{ fontSize: '2.5rem' }}>{recognizedProduct.emoji || '🥬'}</span>
          <div>
            <strong style={{ color: SWITCH_COLORS.darkBlue, fontSize: '1.1rem' }}>
              {recognizedProduct.name}
            </strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
              {t('spectrometer.productToAnalyze')}
            </p>
          </div>
        </div>
      )}

      {!waitingForScan ? (
        <>
          <div style={{
            background: SWITCH_COLORS.lightBg,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>
              {t('spectrometer.instructions')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleWaitForScan}
              style={{
                background: `linear-gradient(135deg, ${SWITCH_COLORS.darkBlue} 0%, #2d4a6f 100%)`,
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)'
              }}
            >
              📡 {t('spectrometer.waitForScan')}
            </button>
            
            <button 
              onClick={handleUploadInstead}
              style={{ 
                background: '#fff',
                border: `2px solid ${SWITCH_COLORS.green}`,
                color: SWITCH_COLORS.green,
                padding: '16px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              📱 {t('spectrometer.uploadScreenshot')}
            </button>
            
            <button 
              onClick={handleBackToRecognize}
              style={{ 
                background: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '12px',
                fontSize: '0.9rem'
              }}
            >
              ← {t('spectrometer.goBack')}
            </button>
          </div>
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            border: '4px solid #e0e0e0',
            borderTopColor: SWITCH_COLORS.gold,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          
          <h3 style={{ margin: '0 0 10px', color: SWITCH_COLORS.darkBlue }}>
            {t('spectrometer.waiting')}
          </h3>
          
          <p style={{ color: '#666', marginBottom: '10px' }}>
            {t('spectrometer.waitingDesc')}
          </p>
          
          <p style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: countdown < 30 ? '#f44336' : SWITCH_COLORS.darkBlue,
            margin: '20px 0'
          }}>
            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
          </p>
          
          <button 
            onClick={handleCancelWait}
            style={{
              background: 'transparent',
              border: `1px solid ${SWITCH_COLORS.darkBlue}`,
              color: SWITCH_COLORS.darkBlue,
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {t('spectrometer.cancel')}
          </button>
          
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </SwitchLayout>
  );
}

export default SpectrometerScreen;
