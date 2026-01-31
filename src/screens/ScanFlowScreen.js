import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, Scan, BarChart3, ChevronRight, Loader2, Check, Leaf } from 'lucide-react';

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
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [recognizedFood, setRecognizedFood] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [scanMethod, setScanMethod] = useState(null); // 'screenshot' or 'direct'
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [waitingForScan, setWaitingForScan] = useState(false);
  
  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Steps with translated titles
  const STEPS = [
    { id: 'photo', title: t('scanflow.steps.photo'), icon: Camera },
    { id: 'model', title: t('scanflow.steps.model'), icon: Scan },
    { id: 'scan', title: t('scanflow.steps.scan'), icon: Upload },
    { id: 'results', title: t('scanflow.steps.results'), icon: BarChart3 },
  ];

  // Step 1: Handle photo upload and recognition
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Convert to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      setPhoto(base64);

      // Call AI to recognize food
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

  // Step 2: Select model
  const handleSelectModel = (model) => {
    setSelectedModel(model);
    setCurrentStep(2);
  };

  // Step 3a: Handle screenshot upload
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

      // Analyze screenshot with Claude Vision
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

  // Step 3b: Wait for direct scan from SCIO app
  const startWaitingForScan = () => {
    setScanMethod('direct');
    setWaitingForScan(true);
    
    // Poll for new scan data
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

    // Timeout after 2 minutes
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

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Photo upload
        return (
          <div className="step-content">
            <h2>{t('scanflow.photo.title')}</h2>
            <p>{t('scanflow.photo.subtitle')}</p>
            
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            
            <button 
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="spin" /> {t('scanflow.photo.analyzing')}</>
              ) : (
                <><Camera /> {t('scanflow.photo.button')}</>
              )}
            </button>

            {photo && (
              <div className="preview">
                <img src={photo} alt="Preview" />
              </div>
            )}
          </div>
        );

      case 1: // Model selection
        return (
          <div className="step-content">
            <h2>{t('scanflow.model.title')}</h2>
            
            {recognizedFood && (
              <div className="recognized-food">
                <Leaf />
                <div>
                  <strong>{t('scanflow.model.recognized')}</strong>
                  <span>{recognizedFood.name || recognizedFood.foodName}</span>
                </div>
              </div>
            )}

            <p>{t('scanflow.model.choose')}</p>
            
            <div className="model-list">
              {SCIO_MODELS.map((model) => (
                <button
                  key={model.id}
                  className={`model-item ${selectedModel?.id === model.id ? 'selected' : ''}`}
                  onClick={() => handleSelectModel(model)}
                >
                  <div className="model-info">
                    <span className="model-name">{t(`model.${model.id}`)}</span>
                    <span className="model-category">{t(`model.category.${model.category}`)}</span>
                  </div>
                  <ChevronRight />
                </button>
              ))}
            </div>
          </div>
        );

      case 2: // Scan options
        return (
          <div className="step-content">
            <h2>{t('scanflow.scan.title')}</h2>
            
            <div className="scan-info">
              <p><strong>{t('scanflow.scan.food')}</strong> {recognizedFood?.name || recognizedFood?.foodName}</p>
              <p><strong>{t('scanflow.scan.model')}</strong> {selectedModel ? t(`model.${selectedModel.id}`) : ''}</p>
            </div>

            {!waitingForScan ? (
              <div className="scan-options">
                <div className="scan-option">
                  <h3>{t('scanflow.scan.direct.title')}</h3>
                  <p>{t('scanflow.scan.direct.desc')}</p>
                  <button className="btn-primary" onClick={startWaitingForScan}>
                    <Scan /> {t('scanflow.scan.direct.button')}
                  </button>
                </div>

                <div className="divider">{t('scanflow.scan.or')}</div>

                <div className="scan-option">
                  <h3>{t('scanflow.scan.screenshot.title')}</h3>
                  <p>{t('scanflow.scan.screenshot.desc')}</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    id="screenshot-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="screenshot-input" className="btn-secondary">
                    <Upload /> {t('scanflow.scan.screenshot.button')}
                  </label>
                </div>
              </div>
            ) : (
              <div className="waiting-scan">
                <Loader2 className="spin large" />
                <h3>{t('scanflow.scan.waiting')}</h3>
                <p>{t('scanflow.scan.waitingDesc')}</p>
                <button className="btn-cancel" onClick={cancelWaiting}>
                  {t('scanflow.scan.cancel')}
                </button>
              </div>
            )}
          </div>
        );

      case 3: // Results
        return (
          <div className="step-content">
            <h2>{t('scanflow.results.title')}</h2>
            
            <div className="results-card">
              <div className="result-header">
                <Check className="success-icon" />
                <h3>{t('scanflow.results.complete')}</h3>
              </div>

              <div className="result-food">
                {photo && <img src={photo} alt="Food" className="food-thumb" />}
                <div>
                  <strong>{recognizedFood?.name || recognizedFood?.foodName}</strong>
                  <span>{selectedModel ? t(`model.${selectedModel.id}`) : ''}</span>
                </div>
              </div>

              <div className="result-values">
                {scanData?.value && (
                  <div className="value-item main">
                    <span className="label">{t('scanflow.results.value')}</span>
                    <span className="value">{scanData.value} {scanData.units || selectedModel?.id.includes('brix') ? '°Brix' : ''}</span>
                  </div>
                )}
                
                {scanData?.confidence && (
                  <div className="value-item">
                    <span className="label">{t('scanflow.results.confidence')}</span>
                    <span className="value">{(scanData.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}

                {scanData?.water && (
                  <div className="value-item">
                    <span className="label">{t('scanflow.results.water')}</span>
                    <span className="value">{scanData.water} g/100g</span>
                  </div>
                )}

                {scanData?.carbs && (
                  <div className="value-item">
                    <span className="label">{t('scanflow.results.carbs')}</span>
                    <span className="value">{scanData.carbs} g/100g</span>
                  </div>
                )}

                {scanData?.sugar && (
                  <div className="value-item">
                    <span className="label">{t('scanflow.results.sugar')}</span>
                    <span className="value">{scanData.sugar} g/100g</span>
                  </div>
                )}

                {scanData?.calories && (
                  <div className="value-item">
                    <span className="label">{t('scanflow.results.calories')}</span>
                    <span className="value">{scanData.calories} kcal</span>
                  </div>
                )}
              </div>

              <div className="result-meta">
                <span>📅 {new Date().toLocaleDateString()}</span>
                <span>🔬 {scanMethod === 'direct' ? t('scanflow.results.scanDirect') : t('scanflow.results.scanScreenshot')}</span>
              </div>
            </div>

            <button className="btn-primary" onClick={() => {
              setCurrentStep(0);
              setPhoto(null);
              setRecognizedFood(null);
              setSelectedModel(null);
              setScanData(null);
              setScanMethod(null);
            }}>
              {t('scanflow.results.newScan')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="scan-flow-screen">
      {/* Progress bar */}
      <div className="progress-bar">
        {STEPS.map((step, index) => (
          <div 
            key={step.id}
            className={`progress-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="step-icon">
              {index < currentStep ? <Check size={16} /> : <step.icon size={16} />}
            </div>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Error display */}
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Step content */}
      {renderStepContent()}
    </div>
  );
}
