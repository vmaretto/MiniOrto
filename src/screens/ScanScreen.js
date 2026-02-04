// src/screens/ScanScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';

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

function ScanScreen() {
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
  
  const fileInputRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recognizedProduct, setRecognizedProduct] = useState(null);
  
  // Demo products gallery state
  const [demoProducts, setDemoProducts] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const storedProduct = sessionStorage.getItem('recognizedProduct');
    if (storedProduct) {
      setRecognizedProduct(JSON.parse(storedProduct));
    }
    fetchDemoProducts();
  }, []);
  
  const fetchDemoProducts = async () => {
    try {
      const response = await fetch('/api/demo-products');
      if (response.ok) {
        const data = await response.json();
        setDemoProducts(data);
      }
    } catch (err) {
      console.error('Error fetching demo products:', err);
    }
  };
  
  // Handle demo product SCIO data selection
  const handleUseDemoScioData = (product) => {
    const scioData = {
      brix: parseFloat(product.scio_brix) || 0,
      calories: parseFloat(product.scio_calories) || 0,
      carbs: parseFloat(product.scio_carbs) || 0,
      sugar: parseFloat(product.scio_sugar) || 0,
      water: parseFloat(product.scio_water) || 0,
      protein: parseFloat(product.scio_protein) || 0,
      fiber: parseFloat(product.scio_fiber) || 0,
      isDemoData: true,
      demoProductId: product.id,
      demoProductName: product.name
    };
    
    sessionStorage.setItem('scioScanData', JSON.stringify(scioData));
    sessionStorage.setItem('scanMethod', 'demo');
    
    // Update recognized product with SCIO data
    const currentProduct = JSON.parse(sessionStorage.getItem('recognizedProduct') || '{}');
    currentProduct.scioData = scioData;
    sessionStorage.setItem('recognizedProduct', JSON.stringify(currentProduct));
    
    navigate('/results');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setError(null);
      
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

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        
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
    <SwitchLayout 
      title={t('scan.title')}
      subtitle={language === 'it' ? 'Carica lo screenshot SCIO' : 'Upload SCIO screenshot'}
      compact={true}
    >
      {/* Show recognized product if available */}
      {recognizedProduct && (
        <div style={{
          background: `linear-gradient(135deg, ${SWITCH_COLORS.gold}20 0%, ${SWITCH_COLORS.gold}10 100%)`,
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `2px solid ${SWITCH_COLORS.gold}`
        }}>
          <span style={{ fontSize: '2rem' }}>{recognizedProduct.emoji || '🥬'}</span>
          <div>
            <div style={{ fontWeight: 'bold', color: SWITCH_COLORS.darkBlue }}>
              {translateProductName(recognizedProduct.name)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {t('scan.uploadScioFor')}
            </div>
          </div>
        </div>
      )}

      <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
        {t('scan.instructions')}
      </p>

      {/* Upload Area */}
      <div 
        onClick={handleUploadClick}
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
            <p style={{ color: SWITCH_COLORS.darkBlue, margin: 0, fontWeight: '500' }}>
              {t('scan.tapToUpload')}
            </p>
          </>
        )}
      </div>

      {/* Change Photo Button */}
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
            border: `2px solid ${SWITCH_COLORS.gold}`,
            borderRadius: '8px',
            color: SWITCH_COLORS.darkBlue,
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
        background: `${SWITCH_COLORS.gold}15`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        fontSize: '0.85rem',
        border: `1px solid ${SWITCH_COLORS.gold}50`
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
        onClick={handleAnalyze}
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
        {loading ? t('scan.analyzing') : t('scan.analyze')}
      </button>

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
          <p style={{ color: '#666', marginTop: '10px' }}>{t('scan.processing')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Demo products SCIO gallery */}
      {!loading && demoProducts.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '16px',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            <span style={{ 
              background: SWITCH_COLORS.lightBg, 
              padding: '4px 12px', 
              borderRadius: '20px' 
            }}>
              {language === 'it' ? '— oppure usa dati SCIO già registrati —' : '— or use pre-registered SCIO data —'}
            </span>
          </div>
          
          {/* Horizontal scrollable gallery */}
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '12px',
            padding: '8px 4px',
            marginBottom: '10px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin'
          }}>
            {demoProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleUseDemoScioData(product)}
                style={{
                  flex: '0 0 auto',
                  width: '100px',
                  padding: '12px 8px',
                  background: 'white',
                  border: `2px solid ${SWITCH_COLORS.gold}`,
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{ 
                  fontSize: '2rem', 
                  marginBottom: '6px',
                  lineHeight: 1
                }}>
                  {product.emoji || '🥬'}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600',
                  color: SWITCH_COLORS.darkBlue,
                  lineHeight: 1.2
                }}>
                  {translateProductName(product.name)}
                </div>
                <div style={{
                  fontSize: '0.6rem',
                  color: SWITCH_COLORS.green,
                  fontWeight: '600',
                  background: SWITCH_COLORS.green + '15',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  display: 'inline-block',
                  marginTop: '4px'
                }}>
                  Brix: {product.scio_brix}°
                </div>
              </div>
            ))}
          </div>
          
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#999', 
            textAlign: 'center',
            margin: 0 
          }}>
            {language === 'it' 
              ? '👆 Seleziona un prodotto per usare i suoi dati SCIO' 
              : '👆 Select a product to use its SCIO data'}
          </p>
        </div>
      )}
    </SwitchLayout>
  );
}

export default ScanScreen;
