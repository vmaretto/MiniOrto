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
  
  // Demo products state
  const [demoProducts, setDemoProducts] = useState([]);
  const [loadingDemoProducts, setLoadingDemoProducts] = useState(true);
  
  const recognizedProduct = JSON.parse(sessionStorage.getItem('recognizedProduct') || '{}');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchDemoProducts();
  }, []);
  
  const fetchDemoProducts = async () => {
    try {
      setLoadingDemoProducts(true);
      const response = await fetch('/api/demo-products');
      if (response.ok) {
        const data = await response.json();
        setDemoProducts(data);
      }
    } catch (err) {
      console.error('Error fetching demo products:', err);
    } finally {
      setLoadingDemoProducts(false);
    }
  };

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
  
  // Handle demo product SCIO data selection
  const handleUseDemoScioData = (product) => {
    // Create SCIO scan data from demo product
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
  
  // Check if current product is a demo product with SCIO data
  const hasPreloadedScioData = recognizedProduct.isDemoProduct && recognizedProduct.scioData;
  
  // Filter demo products for gallery (show all or filtered by matching product)
  const filteredDemoProducts = demoProducts;

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
            {hasPreloadedScioData && (
              <span style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 8px',
                background: SWITCH_COLORS.green + '20',
                borderRadius: '10px',
                fontSize: '0.7rem',
                color: SWITCH_COLORS.green,
                fontWeight: '600'
              }}>
                ✓ {language === 'it' ? 'Dati SCIO disponibili' : 'SCIO data available'}
              </span>
            )}
          </div>
        </div>
      )}

      {!waitingForScan ? (
        <>
          {/* Quick action for demo products with pre-loaded SCIO data */}
          {hasPreloadedScioData && (
            <div style={{
              background: `linear-gradient(135deg, ${SWITCH_COLORS.green}15 0%, ${SWITCH_COLORS.green}05 100%)`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              border: `2px solid ${SWITCH_COLORS.green}`
            }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: SWITCH_COLORS.green,
                fontSize: '0.95rem' 
              }}>
                ⚡ {language === 'it' ? 'Azione rapida' : 'Quick action'}
              </h4>
              <p style={{ 
                margin: '0 0 12px 0', 
                color: '#666', 
                fontSize: '0.85rem' 
              }}>
                {language === 'it' 
                  ? 'Questo prodotto ha già dati SCIO registrati. Puoi usarli direttamente!'
                  : 'This product already has registered SCIO data. You can use it directly!'}
              </p>
              <button
                onClick={() => handleUseDemoScioData({
                  scio_brix: recognizedProduct.scioData.brix,
                  scio_calories: recognizedProduct.scioData.calories,
                  scio_carbs: recognizedProduct.scioData.carbs,
                  scio_sugar: recognizedProduct.scioData.sugar,
                  scio_water: recognizedProduct.scioData.water,
                  scio_protein: recognizedProduct.scioData.protein,
                  scio_fiber: recognizedProduct.scioData.fiber,
                  id: recognizedProduct.demoProductId,
                  name: recognizedProduct.name
                })}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: SWITCH_COLORS.green,
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${SWITCH_COLORS.green}40`
                }}
              >
                ✓ {language === 'it' ? 'Usa dati SCIO pre-registrati' : 'Use pre-registered SCIO data'}
              </button>
            </div>
          )}

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Back button - mobile friendly */}
            <button 
              onClick={handleBackToRecognize}
              style={{ 
                background: 'transparent',
                border: `1px solid ${SWITCH_COLORS.darkBlue}`,
                color: SWITCH_COLORS.darkBlue,
                cursor: 'pointer',
                padding: '12px 16px',
                fontSize: '0.95rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                alignSelf: 'flex-start',
                minHeight: '44px', // Touch-friendly minimum height
                fontWeight: '500'
              }}
            >
              ← {t('spectrometer.goBack')}
            </button>

            <button 
              onClick={handleWaitForScan}
              style={{
                background: `linear-gradient(135deg, ${SWITCH_COLORS.darkBlue} 0%, #2d4a6f 100%)`,
                border: 'none',
                padding: '18px',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
                minHeight: '56px', // Touch-friendly height
                lineHeight: '1.4'
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
                padding: '18px',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                minHeight: '56px', // Touch-friendly height
                fontSize: '1.1rem',
                lineHeight: '1.4'
              }}
            >
              📱 {t('spectrometer.uploadScreenshot')}
            </button>
          </div>
          
          {/* Demo products SCIO gallery */}
          {filteredDemoProducts.length > 0 && (
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
              
              {/* Horizontal scrollable gallery - mobile optimized */}
              <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                padding: '8px 4px',
                marginBottom: '10px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {filteredDemoProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleUseDemoScioData(product)}
                    style={{
                      flex: '0 0 auto',
                      width: '120px', // Slightly wider for better touch targets
                      minHeight: '140px', // Ensure adequate touch area
                      padding: '14px 10px',
                      background: 'white',
                      border: `2px solid ${SWITCH_COLORS.gold}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
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
                      marginBottom: '4px'
                    }}>
                      {product.name}
                    </div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: SWITCH_COLORS.green,
                      fontWeight: '600',
                      background: SWITCH_COLORS.green + '15',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      display: 'inline-block'
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
            
            /* Hide scrollbar for mobile gallery */
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}
    </SwitchLayout>
  );
}

export default SpectrometerScreen;
