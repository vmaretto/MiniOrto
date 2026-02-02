// src/screens/ResultsScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import ProductCard from '../components/ProductCard';
import EnvironmentalCard from '../components/EnvironmentalCard';
import QuizScreen from './QuizScreen';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';

function ResultsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [image, setImage] = useState(null);
  const [recognizedProduct, setRecognizedProduct] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [switchData, setSwitchData] = useState(null);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);
  const [quizResults, setQuizResults] = useState(null);
  const language = i18n?.language || 'it';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('scioResults');
    const storedImage = sessionStorage.getItem('scioImage');
    const storedProduct = sessionStorage.getItem('recognizedProduct');
    const storedProductImage = sessionStorage.getItem('productImage');
    
    const directScanData = sessionStorage.getItem('scioScanData');
    const scanMethod = sessionStorage.getItem('scanMethod');
    
    if (directScanData && scanMethod === 'direct') {
      const scanData = JSON.parse(directScanData);
      setResults({
        value: scanData.value,
        units: scanData.units,
        confidence: scanData.confidence,
        modelName: scanData.modelName,
        modelType: scanData.modelType,
        aggregatedValue: scanData.aggregatedValue,
        source: 'direct-scio',
        scanDate: scanData.scanDate || new Date().toISOString(),
        ...scanData.nutrition
      });
    } else if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    
    if (storedImage) {
      setImage(storedImage);
    }
    if (storedProduct) {
      setRecognizedProduct(JSON.parse(storedProduct));
    }
    if (storedProductImage) {
      setProductImage(storedProductImage);
    }
  }, []);

  useEffect(() => {
    const fetchSwitchData = async () => {
      if (!recognizedProduct) return;
      
      const searchTerm = recognizedProduct.nameEn || recognizedProduct.name;
      if (!searchTerm) return;
      
      setSwitchLoading(true);
      try {
        const response = await fetch('/api/switch-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nameEn: searchTerm })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSwitchData(data);
        }
      } catch (error) {
        console.error('Error fetching SWITCH data:', error);
      } finally {
        setSwitchLoading(false);
      }
    };
    
    fetchSwitchData();
  }, [recognizedProduct]);

  const handleNewScan = () => {
    sessionStorage.clear();
    navigate('/recognize');
  };

  const handleStartOver = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleQuizComplete = (quizData) => {
    setQuizResults(quizData);
    setShowQuiz(false);
    if (quizData) {
      sessionStorage.setItem('quizResults', JSON.stringify(quizData));
    }
  };

  const NutrientRow = ({ label, value, unit }) => {
    if (value === null || value === undefined) return null;
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #eee'
      }}>
        <span style={{ color: '#666' }}>{label}</span>
        <span style={{ fontWeight: 'bold', color: SWITCH_COLORS.darkBlue }}>{value} {unit}</span>
      </div>
    );
  };

  if (!results) {
    return (
      <SwitchLayout 
        title={t('results.noData')}
        subtitle={language === 'it' ? 'Nessun dato disponibile' : 'No data available'}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
          <button 
            onClick={() => navigate('/recognize')}
            style={{
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'white',
              background: SWITCH_COLORS.green,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            {t('results.goToScan')}
          </button>
        </div>
      </SwitchLayout>
    );
  }

  // Show quiz before results
  if (showQuiz && recognizedProduct && switchData && !switchLoading) {
    return (
      <QuizScreen
        product={recognizedProduct}
        switchData={switchData}
        onComplete={handleQuizComplete}
        language={language}
      />
    );
  }

  // Show loading while fetching SWITCH data for quiz
  if (showQuiz && recognizedProduct && switchLoading) {
    return (
      <SwitchLayout 
        title={language === 'it' ? 'Preparando il quiz...' : 'Preparing quiz...'}
        subtitle={language === 'it' ? 'Caricamento dati prodotto' : 'Loading product data'}
      >
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧠</div>
          <div style={{
            width: '50px',
            height: '50px',
            margin: '0 auto',
            border: '4px solid #e0e0e0',
            borderTopColor: SWITCH_COLORS.gold,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </SwitchLayout>
    );
  }

  return (
    <SwitchLayout 
      title={`📊 ${t('results.title')}`}
      subtitle={recognizedProduct?.name || (language === 'it' ? 'Risultati analisi' : 'Analysis results')}
      compact={true}
    >
      {/* Quiz Score Banner */}
      {quizResults?.score && (
        <div style={{
          background: `linear-gradient(135deg, ${SWITCH_COLORS.darkBlue} 0%, #2d4a6f 100%)`,
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {language === 'it' ? 'Il tuo punteggio quiz' : 'Your quiz score'}
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
              {quizResults.score.badge.name}
            </div>
          </div>
          <div style={{
            fontSize: '2.2rem',
            fontWeight: 'bold',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '8px 16px'
          }}>
            {quizResults.score.total}
          </div>
        </div>
      )}

      {/* Recognized Product Card */}
      {recognizedProduct && (
        <div style={{
          background: `linear-gradient(135deg, ${SWITCH_COLORS.gold}20 0%, ${SWITCH_COLORS.gold}10 100%)`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          border: `2px solid ${SWITCH_COLORS.gold}`
        }}>
          {productImage ? (
            <img 
              src={productImage} 
              alt={recognizedProduct.name}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '10px',
                objectFit: 'cover',
                border: `2px solid ${SWITCH_COLORS.gold}`
              }}
            />
          ) : (
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '10px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem'
            }}>
              {recognizedProduct.emoji || '🥬'}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              color: SWITCH_COLORS.darkBlue,
              marginBottom: '4px'
            }}>
              {recognizedProduct.name}
            </div>
            {recognizedProduct.category && (
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                {recognizedProduct.category}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCIO Screenshot Preview */}
      {image && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 8px 0' }}>
            {t('results.scioData', 'Dati SCIO')}
          </p>
          <img 
            src={image} 
            alt="SCIO screenshot" 
            style={{
              maxWidth: '120px',
              maxHeight: '120px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              opacity: 0.9
            }}
          />
        </div>
      )}

      {/* Food Name from SCIO (fallback) */}
      {!recognizedProduct && results.foodName && (
        <div style={{
          background: SWITCH_COLORS.lightBg,
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: SWITCH_COLORS.darkBlue }}>
            {results.foodName}
          </span>
        </div>
      )}

      {/* Confidence indicator */}
      {results.confidence !== undefined && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '8px 12px',
          background: results.lowConfidence ? '#ffebee' : '#e8f5e9',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          <span>{results.lowConfidence ? '⚠️' : '✅'}</span>
          <span>{results.lowConfidence ? t('results.lowConfidence', 'Confidenza bassa') : t('results.goodConfidence', 'Dati affidabili')}</span>
        </div>
      )}

      {/* SCIO Measurement Value */}
      {results.value !== undefined && (
        <div style={{
          background: `linear-gradient(135deg, ${SWITCH_COLORS.darkBlue} 0%, #2d4a6f 100%)`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '8px' }}>
            🔬 {results.modelName || 'SCIO'}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            {typeof results.value === 'number' ? results.value.toFixed(2) : results.value}
            <span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>{results.units || ''}</span>
          </div>
          {results.modelType && (
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '8px' }}>
              {results.modelType === 'estimation' ? 'Stima' : results.modelType}
            </div>
          )}
        </div>
      )}

      {/* Nutritional Values */}
      <div style={{
        background: SWITCH_COLORS.lightBg,
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginBottom: '10px', color: SWITCH_COLORS.darkBlue }}>{t('results.nutritionValues')}</h3>
        
        <NutrientRow label={t('results.calories')} value={results.calories} unit="kcal" />
        <NutrientRow label={t('results.carbs')} value={results.carbs} unit="g" />
        <NutrientRow label={t('results.sugar')} value={results.sugar} unit="g" />
        <NutrientRow label={t('results.fiber')} value={results.fiber} unit="g" />
        <NutrientRow label={t('results.protein')} value={results.protein} unit="g" />
        <NutrientRow label={t('results.fat')} value={results.fat} unit="g" />
        <NutrientRow label={t('results.water')} value={results.water} unit="g" />
        {results.brix && <NutrientRow label="°Brix" value={results.brix} unit="" />}
        
        {!results.calories && !results.carbs && !results.sugar && !results.protein && !results.fat && (
          <div style={{ color: '#999', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>
            {t('results.noDetailedNutrition', 'Dettagli nutrizionali non disponibili per questo modello')}
          </div>
        )}
        
        {results.portion && (
          <div style={{ marginTop: '10px', color: '#666', fontSize: '0.85rem' }}>
            {t('results.portion')}: {results.portion}g
          </div>
        )}
        
        <div style={{ 
          marginTop: '12px', 
          padding: '10px', 
          background: `${SWITCH_COLORS.gold}15`, 
          borderRadius: '8px',
          fontSize: '0.75rem', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          ℹ️ {t('results.nutritionSource', 'Dati calcolati per 100g di prodotto. Fonte: SWITCH Food Explorer Database.')}
        </div>
      </div>

      {/* Environmental Impact from SWITCH */}
      {recognizedProduct && (
        <EnvironmentalCard 
          data={switchData} 
          loading={switchLoading} 
        />
      )}

      {/* Product Card with details */}
      {recognizedProduct && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px', color: SWITCH_COLORS.darkBlue }}>🍅 {t('results.productCard')}</h3>
          <ProductCard 
            productName={recognizedProduct.name}
            measuredValue={results.value}
            productImage={productImage}
            switchData={switchData}
          />
        </div>
      )}

      {/* Continue to Feedback button */}
      <button 
        onClick={() => navigate('/feedback')}
        style={{ 
          marginBottom: '10px',
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
        ✨ {t('results.continueToFeedback', 'Continua')}
      </button>

      <button 
        onClick={handleNewScan}
        style={{ 
          marginBottom: '10px',
          width: '100%',
          padding: '14px',
          fontSize: '1rem',
          fontWeight: '600',
          background: '#fff',
          border: `2px solid ${SWITCH_COLORS.green}`,
          color: SWITCH_COLORS.green,
          borderRadius: '12px',
          cursor: 'pointer'
        }}
      >
        📸 {t('results.newScan')}
      </button>

      <button 
        onClick={handleStartOver}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          color: '#666',
          cursor: 'pointer',
          fontSize: '0.9rem',
          padding: '10px'
        }}
      >
        {t('results.startOver')}
      </button>
    </SwitchLayout>
  );
}

export default ResultsScreen;
