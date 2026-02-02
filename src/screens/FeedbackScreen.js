// src/screens/FeedbackScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../utils/analytics';

function FeedbackScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState({
    foundDifferences: null, // yes/no/somewhat
    differenceExplanation: '',
    spectrometerUseful: null, // 1-5 scale
    overallRating: 0, // 1-5 stars
    comments: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ranking, setRanking] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStarClick = (rating) => {
    setFeedback(prev => ({ ...prev, overallRating: rating }));
  };

  const handleSubmit = async () => {
    if (feedback.overallRating === 0) {
      alert(t('feedback.pleaseRate'));
      return;
    }

    setSubmitting(true);
    
    try {
      // Track feedback submission
      trackEvent('feedback_submitted', {
        found_differences: feedback.foundDifferences,
        spectrometer_useful: feedback.spectrometerUseful,
        overall_rating: feedback.overallRating
      });

      // Gather all session data
      const results = JSON.parse(sessionStorage.getItem('scioResults') || '{}');
      const recognizedProduct = JSON.parse(sessionStorage.getItem('recognizedProduct') || '{}');
      const scanMethod = sessionStorage.getItem('scanMethod') || 'unknown';
      const profileData = JSON.parse(sessionStorage.getItem('profileData') || '{}');
      const quizResults = JSON.parse(sessionStorage.getItem('quizResults') || 'null');

      // Save complete participant data to API
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'complete_session',
          timestamp: new Date().toISOString(),
          language: localStorage.getItem('language') || 'it',
          data: {
            profile: profileData,
            product: recognizedProduct,
            scioResults: results,
            scanMethod: scanMethod,
            feedback: feedback,
            quizResults: quizResults
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Fetch ranking to show position
        try {
          const rankingResponse = await fetch('/api/participants');
          if (rankingResponse.ok) {
            const allParticipants = await rankingResponse.json();
            // Find user's position by their ID
            const userScore = quizResults?.score?.total || 0;
            const sortedByScore = allParticipants
              .map(p => {
                const d = p.data?.data || p.data || {};
                return {
                  id: p.id,
                  score: d.quizResults?.score?.total || 0
                };
              })
              .sort((a, b) => b.score - a.score);
            
            const position = sortedByScore.findIndex(p => p.id === result.id) + 1;
            setRanking({ position, total: allParticipants.length, score: userScore });
          }
        } catch (e) {
          console.error('Error fetching ranking:', e);
        }
        
        setSubmitted(true);
        // Clear session data after showing result
        setTimeout(() => {
          sessionStorage.clear();
          navigate('/');
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const language = localStorage.getItem('language') || 'it';
    return (
      <div className="screen">
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ color: '#4CAF50', marginBottom: '16px' }}>
            {t('feedback.thankYou')}
          </h2>
          
          {/* Show ranking position */}
          {ranking && ranking.position > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '20px',
              margin: '20px 0',
              color: 'white'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>
                {language === 'it' ? '🏆 La tua posizione in classifica' : '🏆 Your leaderboard position'}
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                #{ranking.position}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {language === 'it' 
                  ? `su ${ranking.total} partecipanti` 
                  : `out of ${ranking.total} participants`}
              </div>
              {ranking.score > 0 && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  display: 'inline-block'
                }}>
                  {ranking.score} {language === 'it' ? 'punti' : 'points'}
                </div>
              )}
            </div>
          )}
          
          <p style={{ color: '#666' }}>
            {t('feedback.thankYouMessage')}
          </p>
          
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {language === 'it' ? '📊 Vedi Classifica Completa' : '📊 View Full Leaderboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="card">
        <h2 style={{ marginBottom: '24px' }}>📝 {t('feedback.title')}</h2>

        {/* Question 1: Found differences? */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            {t('feedback.q1_differences')}
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['yes', 'somewhat', 'no'].map(option => (
              <button
                key={option}
                onClick={() => setFeedback(prev => ({ ...prev, foundDifferences: option }))}
                style={{
                  flex: 1,
                  minWidth: '80px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: feedback.foundDifferences === option ? '2px solid #4CAF50' : '2px solid #ddd',
                  background: feedback.foundDifferences === option ? '#e8f5e9' : '#fff',
                  color: feedback.foundDifferences === option ? '#2e7d32' : '#666',
                  cursor: 'pointer',
                  fontWeight: feedback.foundDifferences === option ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                {t(`feedback.option_${option}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: How do you explain differences? (conditional) */}
        {feedback.foundDifferences && feedback.foundDifferences !== 'no' && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              {t('feedback.q2_explanation')}
            </label>
            <textarea
              value={feedback.differenceExplanation}
              onChange={(e) => setFeedback(prev => ({ ...prev, differenceExplanation: e.target.value }))}
              placeholder={t('feedback.explanation_placeholder')}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                fontSize: '1rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* Question 3: Spectrometer useful? */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            {t('feedback.q3_spectrometer')}
          </label>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                onClick={() => setFeedback(prev => ({ ...prev, spectrometerUseful: value }))}
                style={{
                  flex: 1,
                  padding: '16px 8px',
                  borderRadius: '8px',
                  border: feedback.spectrometerUseful === value ? '2px solid #4CAF50' : '2px solid #ddd',
                  background: feedback.spectrometerUseful === value ? '#e8f5e9' : '#fff',
                  color: feedback.spectrometerUseful === value ? '#2e7d32' : '#666',
                  cursor: 'pointer',
                  fontWeight: feedback.spectrometerUseful === value ? 'bold' : 'normal',
                  fontSize: '1.1rem',
                  transition: 'all 0.2s'
                }}
              >
                {value}
              </button>
            ))}
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem', 
            color: '#999',
            marginTop: '8px',
            padding: '0 4px'
          }}>
            <span>{t('feedback.not_useful')}</span>
            <span>{t('feedback.very_useful')}</span>
          </div>
        </div>

        {/* Question 4: Overall rating with stars */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            {t('feedback.q4_rating')}
          </label>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center',
            padding: '16px 0'
          }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '2.5rem',
                  padding: '4px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                {star <= feedback.overallRating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* Question 5: Additional comments */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            {t('feedback.q5_comments')}
          </label>
          <textarea
            value={feedback.comments}
            onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
            placeholder={t('feedback.comments_placeholder')}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              fontSize: '1rem',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Submit button */}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.1rem',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? t('feedback.submitting') : t('feedback.submit')}
        </button>

        {/* Skip button */}
        <button
          onClick={() => {
            sessionStorage.clear();
            navigate('/');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '0.9rem',
            marginTop: '16px',
            width: '100%'
          }}
        >
          {t('feedback.skip')}
        </button>
      </div>
    </div>
  );
}

export default FeedbackScreen;
