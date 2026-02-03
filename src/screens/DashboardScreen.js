// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Download, RefreshCw, Trophy, Brain, BarChart3, Trash2 } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import InsightsTab from '../components/InsightsTab';
import StatsTab from '../components/StatsTab';
import { generateRanking } from '../utils/rankingUtils';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';

const DashboardScreen = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'it';
  
  const [participants, setParticipants] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (participants.length > 0) {
      calculateStats();
    }
  }, [participants]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/participants');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setParticipants(data);
      
      const rankedData = generateRanking(data);
      setRanking(rankedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    const genders = { 'M': 0, 'F': 0, 'Other': 0 };
    const professionGroups = {
      'student': 0, 'employee': 0, 'entrepreneur': 0, 'healthcare': 0,
      'teacher': 0, 'retired': 0, 'other': 0
    };
    const consumptionHabits = { 'daily': 0, 'weekly': 0, 'rarely': 0 };

    let totalKnowledgeScore = 0;
    let totalAwarenessScore = 0;
    let scoreCount = 0;

    const timeOfDay = { 'morning': [], 'afternoon': [], 'evening': [], 'night': [] };
    const dayOfWeek = {
      'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [],
      'Friday': [], 'Saturday': [], 'Sunday': []
    };

    participants.forEach(p => {
      const data = p.data || {};
      const timestamp = new Date(p.timestamp);
      
      if (data.profile) {
        const { age, gender, profession, consumption } = data.profile;
        
        const ageNum = parseInt(age);
        if (ageNum < 25) ageGroups['18-24']++;
        else if (ageNum < 35) ageGroups['25-34']++;
        else if (ageNum < 45) ageGroups['35-44']++;
        else if (ageNum < 55) ageGroups['45-54']++;
        else ageGroups['55+']++;
        
        if (gender) {
          genders[gender] = (genders[gender] || 0) + 1;
        }
        
        if (profession) {
          if (profession === 'consultant') professionGroups['employee']++;
          else if (profession === 'researcher') professionGroups['healthcare']++;
          else if (profession === 'homemaker') professionGroups['other']++;
          else if (professionGroups[profession] !== undefined) professionGroups[profession]++;
          else professionGroups['other']++;
        }
        
        if (consumption && consumptionHabits[consumption] !== undefined) {
          consumptionHabits[consumption]++;
        }
      }

      const hour = timestamp.getHours();
      let timeSlot;
      if (hour >= 6 && hour < 12) timeSlot = 'morning';
      else if (hour >= 12 && hour < 18) timeSlot = 'afternoon';
      else if (hour >= 18 && hour < 24) timeSlot = 'evening';
      else timeSlot = 'night';
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[timestamp.getDay()];
      
      const participantRanking = ranking.find(r => r.id === p.id);
      if (participantRanking) {
        if (participantRanking.totalScore) {
          timeOfDay[timeSlot].push(participantRanking.totalScore);
          dayOfWeek[dayName].push(participantRanking.totalScore);
        }
        
        if (participantRanking.knowledgeScore) {
          totalKnowledgeScore += participantRanking.knowledgeScore;
          scoreCount++;
        }
        
        if (participantRanking.awarenessScore) {
          totalAwarenessScore += participantRanking.awarenessScore;
        }
      }
    });

    Object.keys(timeOfDay).forEach(key => {
      const scores = timeOfDay[key];
      timeOfDay[key] = scores.length > 0 
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;
    });

    Object.keys(dayOfWeek).forEach(key => {
      const scores = dayOfWeek[key];
      dayOfWeek[key] = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;
    });

    const formatDataForChart = (obj, nameKey = 'name') => {
      return Object.entries(obj).map(([key, value]) => ({
        [nameKey]: key,
        value: value,
        percentage: participants.length > 0 ? ((value / participants.length) * 100).toFixed(1) : 0
      }));
    };

    setStats({
      totalParticipants: participants.length,
      demographics: {
        age: formatDataForChart(ageGroups, 'ageGroup'),
        gender: formatDataForChart(genders, 'gender'),
        profession: formatDataForChart(professionGroups, 'profession'),
        consumption: formatDataForChart(consumptionHabits, 'habit')
      },
      avgKnowledgeScore: scoreCount > 0 ? (totalKnowledgeScore / scoreCount).toFixed(1) : 0,
      avgAwarenessScore: scoreCount > 0 ? (totalAwarenessScore / scoreCount).toFixed(1) : 0,
      avgTotalScore: ranking.length > 0 
        ? (ranking.reduce((sum, p) => sum + (p.totalScore || 0), 0) / ranking.length).toFixed(1)
        : 0,
      timePatterns: formatDataForChart(timeOfDay, 'timeSlot'),
      dayPatterns: formatDataForChart(dayOfWeek, 'day')
    });
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'ID', 'Timestamp', 'Language', 'Age Group', 'Gender', 'Profession',
      'Consumption', 'Total Score', 'Knowledge Score', 'Awareness Score', 'Rank'
    ];

    const rows = ranking.map(p => {
      const profile = p.profile || {};
      const age = parseInt(profile.age);
      let ageGroup = '';
      if (age < 25) ageGroup = '18-24';
      else if (age < 35) ageGroup = '25-34';
      else if (age < 45) ageGroup = '35-44';
      else if (age < 55) ageGroup = '45-54';
      else ageGroup = '55+';
      
      return [
        p.id, p.timestamp, p.language || 'it', ageGroup, profile.gender || '',
        profile.profession || '', profile.consumption || '', p.totalScore || 0,
        p.knowledgeScore || 0, p.awarenessScore || 0, p.rank || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `myfreshfood-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAll = async () => {
    const confirmMsg = language === 'it' 
      ? `Sei sicuro di voler cancellare TUTTI i ${participants.length} partecipanti? Questa azione non può essere annullata!`
      : `Are you sure you want to delete ALL ${participants.length} participants? This action cannot be undone!`;
    
    if (!window.confirm(confirmMsg)) return;
    
    // Double confirm for safety
    const doubleConfirm = language === 'it'
      ? 'Scrivi "ELIMINA" per confermare:'
      : 'Type "DELETE" to confirm:';
    const expected = language === 'it' ? 'ELIMINA' : 'DELETE';
    const userInput = window.prompt(doubleConfirm);
    
    if (userInput !== expected) {
      alert(language === 'it' ? 'Cancellazione annullata.' : 'Deletion cancelled.');
      return;
    }
    
    try {
      const response = await fetch('/api/participants', { method: 'DELETE' });
      if (response.ok) {
        alert(language === 'it' ? 'Tutti i dati sono stati cancellati!' : 'All data has been deleted!');
        fetchData(); // Refresh
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(language === 'it' ? 'Errore durante la cancellazione.' : 'Error during deletion.');
    }
  };

  if (loading) {
    return (
      <SwitchLayout 
        title={language === 'it' ? 'Caricamento...' : 'Loading...'}
        subtitle="Dashboard"
      >
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <RefreshCw size={48} style={{ color: SWITCH_COLORS.gold, animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#666', marginTop: '16px' }}>
            {language === 'it' ? 'Caricamento dati...' : 'Loading data...'}
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </SwitchLayout>
    );
  }

  return (
    <SwitchLayout 
      title="📊 MyFreshFood Dashboard"
      subtitle={`${participants.length} ${language === 'it' ? 'partecipanti totali' : 'total participants'}`}
      compact={true}
      showLangToggle={true}
    >
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={fetchData}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: '12px 16px',
            background: SWITCH_COLORS.green,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <RefreshCw size={18} />
          Refresh
        </button>

        <button
          onClick={handleExportCSV}
          disabled={!stats}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: '12px 16px',
            background: stats ? SWITCH_COLORS.darkBlue : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: stats ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <Download size={18} />
          Export CSV
        </button>

        <button
          onClick={handleDeleteAll}
          disabled={participants.length === 0}
          style={{
            padding: '12px 16px',
            background: participants.length > 0 ? '#dc2626' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: participants.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <Trash2 size={18} />
          {language === 'it' ? 'Cancella tutto' : 'Delete all'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        <button
          onClick={() => setActiveTab('leaderboard')}
          style={{
            padding: '10px 16px',
            background: activeTab === 'leaderboard' ? SWITCH_COLORS.gold : 'white',
            color: activeTab === 'leaderboard' ? SWITCH_COLORS.darkBlue : '#666',
            border: `2px solid ${activeTab === 'leaderboard' ? SWITCH_COLORS.gold : '#e5e7eb'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            fontSize: '0.85rem'
          }}
        >
          <Trophy size={16} />
          {language === 'it' ? 'Classifica' : 'Leaderboard'}
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '10px 16px',
            background: activeTab === 'stats' ? SWITCH_COLORS.gold : 'white',
            color: activeTab === 'stats' ? SWITCH_COLORS.darkBlue : '#666',
            border: `2px solid ${activeTab === 'stats' ? SWITCH_COLORS.gold : '#e5e7eb'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            fontSize: '0.85rem'
          }}
        >
          <BarChart3 size={16} />
          {language === 'it' ? 'Statistiche' : 'Statistics'}
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          style={{
            padding: '10px 16px',
            background: activeTab === 'insights' ? SWITCH_COLORS.gold : 'white',
            color: activeTab === 'insights' ? SWITCH_COLORS.darkBlue : '#666',
            border: `2px solid ${activeTab === 'insights' ? SWITCH_COLORS.gold : '#e5e7eb'}`,
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            fontSize: '0.85rem'
          }}
        >
          <Brain size={16} />
          {language === 'it' ? 'Insights AI' : 'AI Insights'}
        </button>
      </div>

      {/* Tab Content */}
      <div style={{
        background: SWITCH_COLORS.lightBg,
        borderRadius: '16px',
        minHeight: '300px'
      }}>
        {activeTab === 'leaderboard' && (
          <div style={{ padding: '16px' }}>
            <Leaderboard ranking={ranking} language={language} />
          </div>
        )}

        {activeTab === 'stats' && (
          <StatsTab 
            stats={stats} 
            participants={participants} 
            language={language} 
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab participants={participants} language={language} />
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          width: '100%',
          padding: '14px',
          background: 'white',
          color: SWITCH_COLORS.darkBlue,
          border: `2px solid ${SWITCH_COLORS.darkBlue}`,
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600'
        }}
      >
        ← {language === 'it' ? 'Torna alla Home' : 'Back to Home'}
      </button>
    </SwitchLayout>
  );
};

export default DashboardScreen;
