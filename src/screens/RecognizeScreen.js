// src/screens/RecognizeScreen.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function RecognizeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recognized, setRecognized] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setError(null);
      setRecognized(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleRecognize = async () => {
    if (!image) {
      setError(t('recognize.noImage', 'Scatta o carica una foto del prodotto'));
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        
        const response = await fetch('/api/recognize-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Recognition failed');
        }

        const data = await response.json();
        setRecognized(data);
        
        // Store recognized product
        sessionStorage.setItem('recognizedProduct', JSON.stringify(data));
        sessionStorage.setItem('productImage', base64Image);
        
        setLoading(false);
      } catch (err) {
        console.error('Error recognizing product:', err);
        setError(t('recognize.error', 'Errore nel riconoscimento') + ': ' + err.message);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError(t('recognize.error', 'Errore nel riconoscimento') + ': Could not read image');
      setLoading(false);
    };
  };

  const handleScanChoice = (method) => {
    sessionStorage.setItem('scanMethod', method);
    if (method === 'screenshot') {
      navigate('/scan');
    } else {
      // For spectrometer, we could integrate with SCIO app or show instructions
      navigate('/scan-spectrometer');
    }
  };

  return (
    <div className="screen">
      <div className="card">
        <h2>📸 {t('recognize.title', 'Riconosci Prodotto')}</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          {t('recognize.instructions', 'Fotografa il frutto o la verdura da analizzare')}
        </p>

        {/* Camera/Upload Area */}
        <div 
          onClick={handleCameraClick}
          style={{
            border: '3px dashed #4CAF50',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '20px',
            backgroundColor: imagePreview ? 'transparent' : '#f5f5f5',
            transition: 'all 0.3s ease'
          }}
        >
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Product" 
              style={{
                maxWidth: '100%',
                maxHeight: '250px',
                borderRadius: '8px'
              }}
            />
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📷</div>
              <p style={{ color: '#666', margin: 0 }}>
                {t('recognize.tapToPhoto', 'Tocca per fotografare o caricare')}
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
        />

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {!recognized && (
          <button 
            className="btn btn-primary" 
            onClick={handleRecognize}
            disabled={!image || loading}
            style={{ opacity: (!image || loading) ? 0.6 : 1 }}
          >
            {loading ? t('recognize.analyzing', 'Riconoscimento in corso...') : t('recognize.recognize', 'Riconosci prodotto')}
          </button>
        )}

        {loading && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div className="spinner"></div>
            <p style={{ color: '#666', marginTop: '10px' }}>
              {t('recognize.processing', 'Analisi AI in corso...')}
            </p>
          </div>
        )}

        {/* Recognition Result */}
        {recognized && (
          <div style={{ marginTop: '20px' }}>
            <div style={{
              background: '#e8f5e9',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                {recognized.emoji || '🥬'}
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>
                {recognized.name || 'Prodotto riconosciuto'}
              </h3>
              {recognized.confidence && (
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  Affidabilità: {recognized.confidence}
                </p>
              )}
              {recognized.category && (
                <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: '0.85rem' }}>
                  Categoria: {recognized.category}
                </p>
              )}
            </div>

            <p style={{ textAlign: 'center', color: '#666', marginBottom: '16px' }}>
              {t('recognize.chooseMethod', 'Come vuoi analizzare i valori nutrizionali?')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => handleScanChoice('screenshot')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                📱 {t('recognize.uploadScreenshot', 'Carica screenshot SCIO')}
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={() => handleScanChoice('spectrometer')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  background: '#fff',
                  border: '2px solid #4CAF50',
                  color: '#4CAF50'
                }}
              >
                🔬 {t('recognize.startScan', 'Avvia scansione spettrometro')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecognizeScreen;
