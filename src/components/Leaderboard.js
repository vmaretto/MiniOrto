// src/components/Leaderboard.js
import React, { useState } from 'react';
import { Trophy, Medal, Award, ChevronDown, ChevronUp, User, Leaf, BarChart2, MessageSquare } from 'lucide-react';

const Leaderboard = ({ ranking, language = 'it' }) => {
  const [expandedId, setExpandedId] = useState(null);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} color="#FFD700" />;
    if (rank === 2) return <Medal size={24} color="#C0C0C0" />;
    if (rank === 3) return <Medal size={24} color="#CD7F32" />;
    return <Award size={20} color="#9ca3af" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#9ca3af';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getParticipantData = (participant) => {
    // Handle nested data structure
    const rawData = participant.participant?.data || participant.data || {};
    return rawData.data || rawData;
  };

  const getProfile = (participant) => {
    const data = getParticipantData(participant);
    if (typeof data.profile === 'string') {
      return JSON.parse(data.profile);
    }
    return data.profile || participant.profile || {};
  };

  const getDisplayName = (participant) => {
    const data = getParticipantData(participant);
    if (data.nickname && data.nickname.trim()) {
      return data.nickname.trim();
    }
    return `${language === 'it' ? 'Partecipante' : 'Participant'} #${participant.id}`;
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const DetailSection = ({ icon, title, children }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '8px',
        color: '#667eea',
        fontWeight: '600'
      }}>
        {icon}
        <span>{title}</span>
      </div>
      <div style={{ 
        background: '#f9fafb', 
        borderRadius: '8px', 
        padding: '12px',
        fontSize: '0.9rem'
      }}>
        {children}
      </div>
    </div>
  );

  const DataRow = ({ label, value }) => (
    value ? (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ color: '#6b7280' }}>{label}</span>
        <span style={{ fontWeight: '500' }}>{value}</span>
      </div>
    ) : null
  );

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Trophy size={32} color="#667eea" />
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: '#667eea',
          margin: 0
        }}>
          {language === 'it' ? 'Classifica Generale' : 'Leaderboard'}
        </h2>
      </div>

      {ranking.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
          {language === 'it' 
            ? 'Nessun partecipante ancora. Sii il primo!'
            : 'No participants yet. Be the first!'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ranking.map((participant, index) => {
            const profile = getProfile(participant);
            const displayName = getDisplayName(participant);
            const data = getParticipantData(participant);
            const isExpanded = expandedId === participant.id;
            
            return (
              <div key={participant.id}>
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(participant.id)}
                  style={{
                    padding: '1.5rem',
                    background: index < 3 
                      ? `linear-gradient(135deg, ${getRankColor(participant.rank)}15 0%, ${getRankColor(participant.rank)}05 100%)`
                      : '#f9fafb',
                    border: index < 3 ? `2px solid ${getRankColor(participant.rank)}` : '2px solid #e5e7eb',
                    borderRadius: isExpanded ? '15px 15px 0 0' : '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    minWidth: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {getRankIcon(participant.rank)}
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: getRankColor(participant.rank)
                    }}>
                      #{participant.rank}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem'
                    }}>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {displayName}
                      </div>
                      {/* Score - always visible */}
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: '#667eea',
                        background: '#667eea15',
                        padding: '4px 12px',
                        borderRadius: '20px'
                      }}>
                        {participant.totalScore} <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>{language === 'it' ? 'pt' : 'pts'}</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {profile.age && `${profile.age} ${language === 'it' ? 'anni' : 'years old'}`}
                      {profile.profession && ` • ${profile.profession}`}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '0.25rem'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                      }}>
                        {formatDate(participant.timestamp)}
                      </span>
                      {participant.quizBadge && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: `${participant.quizBadge.color}20`,
                          color: participant.quizBadge.color,
                          fontWeight: '500'
                        }}>
                          {participant.quizBadge.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div style={{ marginLeft: '8px' }}>
                    {isExpanded ? <ChevronUp size={24} color="#667eea" /> : <ChevronDown size={24} color="#9ca3af" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    padding: '1.5rem',
                    background: '#fff',
                    border: '2px solid #e5e7eb',
                    borderTop: 'none',
                    borderRadius: '0 0 15px 15px'
                  }}>
                    {/* Profile */}
                    <DetailSection icon={<User size={18} />} title={language === 'it' ? 'Profilo' : 'Profile'}>
                      <DataRow label={language === 'it' ? 'Età' : 'Age'} value={profile.age} />
                      <DataRow label={language === 'it' ? 'Genere' : 'Gender'} value={profile.gender} />
                      <DataRow label={language === 'it' ? 'Professione' : 'Profession'} value={profile.profession} />
                      <DataRow label={language === 'it' ? 'Consumo F&V' : 'F&V Consumption'} value={profile.consumption} />
                      <DataRow label={language === 'it' ? 'Canale acquisto' : 'Purchase Channel'} value={profile.purchaseChannel} />
                      <DataRow label={language === 'it' ? 'Sostenibilità' : 'Sustainability'} value={profile.sustainability} />
                      <DataRow label={language === 'it' ? 'Lettura etichette' : 'Label Reading'} value={profile.labelReading} />
                    </DetailSection>

                    {/* Product */}
                    {data.product && (
                      <DetailSection icon={<Leaf size={18} />} title={language === 'it' ? 'Prodotto Analizzato' : 'Analyzed Product'}>
                        <DataRow label={language === 'it' ? 'Nome' : 'Name'} value={data.product.name} />
                        <DataRow label={language === 'it' ? 'Categoria' : 'Category'} value={data.product.category} />
                        <DataRow label="Emoji" value={data.product.emoji} />
                        <DataRow label={language === 'it' ? 'Confidenza' : 'Confidence'} value={data.product.confidence} />
                      </DetailSection>
                    )}

                    {/* SCIO Results */}
                    {data.scioResults && (
                      <DetailSection icon={<BarChart2 size={18} />} title={language === 'it' ? 'Risultati SCIO' : 'SCIO Results'}>
                        <DataRow label="Brix" value={data.scioResults.brix} />
                        <DataRow label={language === 'it' ? 'Calorie' : 'Calories'} value={data.scioResults.calories ? `${data.scioResults.calories} kcal` : null} />
                        <DataRow label={language === 'it' ? 'Carboidrati' : 'Carbs'} value={data.scioResults.carbs ? `${data.scioResults.carbs}g` : null} />
                        <DataRow label={language === 'it' ? 'Zuccheri' : 'Sugar'} value={data.scioResults.sugar ? `${data.scioResults.sugar}g` : null} />
                        <DataRow label={language === 'it' ? 'Acqua' : 'Water'} value={data.scioResults.water ? `${data.scioResults.water}%` : null} />
                        <DataRow label={language === 'it' ? 'Proteine' : 'Protein'} value={data.scioResults.protein ? `${data.scioResults.protein}g` : null} />
                        <DataRow label={language === 'it' ? 'Fibre' : 'Fiber'} value={data.scioResults.fiber ? `${data.scioResults.fiber}g` : null} />
                        <DataRow label={language === 'it' ? 'Metodo' : 'Method'} value={data.scanMethod} />
                      </DetailSection>
                    )}

                    {/* Feedback */}
                    {data.feedback && (
                      <DetailSection icon={<MessageSquare size={18} />} title="Feedback">
                        <DataRow label={language === 'it' ? 'Differenze trovate' : 'Found Differences'} value={data.feedback.foundDifferences} />
                        <DataRow label={language === 'it' ? 'Spiegazione' : 'Explanation'} value={data.feedback.differenceExplanation} />
                        <DataRow label={language === 'it' ? 'Utilità spettrometro' : 'Spectrometer Useful'} value={data.feedback.spectrometerUseful ? `${data.feedback.spectrometerUseful}/5` : null} />
                        <DataRow label={language === 'it' ? 'Rating' : 'Rating'} value={data.feedback.overallRating ? `${'⭐'.repeat(data.feedback.overallRating)}` : null} />
                        {data.feedback.comments && (
                          <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#4b5563' }}>
                            "{data.feedback.comments}"
                          </div>
                        )}
                      </DetailSection>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {ranking.length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f3f4f6',
          borderRadius: '15px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {language === 'it' ? 'Partecipanti' : 'Participants'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
              {ranking.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {language === 'it' ? 'Punteggio Medio' : 'Avg Score'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
              {(ranking.reduce((sum, p) => sum + p.totalScore, 0) / ranking.length).toFixed(1)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {language === 'it' ? 'Top Score' : 'Top Score'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              {ranking[0].totalScore}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
