// src/screens/RecognizeScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';
import GlobalProgress from '../components/GlobalProgress';

// Product name translations
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

const categoryNames = {
  'frutta': { it: 'frutta', en: 'fruit' },
  'verdura': { it: 'verdura', en: 'vegetable' },
  'ortaggio': { it: 'ortaggio', en: 'vegetable' },
};

function RecognizeScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'it';
  
  const translateProductName = (name) => {
    if (!name) return '';
    const key = name.toLowerCase().trim();
    const translation = productNames[key];
    if (translation) {
      return i18n.language === 'en' ? translation.en : translation.it;
    }
    return name;
  };
  
  const translateCategory = (category) => {
    if (!category) return '';
    const key = category.toLowerCase().trim();
    const translation = categoryNames[key];
    if (translation) {
      return i18n.language === 'en' ? translation.en : translation.it;
    }
    return category;
  };
  
  const translateConfidence = (confidence) => {
    if (!confidence) return '';
    const key = confidence.toLowerCase().trim();
    if (key === 'alta' || key === 'high') return t('recognize.confidence.high');
    if (key === 'media' || key === 'medium') return t('recognize.confidence.medium');
    if (key === 'bassa' || key === 'low') return t('recognize.confidence.low');
    return confidence;
  };
  
  const fileInputRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recognized, setRecognized] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Comprimi immagine per anteprima (fix Safari con immagini grandi)
  const compressForPreview = (file, maxWidth = 600) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => {
          // Fallback: usa l'originale se la compressione fallisce
          resolve(e.target.result);
        };
      };
    });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setError(null);
      setRecognized(null);
      
      // Comprimi per anteprima (fix Safari)
      try {
        const compressed = await compressForPreview(file);
        setImagePreview(compressed);
      } catch (err) {
        // Fallback: usa FileReader standard
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const compressImage = (file, maxWidth = 800) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
    });
  };

  const handleRecognize = async () => {
    if (!image) {
      setError(t('recognize.noImage'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64Image = await compressImage(image, 800);
        
      const response = await fetch('/api/recognize-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Recognition failed');
      }

      const data = await response.json();
      setRecognized(data);
      
      sessionStorage.setItem('recognizedProduct', JSON.stringify(data));
      sessionStorage.setItem('productImage', base64Image);
      
      setLoading(false);
    } catch (err) {
      console.error('Error recognizing product:', err);
      setError(t('recognize.error') + ': ' + err.message);
      setLoading(false);
    }
  };

  // Nuovo flusso: dopo riconoscimento → quiz
  const handleContinueToQuiz = () => {
    navigate('/quiz');
  };

  return (
    <SwitchLayout 
      title={`📸 ${t('recognize.title')}`}
      subtitle={language === 'it' ? 'Fotografa il tuo prodotto' : 'Take a photo of your product'}
      compact={true}
    >
      <GlobalProgress currentStep="recognize" language={language} />

      <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
        {t('recognize.instructions')}
      </p>

      {/* Camera/Upload Area */}
      <div 
        onClick={handleCameraClick}
        style={{
          border: `3px dashed ${SWITCH_COLORS.gold}`,
          borderRadius: '16px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: imagePreview ? '10px' : '20px',
          backgroundColor: imagePreview ? 'transparent' : SWITCH_COLORS.lightBg,
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
            <p style={{ color: SWITCH_COLORS.darkBlue, margin: 0, fontWeight: '500' }}>
              {t('recognize.tapToPhoto')}
            </p>
          </>
        )}
      </div>

      {/* Change Photo Button */}
      {imagePreview && !recognized && (
        <button
          onClick={handleCameraClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            background: '#fff',
            border: `2px solid ${SWITCH_COLORS.gold}`,
            borderRadius: '8px',
            color: SWITCH_COLORS.darkBlue,
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          🔄 {t('recognize.changePhoto')}
        </button>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
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
          onClick={handleRecognize}
          disabled={!image || loading}
          style={{ 
            width: '100%',
            padding: '16px',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            background: (!image || loading) ? '#ccc' : SWITCH_COLORS.green,
            border: 'none',
            borderRadius: '12px',
            cursor: (!image || loading) ? 'not-allowed' : 'pointer',
            boxShadow: (!image || loading) ? 'none' : `0 4px 12px ${SWITCH_COLORS.green}50`
          }}
        >
          {loading ? t('recognize.analyzing') : t('recognize.recognize')}
        </button>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto',
            border: '4px solid #e0e0e0',
            borderTopColor: SWITCH_COLORS.gold,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#666', marginTop: '10px' }}>
            {t('recognize.processing')}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Recognition Result */}
      {recognized && (
        <div style={{ marginTop: '20px' }}>
          <div style={{
            background: `linear-gradient(135deg, ${SWITCH_COLORS.gold}20 0%, ${SWITCH_COLORS.gold}10 100%)`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center',
            border: `2px solid ${SWITCH_COLORS.gold}`
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
              {recognized.emoji || '🥬'}
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: SWITCH_COLORS.darkBlue }}>
              {translateProductName(recognized.name) || t('recognize.recognized')}
            </h3>
            {recognized.confidence && (
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                {t('recognize.confidence')}: {translateConfidence(recognized.confidence)}
              </p>
            )}
            {recognized.category && (
              <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: '0.85rem' }}>
                {t('recognize.category')}: {translateCategory(recognized.category)}
              </p>
            )}
          </div>

          {/* Retry button if wrong recognition */}
          <button
            onClick={() => {
              setRecognized(null);
              setImage(null);
              setImagePreview(null);
              sessionStorage.removeItem('recognizedProduct');
              sessionStorage.removeItem('productImage');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              marginBottom: '16px',
              background: '#fff',
              border: `2px solid ${SWITCH_COLORS.gold}`,
              borderRadius: '8px',
              color: SWITCH_COLORS.darkBlue,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🔄 {t('recognize.wrongProduct')}
          </button>

          {/* Nuovo: pulsante singolo per andare al quiz */}
          <button 
            onClick={handleContinueToQuiz}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
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
            🧠 {language === 'it' ? 'Continua con il Quiz' : 'Continue to Quiz'} →
          </button>
        </div>
      )}
    </SwitchLayout>
  );
}

export default RecognizeScreen;
