// src/screens/QuizScreen.js - Quiz standalone sulla conoscenza del prodotto
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, Droplets, Flame, Leaf, ChevronRight, Info } from 'lucide-react';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';
import GlobalProgress from '../components/GlobalProgress';

// Dati SWITCH per prodotti comuni (fallback se API non disponibile)
const SWITCH_FALLBACK_DATA = {
  'pomodoro': { calories: 18, water: 94.5, co2: 0.7, waterFootprint: 214 },
  'tomato': { calories: 18, water: 94.5, co2: 0.7, waterFootprint: 214 },
  'mela': { calories: 52, water: 85.6, co2: 0.4, waterFootprint: 822 },
  'apple': { calories: 52, water: 85.6, co2: 0.4, waterFootprint: 822 },
  'arancia': { calories: 47, water: 86.8, co2: 0.5, waterFootprint: 560 },
  'orange': { calories: 47, water: 86.8, co2: 0.5, waterFootprint: 560 },
  'banana': { calories: 89, water: 74.9, co2: 0.9, waterFootprint: 790 },
  'fragola': { calories: 32, water: 91.0, co2: 0.4, waterFootprint: 276 },
  'strawberry': { calories: 32, water: 91.0, co2: 0.4, waterFootprint: 276 },
  'uva': { calories: 69, water: 80.5, co2: 0.5, waterFootprint: 608 },
  'grape': { calories: 69, water: 80.5, co2: 0.5, waterFootprint: 608 },
  'carota': { calories: 41, water: 88.3, co2: 0.3, waterFootprint: 195 },
  'carrot': { calories: 41, water: 88.3, co2: 0.3, waterFootprint: 195 },
  'zucchina': { calories: 17, water: 94.8, co2: 0.4, waterFootprint: 353 },
  'zucchini': { calories: 17, water: 94.8, co2: 0.4, waterFootprint: 353 },
  'peperone': { calories: 31, water: 92.2, co2: 0.5, waterFootprint: 379 },
  'pepper': { calories: 31, water: 92.2, co2: 0.5, waterFootprint: 379 },
  'lattuga': { calories: 15, water: 94.6, co2: 0.3, waterFootprint: 237 },
  'lettuce': { calories: 15, water: 94.6, co2: 0.3, waterFootprint: 237 },
  'avocado': { calories: 160, water: 73.2, co2: 2.5, waterFootprint: 1981 },
  'anguria': { calories: 30, water: 91.5, co2: 0.2, waterFootprint: 235 },
  'watermelon': { calories: 30, water: 91.5, co2: 0.2, waterFootprint: 235 },
  'default': { calories: 35, water: 85, co2: 0.5, waterFootprint: 400 }
};

export default function QuizScreen() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'it';
  
  const [product, setProduct] = useState(null);
  const [switchData, setSwitchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(-1); // Show intro screen first
  const [answers, setAnswers] = useState({});

  // Carica prodotto e dati SWITCH
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const storedProduct = sessionStorage.getItem('recognizedProduct');
    if (!storedProduct) {
      navigate('/recognize');
      return;
    }
    
    const productData = JSON.parse(storedProduct);
    setProduct(productData);
    
    // Fetch SWITCH data
    const fetchSwitchData = async () => {
      try {
        const searchTerm = productData.nameEn || productData.name;
        const response = await fetch('/api/switch-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nameEn: searchTerm })
        });
        
        if (response.ok) {
          const data = await response.json();
          setSwitchData(data);
        } else {
          // Usa fallback
          const key = (productData.name || '').toLowerCase();
          setSwitchData({ nutrition: SWITCH_FALLBACK_DATA[key] || SWITCH_FALLBACK_DATA.default });
        }
      } catch (error) {
        console.error('Error fetching SWITCH data:', error);
        const key = (productData.name || '').toLowerCase();
        setSwitchData({ nutrition: SWITCH_FALLBACK_DATA[key] || SWITCH_FALLBACK_DATA.default });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSwitchData();
  }, [navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestion]);

  if (loading || !product) {
    return (
      <SwitchLayout 
        title={language === 'it' ? 'Preparando il quiz...' : 'Preparing quiz...'}
        subtitle={language === 'it' ? 'Caricamento dati prodotto' : 'Loading product data'}
      >
        <GlobalProgress currentStep="quiz" language={language} />
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

  // Valori reali dal database SWITCH
  const getRealValues = () => {
    const nutrition = switchData?.nutrition || {};
    const environmental = switchData?.environmental || {};
    
    // Usa fallback se non ci sono dati
    const productKey = (product.name || '').toLowerCase();
    const fallback = SWITCH_FALLBACK_DATA[productKey] || SWITCH_FALLBACK_DATA.default;
    
    return {
      calories: nutrition.calories || nutrition.energy || fallback.calories,
      water: nutrition.water || fallback.water,
      co2: environmental.co2 || environmental.carbonFootprint || fallback.co2,
      waterFootprint: environmental.water || environmental.waterUsage || fallback.waterFootprint
    };
  };

  const realValues = getRealValues();

  const questions = [
    {
      id: 'calories',
      icon: <Flame size={32} color="#FF6B6B" />,
      question: language === 'it' 
        ? `Quante calorie pensi che contenga 100g di ${product.name}?`
        : `How many calories do you think 100g of ${product.name} contains?`,
      unit: 'kcal/100g',
      min: 5,
      max: 150,
      step: 5,
      default: 40,
      realValue: realValues.calories,
      color: '#FF6B6B'
    },
    {
      id: 'water',
      icon: <Droplets size={32} color="#4ECDC4" />,
      question: language === 'it'
        ? `Quale percentuale di acqua contiene ${product.name}?`
        : `What percentage of water does ${product.name} contain?`,
      unit: '%',
      min: 50,
      max: 98,
      step: 2,
      default: 80,
      realValue: realValues.water,
      color: '#4ECDC4'
    },
    {
      id: 'co2',
      icon: <Leaf size={32} color="#95E1A3" />,
      question: language === 'it'
        ? `Quanta CO₂ viene emessa per produrre 1kg di ${product.name}?`
        : `How much CO₂ is emitted to produce 1kg of ${product.name}?`,
      unit: 'kg CO₂/kg',
      min: 0.1,
      max: 3.0,
      step: 0.1,
      default: 0.5,
      realValue: realValues.co2,
      color: '#95E1A3'
    },
    {
      id: 'waterFootprint',
      icon: <Droplets size={32} color={SWITCH_COLORS.darkBlue} />,
      question: language === 'it'
        ? `Quanti litri d'acqua servono per produrre 1kg di ${product.name}?`
        : `How many liters of water are needed to produce 1kg of ${product.name}?`,
      unit: 'L/kg',
      min: 50,
      max: 2000,
      step: 50,
      default: 300,
      realValue: realValues.waterFootprint,
      color: SWITCH_COLORS.darkBlue
    }
  ];

  const currentQ = currentQuestion >= 0 ? questions[currentQuestion] : null;

  const handleAnswer = (value) => {
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: parseFloat(value)
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz completato, salva e vai a scan-flow
      const quizData = {
        answers: { ...answers, [currentQ.id]: answers[currentQ.id] || currentQ.default },
        realValues,
        productName: product.name,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('quizAnswers', JSON.stringify(quizData));
      navigate('/scan-flow');
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('quizAnswers', JSON.stringify({
      answers: {},
      skipped: true,
      realValues,
      productName: product.name,
      timestamp: new Date().toISOString()
    }));
    navigate('/scan-flow');
  };

  // Intro screen
  if (currentQuestion === -1) {
    return (
      <SwitchLayout
        title={language === 'it' ? '🧠 Quiz Conoscenza' : '🧠 Knowledge Quiz'}
        subtitle={`${product.emoji || '🥬'} ${product.name}`}
      >
        <GlobalProgress currentStep="quiz" language={language} />

        <div style={{
          background: `linear-gradient(135deg, ${SWITCH_COLORS.gold}20 0%, ${SWITCH_COLORS.gold}10 100%)`,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{product.emoji || '🥬'}</div>
          <p style={{ color: '#666', margin: 0 }}>
            {language === 'it' 
              ? 'Prima di scansionare, metti alla prova le tue conoscenze!'
              : 'Before scanning, test your knowledge!'}
          </p>
        </div>

        <h3 style={{ color: SWITCH_COLORS.darkBlue, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={20} />
          {language === 'it' ? 'Come funziona' : 'How it works'}
        </h3>

        <div style={{ 
          padding: '16px', 
          background: SWITCH_COLORS.lightBg, 
          borderRadius: '12px',
          marginBottom: '24px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 12px 0' }}>
            {language === 'it' 
              ? 'Ti chiederemo di stimare 4 valori per questo prodotto:'
              : 'We\'ll ask you to estimate 4 values for this product:'}
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li>🔥 {language === 'it' ? 'Calorie' : 'Calories'}</li>
            <li>💧 {language === 'it' ? 'Contenuto acqua' : 'Water content'}</li>
            <li>🌱 {language === 'it' ? 'Impronta CO₂' : 'CO₂ footprint'}</li>
            <li>💦 {language === 'it' ? 'Impronta idrica' : 'Water footprint'}</li>
          </ul>
          <p style={{ margin: '12px 0 0 0', fontWeight: '500', color: SWITCH_COLORS.darkBlue }}>
            {language === 'it' 
              ? '→ Dopo lo scan SCIO confronteremo le tue stime con i dati reali!'
              : '→ After SCIO scan we\'ll compare your estimates with real data!'}
          </p>
        </div>

        <button
          onClick={() => setCurrentQuestion(0)}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            background: SWITCH_COLORS.green,
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 4px 15px ${SWITCH_COLORS.green}50`
          }}
        >
          {language === 'it' ? 'Inizia il Quiz' : 'Start Quiz'}
          <ChevronRight size={20} />
        </button>

        <button
          onClick={handleSkip}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '12px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {language === 'it' ? 'Salta il quiz' : 'Skip quiz'}
        </button>
      </SwitchLayout>
    );
  }

  // Quiz questions screen
  return (
    <SwitchLayout
      title={`${language === 'it' ? 'Domanda' : 'Question'} ${currentQuestion + 1}/${questions.length}`}
      subtitle={`${product.emoji || '🥬'} ${product.name}`}
      compact={true}
    >
      <GlobalProgress currentStep="quiz" language={language} />

      {/* Progress */}
      <div style={{
        height: '6px',
        background: '#e0e0e0',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <div style={{
          height: '100%',
          width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          background: SWITCH_COLORS.gold,
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `${currentQ.color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px'
      }}>
        {currentQ.icon}
      </div>

      {/* Question */}
      <h2 style={{
        fontSize: '1.2rem',
        color: SWITCH_COLORS.darkBlue,
        marginBottom: '32px',
        lineHeight: 1.4,
        textAlign: 'center'
      }}>
        {currentQ.question}
      </h2>

      {/* Slider */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: currentQ.color,
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          {answers[currentQ.id] !== undefined ? answers[currentQ.id] : currentQ.default}
          <span style={{ fontSize: '1.2rem', fontWeight: 'normal', color: '#666' }}>
            {' '}{currentQ.unit}
          </span>
        </div>
        
        <input
          type="range"
          min={currentQ.min}
          max={currentQ.max}
          step={currentQ.step}
          value={answers[currentQ.id] !== undefined ? answers[currentQ.id] : currentQ.default}
          onChange={(e) => handleAnswer(e.target.value)}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: `linear-gradient(to right, ${currentQ.color} 0%, ${currentQ.color}40 100%)`,
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none'
          }}
        />
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: '#999',
          fontSize: '0.85rem',
          marginTop: '8px'
        }}>
          <span>{currentQ.min}</span>
          <span>{currentQ.max}</span>
        </div>
      </div>

      {/* Hint */}
      <p style={{
        color: '#888',
        fontSize: '0.9rem',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <Brain size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
        {language === 'it' 
          ? 'Usa la tua intuizione! Non preoccuparti se non sei sicuro.'
          : "Use your intuition! Don't worry if you're not sure."}
      </p>

      {/* Next Button */}
      <button
        onClick={handleNext}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: 'white',
          background: currentQ.color,
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {currentQuestion < questions.length - 1 
          ? (language === 'it' ? 'Prossima domanda' : 'Next question')
          : (language === 'it' ? 'Vai alla scansione' : 'Go to scan')
        }
        <ChevronRight size={20} />
      </button>

      {/* Skip option */}
      <button
        onClick={handleSkip}
        style={{
          marginTop: '16px',
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          fontSize: '0.9rem',
          textDecoration: 'underline'
        }}
      >
        {language === 'it' ? 'Salta il quiz' : 'Skip quiz'}
      </button>
    </SwitchLayout>
  );
}
