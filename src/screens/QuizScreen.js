// src/screens/QuizScreen.js - Quiz sulla conoscenza del prodotto
import React, { useState } from 'react';
import { Brain, Droplets, Flame, Leaf, ChevronRight, Trophy, Target, Zap, Info } from 'lucide-react';

// SWITCH brand colors
const COLORS = {
  gold: '#FFC300',
  darkBlue: '#1E3A5F',
  green: '#28A745',
  lightBg: '#F8F9FA'
};

const QuizScreen = ({ product, switchData, onComplete, language = 'it' }) => {
  const [currentQuestion, setCurrentQuestion] = useState(-1); // -1 = intro screen
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(null);

  // Get real values from SWITCH data
  const getRealValues = () => {
    const nutrition = switchData?.nutrition || {};
    const environmental = switchData?.environmental || {};
    
    return {
      calories: nutrition.calories || nutrition.energy || 30,
      water: nutrition.water || 85,
      co2: environmental.co2 || environmental.carbonFootprint || 0.5,
      waterFootprint: environmental.water || environmental.waterUsage || 50
    };
  };

  const realValues = getRealValues();

  // Quiz questions
  const questions = [
    {
      id: 'calories',
      icon: <Flame size={32} color="#FF6B6B" />,
      question: language === 'it' 
        ? `Quante calorie pensi che contenga 100g di ${product.name}?`
        : `How many calories do you think 100g of ${product.name} contains?`,
      unit: 'kcal/100g',
      min: 5,
      max: 100,
      step: 5,
      default: 30,
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
      icon: <Droplets size={32} color="#667eea" />,
      question: language === 'it'
        ? `Quanti litri d'acqua servono per produrre 1kg di ${product.name}?`
        : `How many liters of water are needed to produce 1kg of ${product.name}?`,
      unit: 'L/kg',
      min: 10,
      max: 500,
      step: 10,
      default: 100,
      realValue: realValues.waterFootprint,
      color: '#667eea'
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

  const calculateScore = () => {
    let totalScore = 0;
    let details = [];

    questions.forEach(q => {
      const userAnswer = answers[q.id] || q.default;
      const realValue = q.realValue;
      
      // Calculate percentage error
      const percentError = Math.abs((userAnswer - realValue) / realValue) * 100;
      
      // Score: 100 points for exact, decreasing with error
      // Within 10% = 90-100 points
      // Within 25% = 70-90 points
      // Within 50% = 40-70 points
      // More than 50% = 0-40 points
      let questionScore;
      if (percentError <= 10) {
        questionScore = 90 + (10 - percentError);
      } else if (percentError <= 25) {
        questionScore = 70 + ((25 - percentError) / 15) * 20;
      } else if (percentError <= 50) {
        questionScore = 40 + ((50 - percentError) / 25) * 30;
      } else {
        questionScore = Math.max(0, 40 - (percentError - 50) * 0.4);
      }

      questionScore = Math.round(questionScore);
      totalScore += questionScore;

      details.push({
        id: q.id,
        question: q.question,
        userAnswer,
        realValue,
        unit: q.unit,
        percentError: Math.round(percentError),
        score: questionScore,
        icon: q.icon,
        color: q.color
      });
    });

    return {
      total: Math.round(totalScore / questions.length),
      maxPossible: 100,
      details,
      badge: getBadge(totalScore / questions.length)
    };
  };

  const getBadge = (avgScore) => {
    if (avgScore >= 90) return { name: language === 'it' ? '🏆 Esperto Assoluto' : '🏆 Absolute Expert', color: '#FFD700' };
    if (avgScore >= 75) return { name: language === 'it' ? '🥇 Grande Conoscitore' : '🥇 Great Connoisseur', color: '#C0C0C0' };
    if (avgScore >= 60) return { name: language === 'it' ? '🥈 Buon Osservatore' : '🥈 Good Observer', color: '#CD7F32' };
    if (avgScore >= 40) return { name: language === 'it' ? '🌱 In Crescita' : '🌱 Growing', color: '#95E1A3' };
    return { name: language === 'it' ? '🔍 Curioso' : '🔍 Curious', color: '#667eea' };
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate final score
      const finalScore = calculateScore();
      setScore(finalScore);
      setShowResult(true);
    }
  };

  const handleComplete = () => {
    onComplete({
      answers,
      score,
      timestamp: new Date().toISOString()
    });
  };

  // Result screen
  if (showResult && score) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${COLORS.gold} 0%, ${COLORS.gold} 30%, white 30%)`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          color: COLORS.darkBlue,
          marginBottom: '24px',
          paddingTop: '10px'
        }}>
          <Trophy size={48} style={{ marginBottom: '12px', color: COLORS.darkBlue }} />
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', color: COLORS.darkBlue }}>
            {language === 'it' ? 'Risultati Quiz' : 'Quiz Results'}
          </h1>
          <p style={{ opacity: 0.9, color: COLORS.darkBlue }}>
            {product.emoji} {product.name}
          </p>
        </div>

        {/* Score Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          marginBottom: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          {/* Total Score */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
            padding: '20px',
            background: `linear-gradient(135deg, ${score.badge.color}20 0%, ${score.badge.color}10 100%)`,
            borderRadius: '16px'
          }}>
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#667eea',
              lineHeight: 1
            }}>
              {score.total}
            </div>
            <div style={{ color: '#666', marginBottom: '8px' }}>
              {language === 'it' ? 'punti su 100' : 'points out of 100'}
            </div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: score.badge.color
            }}>
              {score.badge.name}
            </div>
          </div>

          {/* Details */}
          <h3 style={{ 
            color: '#333', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Target size={20} />
            {language === 'it' ? 'Dettaglio risposte' : 'Answer Details'}
          </h3>

          {score.details.map((detail, idx) => (
            <div key={detail.id} style={{
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '12px',
              marginBottom: '12px',
              borderLeft: `4px solid ${detail.color}`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px'
              }}>
                {detail.icon}
                <span style={{ fontWeight: '600', color: '#333' }}>
                  {detail.id === 'calories' && (language === 'it' ? 'Calorie' : 'Calories')}
                  {detail.id === 'water' && (language === 'it' ? 'Contenuto acqua' : 'Water Content')}
                  {detail.id === 'co2' && (language === 'it' ? 'Impronta CO₂' : 'CO₂ Footprint')}
                  {detail.id === 'waterFootprint' && (language === 'it' ? 'Impronta idrica' : 'Water Footprint')}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: detail.score >= 70 ? '#d4edda' : detail.score >= 40 ? '#fff3cd' : '#f8d7da',
                  color: detail.score >= 70 ? '#155724' : detail.score >= 40 ? '#856404' : '#721c24',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  {detail.score} pt
                </span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.9rem'
              }}>
                <div>
                  <span style={{ color: '#666' }}>
                    {language === 'it' ? 'Tua stima: ' : 'Your estimate: '}
                  </span>
                  <strong>{detail.userAnswer} {detail.unit}</strong>
                </div>
                <div>
                  <span style={{ color: '#666' }}>
                    {language === 'it' ? 'Valore reale: ' : 'Real value: '}
                  </span>
                  <strong style={{ color: detail.color }}>{detail.realValue} {detail.unit}</strong>
                </div>
              </div>
              
              {detail.percentError <= 15 && (
                <div style={{
                  marginTop: '8px',
                  color: '#28a745',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Zap size={14} />
                  {language === 'it' ? 'Ottima stima!' : 'Great estimate!'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleComplete}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '18px',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          {language === 'it' ? 'Vedi scheda prodotto' : 'View Product Details'}
          <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // Intro screen explaining scoring
  if (currentQuestion === -1) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${COLORS.gold} 0%, ${COLORS.gold} 35%, white 35%)`,
        padding: '0'
      }}>
        <div style={{ background: COLORS.gold, padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧠</div>
          <h1 style={{ color: COLORS.darkBlue, fontSize: '1.8rem', marginBottom: '8px' }}>
            {language === 'it' ? 'Quiz Conoscenza' : 'Knowledge Quiz'}
          </h1>
          <p style={{ color: COLORS.darkBlue, opacity: 0.8 }}>
            {product.emoji} {product.name}
          </p>
        </div>

        <div style={{
          margin: '-20px 16px 20px',
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: COLORS.darkBlue, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} />
            {language === 'it' ? 'Come funziona il punteggio' : 'How scoring works'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', background: '#d4edda', borderRadius: '10px', borderLeft: '4px solid #28a745' }}>
              <strong style={{ color: '#155724' }}>90-100 {language === 'it' ? 'punti' : 'points'}</strong>
              <div style={{ fontSize: '0.85rem', color: '#155724' }}>
                {language === 'it' ? 'Stima entro il 10% del valore reale' : 'Estimate within 10% of real value'}
              </div>
            </div>
            <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '10px', borderLeft: '4px solid #ffc107' }}>
              <strong style={{ color: '#856404' }}>70-89 {language === 'it' ? 'punti' : 'points'}</strong>
              <div style={{ fontSize: '0.85rem', color: '#856404' }}>
                {language === 'it' ? 'Stima entro il 25% del valore reale' : 'Estimate within 25% of real value'}
              </div>
            </div>
            <div style={{ padding: '12px', background: '#f8d7da', borderRadius: '10px', borderLeft: '4px solid #dc3545' }}>
              <strong style={{ color: '#721c24' }}>40-69 {language === 'it' ? 'punti' : 'points'}</strong>
              <div style={{ fontSize: '0.85rem', color: '#721c24' }}>
                {language === 'it' ? 'Stima entro il 50% del valore reale' : 'Estimate within 50% of real value'}
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '16px', 
            background: COLORS.lightBg, 
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            <strong>{language === 'it' ? '4 domande:' : '4 questions:'}</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>🔥 {language === 'it' ? 'Calorie' : 'Calories'}</li>
              <li>💧 {language === 'it' ? 'Contenuto acqua' : 'Water content'}</li>
              <li>🌱 {language === 'it' ? 'Impronta CO₂' : 'CO₂ footprint'}</li>
              <li>💦 {language === 'it' ? 'Impronta idrica' : 'Water footprint'}</li>
            </ul>
          </div>

          <button
            onClick={() => setCurrentQuestion(0)}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'white',
              background: COLORS.green,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {language === 'it' ? 'Inizia il Quiz' : 'Start Quiz'}
            <ChevronRight size={20} />
          </button>

          <button
            onClick={() => onComplete(null)}
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
        </div>
      </div>
    );
  }

  // Quiz questions screen
  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${COLORS.darkBlue} 0%, ${COLORS.darkBlue} 40%, ${COLORS.lightBg} 40%)`,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Progress */}
      <div style={{
        width: '100%',
        maxWidth: '500px',
        marginBottom: '20px',
        margin: '0 auto 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'white',
          marginBottom: '8px',
          fontSize: '0.9rem'
        }}>
          <span>{language === 'it' ? 'Domanda' : 'Question'} {currentQuestion + 1}/{questions.length}</span>
          <span>{product.emoji} {product.name}</span>
        </div>
        <div style={{
          height: '6px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            background: 'white',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Question Card */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
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
          fontSize: '1.3rem',
          color: '#333',
          marginBottom: '32px',
          lineHeight: 1.4
        }}>
          {currentQ.question}
        </h2>

        {/* Slider */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: currentQ.color,
            marginBottom: '8px'
          }}>
            {answers[currentQ.id] || currentQ.default}
            <span style={{ fontSize: '1.2rem', fontWeight: 'normal', color: '#666' }}>
              {' '}{currentQ.unit}
            </span>
          </div>
          
          <input
            type="range"
            min={currentQ.min}
            max={currentQ.max}
            step={currentQ.step}
            value={answers[currentQ.id] || currentQ.default}
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
          marginBottom: '24px'
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
            : (language === 'it' ? 'Vedi risultati' : 'See results')
          }
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Skip option */}
      <button
        onClick={handleComplete}
        style={{
          marginTop: '20px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          textDecoration: 'underline'
        }}
      >
        {language === 'it' ? 'Salta il quiz' : 'Skip quiz'}
      </button>
    </div>
  );
};

export default QuizScreen;
