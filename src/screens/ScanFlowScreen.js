// src/screens/ScanFlowScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Upload, Scan, BarChart3, ChevronRight, Loader2, Check, Leaf } from 'lucide-react';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';
import GlobalProgress from '../components/GlobalProgress';

const SCIO_MODELS = [
  { id: 'Apple_total_soluble_solids', category: 'fruit', match: ['mela', 'apple'] },
  { id: 'Tomato_brix', category: 'vegetable', match: ['pomodoro', 'tomato'] },
  { id: 'Tomato_lycopene', category: 'vegetable', match: ['pomodoro', 'tomato'] },
  { id: 'Pepper_brix', category: 'vegetable', match: ['peperone', 'pepper'] },
  { id: 'Grape_brix', category: 'fruit', match: ['uva', 'grape'] },
  { id: 'Orange_brix', category: 'fruit', match: ['arancia', 'orange'] },
  { id: 'Watermelon_brix', category: 'fruit', match: ['anguria', 'watermelon'] },
  { id: 'Avocado_dry_matter', category: 'fruit', match: ['avocado'] },
];

export default function ScanFlowScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'it';
  
  const [currentStep, setCurrentStep] = useState(1); // Skip model selection, go directly to scan
  const [recognizedFood, setRecognizedFood] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [scanMethod, setScanMethod] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [waitingForScan, setWaitingForScan] = useState(false);
  const [uploadedScreenshot, setUploadedScreenshot] = useState(null); // Preview before analysis
  const [demoProducts, setDemoProducts] = useState([]);
  
  const pollIntervalRef = useRef(null);

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

  // Carica dati prodotto riconosciuto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchDemoProducts();
    
    const storedProduct = sessionStorage.getItem('recognizedProduct');
    const storedImage = sessionStorage.getItem('productImage');
    
    if (!storedProduct) {
      navigate('/recognize');
      return;
    }
    
    setRecognizedFood(JSON.parse(storedProduct));
    if (storedImage) setProductImage(storedImage);
    
    // Auto-select best model based on product name (or default to first model)
    const product = JSON.parse(storedProduct);
    const productName = (product.name || '').toLowerCase();
    const matchedModel = SCIO_MODELS.find(m => 
      m.match.some(keyword => productName.includes(keyword))
    );
    setSelectedModel(matchedModel || SCIO_MODELS[0]); // Always select a model
  }, [navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const STEPS = [
    { id: 'model', title: t('scanflow.steps.model'), icon: BarChart3 },
    { id: 'scan', title: t('scanflow.steps.scan'), icon: Scan },
    { id: 'done', title: t('scanflow.steps.results'), icon: Check },
  ];

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setCurrentStep(1);
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanMethod('screenshot');

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      // Show preview instead of analyzing immediately
      setUploadedScreenshot(base64);
    } catch (err) {
      setError(t('scanflow.error.screenshot') + ' ' + err.message);
    }
  };

  const handleAnalyzeScreenshot = async () => {
    if (!uploadedScreenshot) return;

    setLoading(true);

    try {
      const response = await fetch('/api/analyze-scio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadedScreenshot }),
      });

      const data = await response.json();
      setScanData(data);
      
      // Salva i dati SCIO in sessionStorage
      sessionStorage.setItem('scioResults', JSON.stringify(data));
      sessionStorage.setItem('scioImage', uploadedScreenshot);
      sessionStorage.setItem('scanMethod', 'screenshot');
      
      setCurrentStep(2);
    } catch (err) {
      setError(t('scanflow.error.screenshot') + ' ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScreenshot = () => {
    setUploadedScreenshot(null);
    setScanMethod(null);
  };

  const startWaitingForScan = () => {
    setScanMethod('direct');
    setWaitingForScan(true);
    
    const sessionId = Date.now().toString();
    localStorage.setItem('pendingScanSession', sessionId);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/get-latest-scan?session=${sessionId}`);
        const data = await response.json();
        
        if (data.found) {
          clearInterval(pollIntervalRef.current);
          setWaitingForScan(false);
          setScanData(data.scan);
          
          // Salva i dati SCIO
          sessionStorage.setItem('scioScanData', JSON.stringify(data.scan));
          sessionStorage.setItem('scanMethod', 'direct');
          
          setCurrentStep(2);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 2000);

    setTimeout(() => {
      if (waitingForScan) {
        clearInterval(pollIntervalRef.current);
        setWaitingForScan(false);
        setError(t('scanflow.scan.timeout'));
      }
    }, 120000);
  };

  const cancelWaiting = () => {
    clearInterval(pollIntervalRef.current);
    setWaitingForScan(false);
    setScanMethod(null);
  };

  const handleContinueToResults = () => {
    navigate('/results');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return language === 'it' ? 'Seleziona modello SCIO' : 'Select SCIO model';
      case 1: return language === 'it' ? 'Scansiona con SCIO' : 'Scan with SCIO';
      case 2: return language === 'it' ? 'Scansione completata!' : 'Scan complete!';
      default: return 'Scan Flow';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {recognizedFood && (
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
                {productImage ? (
                  <img src={productImage} alt={recognizedFood.name} style={{
                    width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover'
                  }} />
                ) : (
                  <div style={{ fontSize: '2rem' }}>{recognizedFood.emoji || '🥬'}</div>
                )}
                <div>
                  <strong style={{ color: SWITCH_COLORS.darkBlue }}>{t('scanflow.model.recognized')}</strong>
                  <div style={{ color: '#666' }}>{recognizedFood.name}</div>
                </div>
              </div>
            )}

            <p style={{ color: '#666', marginBottom: '16px' }}>{t('scanflow.model.choose')}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SCIO_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: selectedModel?.id === model.id ? `${SWITCH_COLORS.gold}20` : 'white',
                    border: `2px solid ${selectedModel?.id === model.id ? SWITCH_COLORS.gold : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: SWITCH_COLORS.darkBlue }}>
                      {t(`model.${model.id}`)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {t(`model.category.${model.category}`)}
                    </div>
                  </div>
                  <ChevronRight size={20} color={SWITCH_COLORS.darkBlue} />
                </button>
              ))}
            </div>
          </>
        );

      case 1:
        return (
          <>
            <div style={{
              background: SWITCH_COLORS.lightBg,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0 }}><strong>{t('scanflow.scan.food')}</strong> {recognizedFood?.name}</p>
            </div>

            {/* Screenshot preview mode */}
            {uploadedScreenshot ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: SWITCH_COLORS.darkBlue, fontWeight: '600', marginBottom: '12px' }}>
                  {language === 'it' ? 'Immagine caricata:' : 'Uploaded image:'}
                </p>
                <img 
                  src={uploadedScreenshot} 
                  alt="Screenshot preview" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    border: `2px solid ${SWITCH_COLORS.gold}`,
                    marginBottom: '20px',
                    objectFit: 'contain'
                  }}
                />
                
                {loading ? (
                  <div style={{ padding: '20px 0' }}>
                    <Loader2 size={32} color={SWITCH_COLORS.gold} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: '#666', marginTop: '8px' }}>{language === 'it' ? 'Analisi in corso...' : 'Analyzing...'}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleCancelScreenshot}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: 'white',
                        color: '#666',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {language === 'it' ? 'Cambia' : 'Change'}
                    </button>
                    <button
                      onClick={handleAnalyzeScreenshot}
                      style={{
                        flex: 2,
                        padding: '14px',
                        background: SWITCH_COLORS.green,
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Scan size={20} /> {language === 'it' ? 'Analizza' : 'Analyze'}
                    </button>
                  </div>
                )}
              </div>
            ) : !waitingForScan ? (
              <>
                <button
                  onClick={startWaitingForScan}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: `linear-gradient(135deg, ${SWITCH_COLORS.darkBlue} 0%, #2d4a6f 100%)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}
                >
                  <Scan size={20} /> {t('scanflow.scan.direct.button')}
                </button>

                <div style={{ textAlign: 'center', color: '#666', margin: '16px 0' }}>{t('scanflow.scan.or')}</div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  id="screenshot-input"
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="screenshot-input"
                  style={{
                    display: 'flex',
                    width: '100%',
                    padding: '16px',
                    background: 'white',
                    color: SWITCH_COLORS.green,
                    border: `2px solid ${SWITCH_COLORS.green}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxSizing: 'border-box'
                  }}
                >
                  <Upload size={20} /> {t('scanflow.scan.screenshot.button')}
                </label>

                {/* Demo products SCIO gallery */}
                {demoProducts.length > 0 && (
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
                          onClick={() => {
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
                            const currentProduct = JSON.parse(sessionStorage.getItem('recognizedProduct') || '{}');
                            currentProduct.scioData = scioData;
                            sessionStorage.setItem('recognizedProduct', JSON.stringify(currentProduct));
                            navigate('/results');
                          }}
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
                          <div style={{ fontSize: '2rem', marginBottom: '6px' }}>
                            {product.emoji || '🥬'}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '600', 
                            color: SWITCH_COLORS.darkBlue,
                            lineHeight: 1.2
                          }}>
                            {product.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Loader2 size={48} color={SWITCH_COLORS.gold} style={{ animation: 'spin 1s linear infinite' }} />
                <h3 style={{ color: SWITCH_COLORS.darkBlue, marginTop: '16px' }}>{t('scanflow.scan.waiting')}</h3>
                <p style={{ color: '#666' }}>{t('scanflow.scan.waitingDesc')}</p>
                <button
                  onClick={cancelWaiting}
                  style={{
                    marginTop: '20px',
                    padding: '10px 24px',
                    background: 'transparent',
                    border: `1px solid ${SWITCH_COLORS.darkBlue}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: SWITCH_COLORS.darkBlue
                  }}
                >
                  {t('scanflow.scan.cancel')}
                </button>
              </div>
            )}
          </>
        );

      case 2:
        return (
          <>
            <div style={{
              background: `linear-gradient(135deg, ${SWITCH_COLORS.green}20 0%, ${SWITCH_COLORS.green}10 100%)`,
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <Check size={48} color={SWITCH_COLORS.green} style={{ marginBottom: '12px' }} />
              <h3 style={{ color: SWITCH_COLORS.darkBlue, margin: 0 }}>{t('scanflow.results.complete')}</h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '16px',
              background: SWITCH_COLORS.lightBg,
              borderRadius: '12px'
            }}>
              {productImage && <img src={productImage} alt="Food" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />}
              <div>
                <strong style={{ color: SWITCH_COLORS.darkBlue }}>{recognizedFood?.name}</strong>
              </div>
            </div>

            {/* Preview dati scansione */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {scanData?.value && (
                <div style={{
                  background: `linear-gradient(135deg, ${SWITCH_COLORS.darkBlue} 0%, #2d4a6f 100%)`,
                  borderRadius: '12px',
                  padding: '20px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{t('scanflow.results.value')}</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {scanData.value} {scanData.units || (selectedModel?.id.includes('brix') ? '°Brix' : '')}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleContinueToResults}
              style={{
                width: '100%',
                padding: '16px',
                background: SWITCH_COLORS.green,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${SWITCH_COLORS.green}50`
              }}
            >
              🍽️ {language === 'it' ? 'Vai alla Scheda Prodotto' : 'Go to Product Card'}
              <ChevronRight size={20} />
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SwitchLayout
      title={`🔬 ${getStepTitle()}`}
      subtitle={`${language === 'it' ? 'Passo' : 'Step'} ${currentStep + 1}/${STEPS.length}`}
      compact={true}
    >
      <GlobalProgress currentStep="scan" language={language} />

      {/* Progress bar interna */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {STEPS.map((step, index) => (
          <div 
            key={step.id}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: index <= currentStep ? SWITCH_COLORS.gold : '#e0e0e0',
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Step content */}
      {renderStepContent()}
      
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </SwitchLayout>
  );
}
