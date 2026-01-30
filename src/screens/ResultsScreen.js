// src/screens/ResultsScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ResultsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [image, setImage] = useState(null);
  const [recognizedProduct, setRecognizedProduct] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('scioResults');
    const storedImage = sessionStorage.getItem('scioImage');
    const storedProduct = sessionStorage.getItem('recognizedProduct');
    const storedProductImage = sessionStorage.getItem('productImage');
    
    // Also check for direct SCIO scan data
    const directScanData = sessionStorage.getItem('scioScanData');
    const scanMethod = sessionStorage.getItem('scanMethod');
    
    if (directScanData && scanMethod === 'direct') {
      // Use direct scan data from SCIO app
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

  const handleSendToMiniOrto = async () => {
    setSending(true);
    setError(null);

    try {
      // Get profile data
      const profileData = JSON.parse(sessionStorage.getItem('profileData') || '{}');
      
      // Send to Mini-orto API (placeholder endpoint)
      const response = await fetch('/api/send-to-miniorto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nutritionData: results,
          profile: profileData,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send data');
      }

      setSent(true);
    } catch (err) {
      console.error('Error sending to Mini-orto:', err);
      setError(t('results.sendError'));
    } finally {
      setSending(false);
    }
  };

  const handleNewScan = () => {
    sessionStorage.removeItem('scioResults');
    sessionStorage.removeItem('scioImage');
    navigate('/scan');
  };

  const handleStartOver = () => {
    sessionStorage.clear();
    navigate('/');
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
        <span style={{ fontWeight: 'bold' }}>{value} {unit}</span>
      </div>
    );
  };

  if (!results) {
    return (
      <div className="screen">
        <div className="card">
          <h2>{t('results.noData')}</h2>
          <button className="btn btn-primary" onClick={() => navigate('/scan')}>
            {t('results.goToScan')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="card">
        <h2>📊 {t('results.title')}</h2>

        {/* Recognized Product Card - shows the product identified earlier */}
        {recognizedProduct && (
          <div style={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* Product Image or Emoji */}
            {productImage ? (
              <img 
                src={productImage} 
                alt={recognizedProduct.name}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                  border: '2px solid #4CAF50'
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
                color: '#2e7d32',
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

        {/* SCIO Screenshot Preview (smaller, secondary) */}
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

        {/* Food Name from SCIO (fallback if no recognized product) */}
        {!recognizedProduct && results.foodName && (
          <div style={{
            background: '#e8f5e9',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
              {results.foodName}
            </span>
          </div>
        )}

        {/* Confidence indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '8px 12px',
          background: results.confidence === 'high' ? '#e8f5e9' : 
                     results.confidence === 'medium' ? '#fff3e0' : '#ffebee',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          <span>{results.confidence === 'high' ? '✅' : results.confidence === 'medium' ? '⚠️' : '❓'}</span>
          <span>{t(`results.confidence.${results.confidence}`)}</span>
        </div>

        {/* Nutritional Values */}
        <div style={{
          background: '#f5f5f5',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '10px' }}>{t('results.nutritionValues')}</h3>
          
          <NutrientRow label={t('results.calories')} value={results.calories} unit="kcal" />
          <NutrientRow label={t('results.carbs')} value={results.carbs} unit="g" />
          <NutrientRow label={t('results.sugar')} value={results.sugar} unit="g" />
          <NutrientRow label={t('results.fiber')} value={results.fiber} unit="g" />
          <NutrientRow label={t('results.protein')} value={results.protein} unit="g" />
          <NutrientRow label={t('results.fat')} value={results.fat} unit="g" />
          <NutrientRow label={t('results.water')} value={results.water} unit="g" />
          {results.brix && <NutrientRow label="°Brix" value={results.brix} unit="" />}
          
          {results.portion && (
            <div style={{ marginTop: '10px', color: '#666', fontSize: '0.85rem' }}>
              {t('results.portion')}: {results.portion}g
            </div>
          )}
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

        {sent ? (
          <div style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ✅ {t('results.sentSuccess')}
          </div>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={handleSendToMiniOrto}
            disabled={sending}
            style={{ marginBottom: '10px' }}
          >
            {sending ? t('results.sending') : t('results.sendToMiniOrto')}
          </button>
        )}

        <button 
          className="btn btn-secondary" 
          onClick={handleNewScan}
          style={{ 
            marginBottom: '10px',
            background: '#fff',
            border: '2px solid #4CAF50',
            color: '#4CAF50'
          }}
        >
          📸 {t('results.newScan')}
        </button>

        <button 
          onClick={handleStartOver}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {t('results.startOver')}
        </button>
      </div>
    </div>
  );
}

export default ResultsScreen;
