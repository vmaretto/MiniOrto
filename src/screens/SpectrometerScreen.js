// src/screens/SpectrometerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SpectrometerScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [waitingForScan, setWaitingForScan] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const sessionStartRef = useRef(null);
  const foundDataRef = useRef(false); // Prevent race condition
  
  const recognizedProduct = JSON.parse(sessionStorage.getItem('recognizedProduct') || '{}');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const handleOpenScioApp = () => {
    // Try to open SCIO app via deep link (if available)
    window.location.href = 'scio://scan';
    
    // Fallback: after a delay, show instructions
    setTimeout(() => {
      alert(t('spectrometer.appNotFound', 'App SCIO non trovata. Apri manualmente l\'app SCIO per eseguire la scansione.'));
    }, 2000);
  };

  const handleWaitForScan = () => {
    setWaitingForScan(true);
    setCountdown(120);
    sessionStartRef.current = Date.now();
    foundDataRef.current = false; // Reset flag
    
    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleCancelWait();
          alert('Timeout: nessuno scan ricevuto. Riprova.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start polling for scan data
    pollIntervalRef.current = setInterval(async () => {
      // Skip if we already found data (prevent race condition)
      if (foundDataRef.current) return;
      
      try {
        const response = await fetch(`/api/get-latest-scan?session=${sessionStartRef.current}`);
        const data = await response.json();
        
        if (data.found && data.scan) {
          // Mark as found immediately to prevent duplicate processing
          foundDataRef.current = true;
          
          // Scan received! Stop timers first
          handleCancelWait();
          
          // Save scan data to session storage
          sessionStorage.setItem('scioScanData', JSON.stringify(data.scan));
          sessionStorage.setItem('scanMethod', 'direct');
          
          // Navigate to results
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
    <div className="screen">
      <div className="card">
        <h2>🔬 {t('spectrometer.title', 'Scansione Spettrometro')}</h2>
        
        {recognizedProduct.name && (
          <div style={{
            background: '#e3f2fd',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '2rem' }}>{recognizedProduct.emoji || '🥬'}</span>
            <div>
              <strong>{recognizedProduct.name}</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                Prodotto da analizzare
              </p>
            </div>
          </div>
        )}

        {!waitingForScan ? (
          <>
            <div style={{
              background: '#fff3e0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#e65100' }}>
                📋 {t('spectrometer.instructions', 'Istruzioni')}
              </h3>
              
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                <li style={{ marginBottom: '12px' }}>
                  Assicurati che lo spettrometro <strong>SCIO</strong> sia acceso e connesso via Bluetooth
                </li>
                <li style={{ marginBottom: '12px' }}>
                  Apri l'app <strong>SCIO</strong> sul tuo dispositivo
                </li>
                <li style={{ marginBottom: '12px' }}>
                  Posiziona lo spettrometro sulla superficie del prodotto
                </li>
                <li style={{ marginBottom: '12px' }}>
                  Esegui la scansione nell'app SCIO
                </li>
                <li>
                  I dati arriveranno <strong>automaticamente</strong>, oppure fai uno screenshot
                </li>
              </ol>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-primary"
                onClick={handleWaitForScan}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                📡 Attendi scan diretto dall'app SCIO
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={handleUploadInstead}
                style={{ 
                  background: '#fff',
                  border: '2px solid #4CAF50',
                  color: '#4CAF50',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📱 {t('spectrometer.uploadScreenshot', 'Ho già lo screenshot, caricalo')}
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
                ← {t('spectrometer.back', 'Torna indietro')}
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
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            
            <h3 style={{ margin: '0 0 10px', color: '#333' }}>
              In attesa dello scan...
            </h3>
            
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Apri l'app SCIO sul tuo iPhone e fai la scansione.<br/>
              I dati arriveranno automaticamente.
            </p>
            
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: countdown < 30 ? '#f44336' : '#667eea',
              margin: '20px 0'
            }}>
              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </p>
            
            <button 
              onClick={handleCancelWait}
              style={{
                background: 'transparent',
                border: '1px solid #999',
                color: '#666',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Annulla
            </button>
            
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpectrometerScreen;
