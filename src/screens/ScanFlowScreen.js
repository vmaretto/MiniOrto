import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, BarChart3, ChevronRight, Loader2, Check, Leaf } from 'lucide-react';

const SCIO_MODELS = [
  { id: 'Apple_total_soluble_solids', name: 'Mela - Solidi solubili (Brix)', category: 'Frutta' },
  { id: 'Tomato_brix', name: 'Pomodoro - Brix', category: 'Verdura' },
  { id: 'Tomato_lycopene', name: 'Pomodoro - Licopene', category: 'Verdura' },
  { id: 'Pepper_brix', name: 'Peperone - Brix', category: 'Verdura' },
  { id: 'Grape_brix', name: 'Uva - Brix', category: 'Frutta' },
  { id: 'Orange_brix', name: 'Arancia - Brix', category: 'Frutta' },
  { id: 'Watermelon_brix', name: 'Anguria - Brix', category: 'Frutta' },
  { id: 'Avocado_dry_matter', name: 'Avocado - Materia secca', category: 'Frutta' },
];

const STEPS = [
  { id: 'photo', title: 'Foto', icon: Camera },
  { id: 'model', title: 'Modello', icon: Scan },
  { id: 'scan', title: 'Scansione', icon: Upload },
  { id: 'results', title: 'Risultati', icon: BarChart3 },
];

export default function ScanFlowScreen() {
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
      setError('Errore nel riconoscimento: ' + err.message);
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
      setError('Errore analisi screenshot: ' + err.message);
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
        setError('Timeout: nessuno scan ricevuto. Riprova.');
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
            <h2>📸 Fotografa l'alimento</h2>
            <p>Carica una foto dell'alimento che vuoi analizzare</p>
            
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
                <><Loader2 className="spin" /> Analisi in corso...</>
              ) : (
                <><Camera /> Scatta o carica foto</>
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
            <h2>📋 Seleziona il modello SCIO</h2>
            
            {recognizedFood && (
              <div className="recognized-food">
                <Leaf />
                <div>
                  <strong>Alimento riconosciuto:</strong>
                  <span>{recognizedFood.name || recognizedFood.foodName}</span>
                </div>
              </div>
            )}

            <p>Scegli il modello per la misurazione:</p>
            
            <div className="model-list">
              {SCIO_MODELS.map((model) => (
                <button
                  key={model.id}
                  className={`model-item ${selectedModel?.id === model.id ? 'selected' : ''}`}
                  onClick={() => handleSelectModel(model)}
                >
                  <div className="model-info">
                    <span className="model-name">{model.name}</span>
                    <span className="model-category">{model.category}</span>
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
            <h2>🔬 Scansione SCIO</h2>
            
            <div className="scan-info">
              <p><strong>Alimento:</strong> {recognizedFood?.name || recognizedFood?.foodName}</p>
              <p><strong>Modello:</strong> {selectedModel?.name}</p>
            </div>

            {!waitingForScan ? (
              <div className="scan-options">
                <div className="scan-option">
                  <h3>📱 Scan diretto</h3>
                  <p>Usa l'app SCIO e i dati arriveranno automaticamente</p>
                  <button className="btn-primary" onClick={startWaitingForScan}>
                    <Scan /> Avvia e attendi scan
                  </button>
                </div>

                <div className="divider">oppure</div>

                <div className="scan-option">
                  <h3>📸 Carica screenshot</h3>
                  <p>Carica uno screenshot dall'app SCIO</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    id="screenshot-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="screenshot-input" className="btn-secondary">
                    <Upload /> Carica screenshot
                  </label>
                </div>
              </div>
            ) : (
              <div className="waiting-scan">
                <Loader2 className="spin large" />
                <h3>In attesa dello scan...</h3>
                <p>Apri l'app SCIO sul tuo iPhone e fai la scansione.<br/>I dati arriveranno automaticamente.</p>
                <button className="btn-cancel" onClick={cancelWaiting}>
                  Annulla
                </button>
              </div>
            )}
          </div>
        );

      case 3: // Results
        return (
          <div className="step-content">
            <h2>📊 Risultati</h2>
            
            <div className="results-card">
              <div className="result-header">
                <Check className="success-icon" />
                <h3>Analisi completata!</h3>
              </div>

              <div className="result-food">
                {photo && <img src={photo} alt="Food" className="food-thumb" />}
                <div>
                  <strong>{recognizedFood?.name || recognizedFood?.foodName}</strong>
                  <span>{selectedModel?.name}</span>
                </div>
              </div>

              <div className="result-values">
                {scanData?.value && (
                  <div className="value-item main">
                    <span className="label">Valore misurato</span>
                    <span className="value">{scanData.value} {scanData.units || selectedModel?.id.includes('brix') ? '°Brix' : ''}</span>
                  </div>
                )}
                
                {scanData?.confidence && (
                  <div className="value-item">
                    <span className="label">Confidenza</span>
                    <span className="value">{(scanData.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}

                {scanData?.water && (
                  <div className="value-item">
                    <span className="label">Acqua</span>
                    <span className="value">{scanData.water} g/100g</span>
                  </div>
                )}

                {scanData?.carbs && (
                  <div className="value-item">
                    <span className="label">Carboidrati</span>
                    <span className="value">{scanData.carbs} g/100g</span>
                  </div>
                )}

                {scanData?.sugar && (
                  <div className="value-item">
                    <span className="label">Zuccheri</span>
                    <span className="value">{scanData.sugar} g/100g</span>
                  </div>
                )}

                {scanData?.calories && (
                  <div className="value-item">
                    <span className="label">Calorie</span>
                    <span className="value">{scanData.calories} kcal</span>
                  </div>
                )}
              </div>

              <div className="result-meta">
                <span>📅 {new Date().toLocaleDateString('it-IT')}</span>
                <span>🔬 {scanMethod === 'direct' ? 'Scan diretto' : 'Screenshot'}</span>
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
              Nuova analisi
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
