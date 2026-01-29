// src/screens/SpectrometerScreen.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SpectrometerScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const recognizedProduct = JSON.parse(sessionStorage.getItem('recognizedProduct') || '{}');

  const handleOpenScioApp = () => {
    // Try to open SCIO app via deep link (if available)
    // This is a placeholder - actual implementation depends on SCIO app capabilities
    window.location.href = 'scio://scan';
    
    // Fallback: after a delay, show instructions
    setTimeout(() => {
      alert(t('spectrometer.appNotFound', 'App SCIO non trovata. Apri manualmente l\'app SCIO per eseguire la scansione.'));
    }, 2000);
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
              Fai uno <strong>screenshot</strong> dei risultati e torna qui per caricarlo
            </li>
          </ol>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleOpenScioApp}
          >
            🚀 {t('spectrometer.openApp', 'Apri app SCIO')}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={handleUploadInstead}
            style={{ 
              background: '#fff',
              border: '2px solid #4CAF50',
              color: '#4CAF50'
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
      </div>
    </div>
  );
}

export default SpectrometerScreen;
