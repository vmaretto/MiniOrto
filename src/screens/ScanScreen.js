// src/screens/ScanScreen.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ScanScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError(t('scan.noImage'));
      return;
    }

    setLoading(true);
    setError(null);

    // Convert image to base64
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        
        // Call Vision API to extract values
        const response = await fetch('/api/analyze-scio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Analysis failed');
        }

        const data = await response.json();
        
        // Store results and navigate
        sessionStorage.setItem('scioResults', JSON.stringify(data));
        sessionStorage.setItem('scioImage', base64Image);
        navigate('/results');
      } catch (err) {
        console.error('Error analyzing image:', err);
        setError(t('scan.error') + ': ' + err.message);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError(t('scan.error') + ': Could not read image');
      setLoading(false);
    };
  };

  return (
    <div className="screen">
      <div className="card">
        <h2>{t('scan.title')}</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          {t('scan.instructions')}
        </p>

        {/* Upload Area */}
        <div 
          onClick={handleUploadClick}
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
              alt="SCIO screenshot" 
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px'
              }}
            />
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📷</div>
              <p style={{ color: '#666', margin: 0 }}>{t('scan.tapToUpload')}</p>
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Example image hint */}
        <div style={{
          background: '#fff3e0',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '0.85rem'
        }}>
          <strong>💡 {t('scan.hint')}</strong>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            {t('scan.hintText')}
          </p>
        </div>

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

        <button 
          className="btn btn-primary" 
          onClick={handleAnalyze}
          disabled={!image || loading}
          style={{ opacity: (!image || loading) ? 0.6 : 1 }}
        >
          {loading ? t('scan.analyzing') : t('scan.analyze')}
        </button>

        {loading && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div className="spinner"></div>
            <p style={{ color: '#666', marginTop: '10px' }}>{t('scan.processing')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanScreen;
