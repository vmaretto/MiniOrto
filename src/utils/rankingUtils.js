// src/utils/rankingUtils.js - Algoritmo di ranking per MiniOrto

import { comparePerceptionVsReality } from './sugarUtils';

/**
 * Calcola il punteggio totale di un partecipante
 * 
 * Per MiniOrto (con quiz):
 * - Quiz Score (0-100): Precisione delle stime su nutrizione/sostenibilità
 * - Feedback Bonus: +5 punti se ha dato feedback dettagliato
 * 
 * Per Sugar Detective (legacy):
 * - Knowledge Score (0-100): Precisione delle stime
 * - Awareness Score (0-100): Consapevolezza dei propri errori
 */
export const calculateTotalScore = (participantData) => {
  // Check for MiniOrto quiz results (new format)
  const data = participantData.data?.data || participantData.data || participantData;
  const quizResults = data.quizResults;
  
  if (quizResults?.score) {
    // MiniOrto mode - use quiz score
    let totalScore = quizResults.score.total || 0;
    
    // Bonus for detailed feedback
    const feedback = data.feedback || {};
    if (feedback.comments && feedback.comments.length > 10) {
      totalScore += 5;
    }
    if (feedback.differenceExplanation && feedback.differenceExplanation.length > 10) {
      totalScore += 5;
    }
    
    // Cap at 100
    totalScore = Math.min(totalScore, 100);
    
    return {
      totalScore: parseFloat(totalScore.toFixed(1)),
      knowledgeScore: parseFloat((quizResults.score.total || 0).toFixed(1)),
      awarenessScore: 0, // Not used in MiniOrto
      quizBadge: quizResults.score.badge,
      isQuizBased: true
    };
  }
  
  // Legacy Sugar Detective mode
  // Calcolo punteggio stime (0-100)
  const knowledgeScore = calculateEstimatesScore(participantData);
  
  // Calcolo punteggio consapevolezza (0-100)
  const awarenessScore = calculateAwarenessScore(participantData);
  
  // Punteggio totale: 70% conoscenza + 30% consapevolezza
  const totalScore = (knowledgeScore * 0.7) + (awarenessScore * 0.3);
  
  return {
    totalScore: parseFloat(totalScore.toFixed(1)),
    knowledgeScore: parseFloat(knowledgeScore.toFixed(1)),
    awarenessScore: parseFloat(awarenessScore.toFixed(1)),
    isQuizBased: false
  };
};

/**
 * Estimates Score: Quanto precise sono le tue stime di dolcezza
 * Più sei vicino alla realtà, più punti ottieni
 */
export const calculateEstimatesScore = (participantData) => {
  const { part2_data, measurements, foods } = participantData;
  
  if (!part2_data || !measurements || !foods) return 0;
  
  // Handle both old and new data structures
  let part2;
  if (typeof part2_data === 'string') {
    part2 = JSON.parse(part2_data);
  } else if (part2_data.responses) {
    part2 = part2_data.responses;
  } else {
    part2 = part2_data;
  }
  
  const meas = typeof measurements === 'string' ? JSON.parse(measurements) : measurements;
  const foodsList = typeof foods === 'string' ? JSON.parse(foods) : foods;
  
  if (!Array.isArray(foodsList) || foodsList.length === 0) return 0;
  
  let totalError = 0;
  let count = 0;
  
  foodsList.forEach(food => {
    // Get perceived value - try different possible structures
    let perceived = part2[food.id] || part2[String(food.id)];
    
    // Get measured value
    const measured = meas[food.id]?.brix || meas[String(food.id)]?.brix;
    
    if (perceived && measured) {
      // Convert perceived (1-5 scale) to comparable scale with Brix
      // Assuming 1-5 maps roughly to 0-20 Brix
      const perceivedBrix = perceived * 4; // Simple mapping
      const realBrix = parseFloat(measured);
      
      // Calculate error as percentage difference
      const error = Math.abs(perceivedBrix - realBrix) / Math.max(realBrix, 1);
      totalError += error;
      count++;
    }
  });
  
  if (count === 0) return 0;
  
  const avgError = totalError / count;
  
  // Convert error to score: 0% error = 100, 100% error = 0
  const score = Math.max(0, Math.min(100, 100 * (1 - avgError)));
  
  return score;
};

/**
 * Awareness Score: Quanto sei consapevole dei tuoi errori
 * Basato sulle risposte della sezione "awareness"
 */
export const calculateAwarenessScore = (participantData) => {
  const { part4_awareness } = participantData;
  
  if (!part4_awareness) return 50; // Default medio
  
  const awareness = typeof part4_awareness === 'string' 
    ? JSON.parse(part4_awareness) 
    : part4_awareness;
  
  let score = 50; // Start from 50 (medium)
  
  // Surprised about vegetables containing sugar
  if (awareness.surprised === 'no') {
    score += 10; // Not surprised = more aware
  } else if (awareness.surprised === 'yes') {
    score -= 10; // Surprised = less aware
  }
  
  // Influence on food choices
  if (awareness.influence === 'very') {
    score += 15; // High influence = high awareness
  } else if (awareness.influence === 'partly') {
    score += 5;
  } else if (awareness.influence === 'little') {
    score -= 5;
  } else if (awareness.influence === 'not') {
    score -= 15; // No influence = low awareness
  }
  
  // Current knowledge self-assessment
  if (awareness.knowledge === 'very') {
    score += 15; // High self-assessed knowledge
  } else if (awareness.knowledge === 'enough') {
    score += 5;
  } else if (awareness.knowledge === 'little') {
    score -= 5;
  } else if (awareness.knowledge === 'nothing') {
    score -= 15; // No knowledge = low awareness
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Genera classifica ordinata di tutti i partecipanti
 */
export const generateRanking = (participants) => {
  const ranked = participants.map(participant => {
    // Handle nested data structure (data.data for MiniOrto)
    const rawData = participant.data || {};
    const data = rawData.data || rawData;
    
    // Pass the whole participant to calculateTotalScore (it handles both formats)
    const scores = calculateTotalScore(participant);
    
    // Get profile from correct location
    const profile = data.profile || rawData.profile || {};
    
    return {
      id: participant.id,
      timestamp: participant.timestamp,
      profile: profile,
      language: participant.language,
      data: participant.data,
      ...scores,
      participant
    };
  });
  
  // Sort by totalScore descending
  ranked.sort((a, b) => b.totalScore - a.totalScore);
  
  // Add rank position
  ranked.forEach((item, index) => {
    item.rank = index + 1;
  });
  
  return ranked;
};

/**
 * Trova la posizione di un partecipante specifico nella classifica
 */
export const findParticipantRank = (participantId, ranking) => {
  const participant = ranking.find(p => p.id === participantId);
  return participant ? participant.rank : null;
};

/**
 * Ottieni statistiche sulla classifica
 */
export const getRankingStats = (ranking) => {
  if (ranking.length === 0) {
    return {
      totalParticipants: 0,
      avgScore: 0,
      topScore: 0,
      bottomScore: 0
    };
  }
  
  const scores = ranking.map(p => p.totalScore);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  return {
    totalParticipants: ranking.length,
    avgScore: parseFloat(avgScore.toFixed(1)),
    topScore: Math.max(...scores),
    bottomScore: Math.min(...scores)
  };
};

export default {
  calculateTotalScore,
  calculateEstimatesScore,
  calculateAwarenessScore,
  generateRanking,
  findParticipantRank,
  getRankingStats
};
