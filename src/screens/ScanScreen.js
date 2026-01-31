// src/screens/ScanScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Product name translations (same as RecognizeScreen)
const productNames = {
  'pomodoro': { it: 'Pomodoro', en: 'Tomato' },
  'pomodoro ciliegino': { it: 'Pomodoro ciliegino', en: 'Cherry tomato' },
  'mela': { it: 'Mela', en: 'Apple' },
  'mela golden': { it: 'Mela Golden', en: 'Golden Apple' },
  'arancia': { it: 'Arancia', en: 'Orange' },
  'limone': { it: 'Limone', en: 'Lemon' },
  'banana': { it: 'Banana', en: 'Banana' },
  'fragola': { it: 'Fragola', en: 'Strawberry' },
  'uva': { it: 'Uva', en: 'Grape' },
  'pera': { it: 'Pera', en: 'Pear' },
  'pesca': { it: 'Pesca', en: 'Peach' },
  'anguria': { it: 'Anguria', en: 'Watermelon' },
  'melone': { it: 'Melone', en: 'Melon' },
  'kiwi': { it: 'Kiwi', en: 'Kiwi' },
  'avocado': { it: 'Avocado', en: 'Avocado' },
  'carota': { it: 'Carota', en: 'Carrot' },
  'zucchina': { it: 'Zucchina', en: 'Zucchini' },
  'peperone': { it: 'Peperone', en: 'Bell pepper' },
  'cetriolo': { it: 'Cetriolo', en: 'Cucumber' },
  'lattuga': { it: 'Lattuga', en: 'Lettuce' },
  'spinaci': { it: 'Spinaci', en: 'Spinach' },
  'broccoli': { it: 'Broccoli', en: 'Broccoli' },
  'cavolfiore': { it: 'Cavolfiore', en: 'Cauliflower' },
  'patata': { it: 'Patata', en: 'Potato' },
  'cipolla': { it: 'Cipolla', en: 'Onion' },
  'aglio': { it: 'Aglio', en: 'Garlic' },
};

function ScanScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Helper to translate product name
  const translateProductName = (name) => {
    if (!name) return '';
    const key = name.toLowerCase().trim();
    const translation = productNames[key];
    if (translation) {
      return i18n.language === 'en' ? translation.en : translation.it;
    }
    return name;
  };
  const fileInputRef = useRef(null);
  const uploadAreaRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recognizedProduct, setRecognizedProduct] = useState(null);

  // Scroll to top and load recognized product on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const storedProduct = sessionStorage.getItem('recognizedProduct');
    if (storedProduct) {
      setRecognizedProduct(JSON.parse(storedProduct));
    }
  }, []);

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
        
        {/* Show recognized product if available */}
        {recognizedProduct && (
          <div style={{
            background: '#e8f5e9',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '2rem' }}>{recognizedProduct.emoji || '🥬'}</span>
            <div>
              <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {translateProductName(recognizedProduct.name)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                {t('scan.uploadScioFor')}
              </div>
            </div>
          </div>
        )}

        <p style={{ color: '#666', marginBottom: '20px' }}>
          {t('scan.instructions')}
        </p>

        {/* Upload Area */}
        <div 
          ref={uploadAreaRef}
          onClick={handleUploadClick}
          style={{
            border: '3px dashed #4CAF50',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: imagePreview ? '10px' : '20px',
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

        {/* Change Photo Button - visible when image is loaded */}
        {imagePreview && (
          <button
            onClick={handleUploadClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              background: '#fff',
              border: '2px solid #ff9800',
              borderRadius: '8px',
              color: '#ff9800',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            🔄 {t('scan.changePhoto')}
          </button>
        )}

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
