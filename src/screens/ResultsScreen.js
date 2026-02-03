// src/screens/ResultsScreen.js - Confronto percezione vs realtà
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { Flame, Droplets, Leaf, TrendingUp, TrendingDown, Minus, Trophy, Target } from 'lucide-react';
import ProductCard from '../components/ProductCard';
// EnvironmentalCard now integrated in ProductCard
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';
import GlobalProgress from '../components/GlobalProgress';

// Componente per singola riga di confronto con animazione
const ComparisonRow = ({ icon, label, userValue, realValue, unit, color, language }) => {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);
  
  // Calcola scarto percentuale
  const deviation = realValue > 0 ? ((userValue - realValue) / realValue * 100) : 0;
  const absDeviation = Math.abs(deviation);
  
  // Determina se è "vicino" (entro 20%) o "lontano"
  const isClose = absDeviation <= 20;
  const isMedium = absDeviation > 20 && absDeviation <= 50;
  
  // Colori e icone basati sullo scarto
  const getStatusColor = () => {
    if (isClose) return '#4CAF50'; // verde
    if (isMedium) return '#FF9800'; // arancione
    return '#f44336'; // rosso
  };
  
  const getStatusIcon = () => {
    if (deviation > 10) return <TrendingUp size={16} color={getStatusColor()} />;
    if (deviation < -10) return <TrendingDown size={16} color={getStatusColor()} />;
    return <Minus size={16} color={getStatusColor()} />;
  };
  
  const getStatusEmoji = () => {
    if (isClose) return '✅';
    if (isMedium) return '⚠️';
    return '❌';
  };
  
  return (
    <div style={{
      padding: '16px',
      background: SWITCH_COLORS.lightBg,
      borderRadius: '12px',
      marginBottom: '12px',
      borderLeft: `4px solid ${color}`,
      opacity: animated ? 1 : 0,
      transform: animated ? 'translateX(0)' : 'translateX(-20px)',
      transition: 'all 0.5s ease-out'
    }}>
      {/* Header con icona e label */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        marginBottom: '12px'
      }}>
        {icon}
        <span style={{ fontWeight: '600', color: SWITCH_COLORS.darkBlue, flex: 1 }}>
          {label}
        </span>
        <span style={{ fontSize: '1.2rem' }}>{getStatusEmoji()}</span>
      </div>
      
      {/* Valori affiancati */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '8px'
      }}>
        <div style={{
          padding: '10px',
          background: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>
            {language === 'it' ? 'Tua stima' : 'Your estimate'}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: SWITCH_COLORS.darkBlue }}>
            {typeof userValue === 'number' ? userValue.toFixed(1) : userValue} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{unit}</span>
          </div>
        </div>
        <div style={{
          padding: '10px',
          background: `${color}20`,
          borderRadius: '8px',
          textAlign: 'center',
          border: `2px solid ${color}`
        }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>
            {language === 'it' ? 'Valore reale' : 'Real value'}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color }}>
            {typeof realValue === 'number' ? realValue.toFixed(1) : realValue} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{unit}</span>
          </div>
        </div>
      </div>
      
      {/* Scarto % */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px',
        background: `${getStatusColor()}15`,
        borderRadius: '8px',
        color: getStatusColor(),
        fontSize: '0.9rem',
        fontWeight: '500'
      }}>
        {getStatusIcon()}
        <span>
          {deviation > 0 ? '+' : ''}{deviation.toFixed(0)}% {language === 'it' ? 'rispetto al reale' : 'vs real'}
        </span>
      </div>
    </div>
  );
};

function ResultsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [image, setImage] = useState(null);
  const [recognizedProduct, setRecognizedProduct] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [switchData, setSwitchData] = useState(null);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [showFullResults, setShowFullResults] = useState(false);
  const language = i18n?.language || 'it';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Carica tutti i dati da sessionStorage
    const storedResults = sessionStorage.getItem('scioResults');
    const storedImage = sessionStorage.getItem('scioImage');
    const storedProduct = sessionStorage.getItem('recognizedProduct');
    const storedProductImage = sessionStorage.getItem('productImage');
    const storedQuiz = sessionStorage.getItem('quizAnswers');
    
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
        source: 'direct-scio',
        scanDate: scanData.scanDate || new Date().toISOString(),
        ...scanData.nutrition
      });
    } else if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    
    if (storedImage) setImage(storedImage);
    if (storedProduct) setRecognizedProduct(JSON.parse(storedProduct));
    if (storedProductImage) setProductImage(storedProductImage);
    if (storedQuiz) setQuizAnswers(JSON.parse(storedQuiz));
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

  // Calcola punteggio totale dal confronto
  const calculateTotalScore = () => {
    if (!quizAnswers?.answers || !quizAnswers?.realValues) return null;
    
    const { answers, realValues } = quizAnswers;
    let totalScore = 0;
    let count = 0;
    
    const metrics = ['calories', 'water', 'co2', 'waterFootprint'];
    metrics.forEach(key => {
      if (answers[key] !== undefined && realValues[key]) {
        const deviation = Math.abs((answers[key] - realValues[key]) / realValues[key] * 100);
        if (deviation <= 10) totalScore += 100;
        else if (deviation <= 20) totalScore += 80;
        else if (deviation <= 35) totalScore += 60;
        else if (deviation <= 50) totalScore += 40;
        else totalScore += 20;
        count++;
      }
    });
    
    return count > 0 ? Math.round(totalScore / count) : null;
  };

  const score = calculateTotalScore();

  const getBadge = (s) => {
    if (s >= 90) return { name: language === 'it' ? '🏆 Esperto Assoluto!' : '🏆 Absolute Expert!', color: SWITCH_COLORS.gold };
    if (s >= 70) return { name: language === 'it' ? '🥇 Grande Conoscitore' : '🥇 Great Connoisseur', color: '#C0C0C0' };
    if (s >= 50) return { name: language === 'it' ? '🥈 Buon Osservatore' : '🥈 Good Observer', color: '#CD7F32' };
    if (s >= 30) return { name: language === 'it' ? '🌱 In Crescita' : '🌱 Growing', color: SWITCH_COLORS.green };
    return { name: language === 'it' ? '🔍 Curioso' : '🔍 Curious', color: SWITCH_COLORS.darkBlue };
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

  if (!results && !quizAnswers) {
    return (
      <SwitchLayout 
        title={t('results.noData')}
        subtitle={language === 'it' ? 'Nessun dato disponibile' : 'No data available'}
      >
        <GlobalProgress currentStep="results" language={language} />
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

  return (
    <SwitchLayout 
      title={`📊 ${language === 'it' ? 'Confronto Risultati' : 'Results Comparison'}`}
      subtitle={recognizedProduct?.name || (language === 'it' ? 'Percezione vs Realtà' : 'Perception vs Reality')}
      compact={true}
    >
      <GlobalProgress currentStep="results" language={language} />

      {/* HERO: Punteggio totale con animazione */}
      {score !== null && (
        <div style={{
          background: `linear-gradient(135deg, ${SWITCH_COLORS.darkBlue} 0%, #2d4a6f 100%)`,
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          <Trophy size={40} color={SWITCH_COLORS.gold} style={{ marginBottom: '12px' }} />
          <div style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            lineHeight: 1,
            marginBottom: '8px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            {score}
          </div>
          <div style={{ opacity: 0.9, marginBottom: '12px' }}>
            {language === 'it' ? 'punti su 100' : 'points out of 100'}
          </div>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: getBadge(score).color
          }}>
            {getBadge(score).name}
          </div>
        </div>
      )}

      {/* Prodotto riconosciuto */}
      {recognizedProduct && (
        <div style={{
          background: `linear-gradient(135deg, ${SWITCH_COLORS.gold}20 0%, ${SWITCH_COLORS.gold}10 100%)`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
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
                width: '60px',
                height: '60px',
                borderRadius: '10px',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ fontSize: '2.5rem' }}>{recognizedProduct.emoji || '🥬'}</div>
          )}
          <div>
            <div style={{ fontWeight: 'bold', color: SWITCH_COLORS.darkBlue, fontSize: '1.1rem' }}>
              {recognizedProduct.name}
            </div>
            {recognizedProduct.category && (
              <div style={{ fontSize: '0.85rem', color: '#666' }}>{recognizedProduct.category}</div>
            )}
          </div>
        </div>
      )}

      {/* CONFRONTO PERCEZIONE VS REALTÀ */}
      {quizAnswers && !quizAnswers.skipped && quizAnswers.answers && quizAnswers.realValues && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            color: SWITCH_COLORS.darkBlue, 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Target size={20} />
            {language === 'it' ? 'Le tue stime vs Realtà' : 'Your estimates vs Reality'}
          </h3>
          
          {quizAnswers.answers.calories !== undefined && (
            <ComparisonRow
              icon={<Flame size={24} color="#FF6B6B" />}
              label={language === 'it' ? 'Calorie' : 'Calories'}
              userValue={quizAnswers.answers.calories}
              realValue={quizAnswers.realValues.calories}
              unit="kcal/100g"
              color="#FF6B6B"
              language={language}
            />
          )}
          
          {quizAnswers.answers.water !== undefined && (
            <ComparisonRow
              icon={<Droplets size={24} color="#4ECDC4" />}
              label={language === 'it' ? 'Contenuto acqua' : 'Water content'}
              userValue={quizAnswers.answers.water}
              realValue={quizAnswers.realValues.water}
              unit="%"
              color="#4ECDC4"
              language={language}
            />
          )}
          
          {quizAnswers.answers.co2 !== undefined && (
            <ComparisonRow
              icon={<Leaf size={24} color="#95E1A3" />}
              label={language === 'it' ? 'Impronta CO₂' : 'CO₂ footprint'}
              userValue={quizAnswers.answers.co2}
              realValue={quizAnswers.realValues.co2}
              unit="kg/kg"
              color="#95E1A3"
              language={language}
            />
          )}
          
          {quizAnswers.answers.waterFootprint !== undefined && (
            <ComparisonRow
              icon={<Droplets size={24} color={SWITCH_COLORS.darkBlue} />}
              label={language === 'it' ? 'Impronta idrica' : 'Water footprint'}
              userValue={quizAnswers.answers.waterFootprint}
              realValue={quizAnswers.realValues.waterFootprint}
              unit="L/kg"
              color={SWITCH_COLORS.darkBlue}
              language={language}
            />
          )}
        </div>
      )}

      {/* Messaggio se quiz saltato */}
      {quizAnswers?.skipped && (
        <div style={{
          background: '#fff3cd',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            {language === 'it' 
              ? '⚠️ Hai saltato il quiz. La prossima volta prova a stimare i valori!'
              : '⚠️ You skipped the quiz. Next time try to estimate the values!'}
          </p>
        </div>
      )}

      {/* Toggle per dati completi */}
      <button
        onClick={() => setShowFullResults(!showFullResults)}
        style={{
          width: '100%',
          padding: '12px',
          background: 'transparent',
          border: `2px solid ${SWITCH_COLORS.darkBlue}`,
          borderRadius: '12px',
          color: SWITCH_COLORS.darkBlue,
          cursor: 'pointer',
          fontWeight: '500',
          marginBottom: '20px'
        }}
      >
        {showFullResults 
          ? (language === 'it' ? '▲ Nascondi dettagli' : '▲ Hide details')
          : (language === 'it' ? '▼ Mostra tutti i dati' : '▼ Show all data')
        }
      </button>

      {/* Dati dettagliati (collapsible) */}
      {showFullResults && (
        <>
          {/* SCIO Value */}
          {results?.value !== undefined && (
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
            </div>
          )}

          {/* Nutritional Values */}
          {results && (
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
            </div>
          )}

          {/* Environmental Impact is now inside ProductCard */}

          {/* Product Card */}
          {recognizedProduct && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px', color: SWITCH_COLORS.darkBlue }}>🍅 {t('results.productCard')}</h3>
              <ProductCard 
                productName={recognizedProduct.name}
                measuredValue={results?.value}
                productImage={productImage}
                switchData={switchData}
              />
            </div>
          )}
        </>
      )}

      {/* Continue to Feedback */}
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
        ⭐ {t('results.continueToFeedback', 'Continua al Feedback')}
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
