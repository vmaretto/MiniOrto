// src/screens/ScanFlowScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, Scan, BarChart3, ChevronRight, Loader2, Check, Leaf } from 'lucide-react';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';

const SCIO_MODELS = [
  { id: 'Apple_total_soluble_solids', category: 'fruit' },
  { id: 'Tomato_brix', category: 'vegetable' },
  { id: 'Tomato_lycopene', category: 'vegetable' },
  { id: 'Pepper_brix', category: 'vegetable' },
  { id: 'Grape_brix', category: 'fruit' },
  { id: 'Orange_brix', category: 'fruit' },
  { id: 'Watermelon_brix', category: 'fruit' },
  { id: 'Avocado_dry_matter', category: 'fruit' },
];

export default function ScanFlowScreen() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'it';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [recognizedFood, setRecognizedFood] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [scanMethod, setScanMethod] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [waitingForScan, setWaitingForScan] = useState(false);
  
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const STEPS = [
    { id: 'photo', title: t('scanflow.steps.photo'), icon: Camera },
    { id: 'model', title: t('scanflow.steps.model'), icon: Scan },
    { id: 'scan', title: t('scanflow.steps.scan'), icon: Upload },
    { id: 'results', title: t('scanflow.steps.results'), icon: BarChart3 },
  ];

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      setPhoto(base64);

      const response = await fetch('/api/recognize-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setRecognizedFood(data);
        setCurrentStep(1);
      }
    } catch (err) {
      setError(t('scanflow.error.recognition') + ' ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setCurrentStep(2);
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setScanMethod('screenshot');

    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/analyze-scio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();
      setScanData(data);
      setCurrentStep(3);
    } catch (err) {
      setError(t('scanflow.error.screenshot') + ' ' + err.message);
    } finally {
      setLoading(false);
    }
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
          setCurrentStep(3);
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return language === 'it' ? 'Fotografa il prodotto' : 'Take a photo';
      case 1: return language === 'it' ? 'Seleziona modello' : 'Select model';
      case 2: return language === 'it' ? 'Scansiona' : 'Scan';
      case 3: return language === 'it' ? 'Risultati' : 'Results';
      default: return 'Scan Flow';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <p style={{ color: '#666', marginBottom: '20px', textAlign: 'center' }}>
              {t('scanflow.photo.subtitle')}
            </p>
            
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `3px dashed ${SWITCH_COLORS.gold}`,
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: SWITCH_COLORS.lightBg,
                marginBottom: '20px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={48} color={SWITCH_COLORS.gold} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: SWITCH_COLORS.darkBlue, marginTop: '12px' }}>{t('scanflow.photo.analyzing')}</p>
                </>
              ) : (
                <>
                  <Camera size={48} color={SWITCH_COLORS.gold} />
                  <p style={{ color: SWITCH_COLORS.darkBlue, marginTop: '12px', fontWeight: '500' }}>
                    {t('scanflow.photo.button')}
                  </p>
                </>
              )}
            </div>

            {photo && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src={photo} alt="Preview" style={{ maxWidth: '200px', borderRadius: '12px' }} />
              </div>
            )}
            
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        );

      case 1:
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
                <Leaf size={24} color={SWITCH_COLORS.green} />
                <div>
                  <strong style={{ color: SWITCH_COLORS.darkBlue }}>{t('scanflow.model.recognized')}</strong>
                  <div style={{ color: '#666' }}>{recognizedFood.name || recognizedFood.foodName}</div>
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

      case 2:
        return (
          <>
            <div style={{
              background: SWITCH_COLORS.lightBg,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0 }}><strong>{t('scanflow.scan.food')}</strong> {recognizedFood?.name || recognizedFood?.foodName}</p>
              <p style={{ margin: '8px 0 0' }}><strong>{t('scanflow.scan.model')}</strong> {selectedModel ? t(`model.${selectedModel.id}`) : ''}</p>
            </div>

            {!waitingForScan ? (
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

      case 3:
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
              {photo && <img src={photo} alt="Food" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />}
              <div>
                <strong style={{ color: SWITCH_COLORS.darkBlue }}>{recognizedFood?.name || recognizedFood?.foodName}</strong>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>{selectedModel ? t(`model.${selectedModel.id}`) : ''}</div>
              </div>
            </div>

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
              
              {scanData?.confidence && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: SWITCH_COLORS.lightBg, borderRadius: '8px' }}>
                  <span style={{ color: '#666' }}>{t('scanflow.results.confidence')}</span>
                  <strong style={{ color: SWITCH_COLORS.darkBlue }}>{(scanData.confidence * 100).toFixed(0)}%</strong>
                </div>
              )}

              {scanData?.water && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: SWITCH_COLORS.lightBg, borderRadius: '8px' }}>
                  <span style={{ color: '#666' }}>{t('scanflow.results.water')}</span>
                  <strong style={{ color: SWITCH_COLORS.darkBlue }}>{scanData.water} g/100g</strong>
                </div>
              )}

              {scanData?.carbs && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: SWITCH_COLORS.lightBg, borderRadius: '8px' }}>
                  <span style={{ color: '#666' }}>{t('scanflow.results.carbs')}</span>
                  <strong style={{ color: SWITCH_COLORS.darkBlue }}>{scanData.carbs} g/100g</strong>
                </div>
              )}

              {scanData?.sugar && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: SWITCH_COLORS.lightBg, borderRadius: '8px' }}>
                  <span style={{ color: '#666' }}>{t('scanflow.results.sugar')}</span>
                  <strong style={{ color: SWITCH_COLORS.darkBlue }}>{scanData.sugar} g/100g</strong>
                </div>
              )}

              {scanData?.calories && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: SWITCH_COLORS.lightBg, borderRadius: '8px' }}>
                  <span style={{ color: '#666' }}>{t('scanflow.results.calories')}</span>
                  <strong style={{ color: SWITCH_COLORS.darkBlue }}>{scanData.calories} kcal</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px', fontSize: '0.85rem', color: '#666' }}>
              <span>📅 {new Date().toLocaleDateString()}</span>
              <span>🔬 {scanMethod === 'direct' ? t('scanflow.results.scanDirect') : t('scanflow.results.scanScreenshot')}</span>
            </div>

            <button
              onClick={() => {
                setCurrentStep(0);
                setPhoto(null);
                setRecognizedFood(null);
                setSelectedModel(null);
                setScanData(null);
                setScanMethod(null);
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: SWITCH_COLORS.green,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {t('scanflow.results.newScan')}
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SwitchLayout
      title={getStepTitle()}
      subtitle={`${language === 'it' ? 'Passo' : 'Step'} ${currentStep + 1}/${STEPS.length}`}
      compact={true}
    >
      {/* Progress bar */}
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
    </SwitchLayout>
  );
}
