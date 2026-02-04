// src/components/StatsTab.js
// Statistics dashboard - mobile-first, clean design
import React from 'react';
import { useTranslation } from 'react-i18next';

const SWITCH_BLUE = '#1a3a5c';
const SWITCH_GREEN = '#4CAF50';

const StatsTab = ({ participants, language = 'it' }) => {
  const { t } = useTranslation();
  const isIt = (language || 'it') === 'it';

  const calculateStats = () => {
    const stats = {
      totalSessions: participants.length,
      completedFeedback: 0,
      differences: { yes: 0, somewhat: 0, no: 0 },
      spectrometerUseful: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      avgSpectrometerUseful: 0,
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      avgRating: 0,
      products: {},
      scanMethods: { direct: 0, demo: 0, manual: 0, unknown: 0 }
    };

    let spectrometerSum = 0, spectrometerCount = 0;
    let ratingSum = 0, ratingCount = 0;

    participants.forEach(p => {
      const rawData = p.data || {};
      const data = rawData.data || rawData;
      const feedback = data.feedback || {};

      if (feedback.overallRating) {
        stats.completedFeedback++;
        const rating = parseInt(feedback.overallRating);
        stats.ratings[rating] = (stats.ratings[rating] || 0) + 1;
        ratingSum += rating;
        ratingCount++;
      }

      if (feedback.foundDifferences) {
        stats.differences[feedback.foundDifferences] = 
          (stats.differences[feedback.foundDifferences] || 0) + 1;
      }

      if (feedback.spectrometerUseful) {
        const val = parseInt(feedback.spectrometerUseful);
        stats.spectrometerUseful[val] = (stats.spectrometerUseful[val] || 0) + 1;
        spectrometerSum += val;
        spectrometerCount++;
      }

      if (data.product?.name) {
        stats.products[data.product.name] = (stats.products[data.product.name] || 0) + 1;
      }

      if (data.scanMethod) {
        const method = data.scanMethod === 'direct' ? 'direct' : data.scanMethod === 'demo' ? 'demo' : data.scanMethod === 'manual' ? 'manual' : 'unknown';
        stats.scanMethods[method] = (stats.scanMethods[method] || 0) + 1;
      }
    });

    stats.avgSpectrometerUseful = spectrometerCount > 0 ? (spectrometerSum / spectrometerCount).toFixed(1) : '—';
    stats.avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '—';

    return stats;
  };

  const stats = calculateStats();

  if (participants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>📊 {isIt ? 'Nessun dato disponibile' : 'No data available'}</p>
      </div>
    );
  }

  // Sorted products
  const productsData = Object.entries(stats.products)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxProduct = productsData.length > 0 ? productsData[0][1] : 1;

  // Differences total
  const diffTotal = stats.differences.yes + stats.differences.somewhat + stats.differences.no;

  // Max rating/spectrometer for bar scaling
  const maxRating = Math.max(...Object.values(stats.ratings), 1);
  const maxSpec = Math.max(...Object.values(stats.spectrometerUseful), 1);

  return (
    <div style={{ padding: '12px' }}>

      {/* Summary Cards - 2x2 grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '10px',
        marginBottom: '20px'
      }}>
        <SummaryCard 
          emoji="👥" 
          value={stats.totalSessions} 
          label={isIt ? 'Partecipanti' : 'Participants'} 
          color="#667eea"
        />
        <SummaryCard 
          emoji="📝" 
          value={stats.completedFeedback} 
          label={isIt ? 'Feedback ricevuti' : 'Feedback received'} 
          color="#4CAF50"
        />
        <SummaryCard 
          emoji="⭐" 
          value={stats.avgRating} 
          label={isIt ? 'Rating medio' : 'Avg rating'} 
          color="#FF9800"
          suffix="/5"
        />
        <SummaryCard 
          emoji="🔬" 
          value={stats.avgSpectrometerUseful} 
          label={isIt ? 'Utilità spettrometro' : 'Spectrometer useful'} 
          color="#E91E63"
          suffix="/5"
        />
      </div>

      {/* Differenze trovate */}
      {diffTotal > 0 && (
        <Section title={isIt ? '🔍 Differenze Spettrometro vs SWITCH' : '🔍 Spectrometer vs SWITCH Differences'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <DiffBar 
              label={isIt ? 'Sì' : 'Yes'} 
              value={stats.differences.yes} 
              total={diffTotal} 
              color="#4CAF50" 
              emoji="✅"
            />
            <DiffBar 
              label={isIt ? 'In parte' : 'Somewhat'} 
              value={stats.differences.somewhat} 
              total={diffTotal} 
              color="#FF9800" 
              emoji="⚠️"
            />
            <DiffBar 
              label="No" 
              value={stats.differences.no} 
              total={diffTotal} 
              color="#2196F3" 
              emoji="❌"
            />
          </div>
        </Section>
      )}

      {/* Valutazione esperienza */}
      <Section title={isIt ? '⭐ Valutazione esperienza' : '⭐ Experience rating'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[5, 4, 3, 2, 1].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '70px', fontSize: '0.85rem', textAlign: 'right' }}>
                {'⭐'.repeat(n)}
              </span>
              <div style={{ flex: 1, height: '24px', background: '#f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(stats.ratings[n] / maxRating) * 100}%`,
                  background: 'linear-gradient(90deg, #FFB800, #FF9800)',
                  borderRadius: '12px',
                  transition: 'width 0.5s ease',
                  minWidth: stats.ratings[n] > 0 ? '24px' : '0'
                }} />
              </div>
              <span style={{ 
                width: '30px', 
                textAlign: 'center', 
                fontWeight: '700', 
                fontSize: '0.9rem',
                color: '#333'
              }}>
                {stats.ratings[n]}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Utilità spettrometro */}
      <Section title={isIt ? '🔬 Utilità spettrometro' : '🔬 Spectrometer usefulness'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '24px', 
                textAlign: 'center', 
                fontSize: '0.9rem', 
                fontWeight: '600',
                color: '#555'
              }}>
                {n}
              </span>
              <div style={{ flex: 1, height: '24px', background: '#f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(stats.spectrometerUseful[n] / maxSpec) * 100}%`,
                  background: `linear-gradient(90deg, ${n <= 2 ? '#ef4444' : n === 3 ? '#FF9800' : '#4CAF50'}, ${n <= 2 ? '#f87171' : n === 3 ? '#FFB800' : '#66BB6A'})`,
                  borderRadius: '12px',
                  transition: 'width 0.5s ease',
                  minWidth: stats.spectrometerUseful[n] > 0 ? '24px' : '0'
                }} />
              </div>
              <span style={{ 
                width: '30px', 
                textAlign: 'center', 
                fontWeight: '700', 
                fontSize: '0.9rem',
                color: '#333'
              }}>
                {stats.spectrometerUseful[n]}
              </span>
            </div>
          ))}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.7rem', 
          color: '#999',
          marginTop: '6px',
          padding: '0 32px 0 0'
        }}>
          <span style={{ marginLeft: '32px' }}>{isIt ? 'Per niente utile' : 'Not useful'}</span>
          <span>{isIt ? 'Molto utile' : 'Very useful'}</span>
        </div>
      </Section>

      {/* Prodotti analizzati */}
      {productsData.length > 0 && (
        <Section title={isIt ? '🥦 Prodotti analizzati' : '🥦 Products analyzed'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {productsData.map(([name, count], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '90px', 
                  fontSize: '0.8rem', 
                  fontWeight: '500',
                  color: '#333',
                  textAlign: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {name}
                </span>
                <div style={{ flex: 1, height: '28px', background: '#f0f0f0', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / maxProduct) * 100}%`,
                    background: `linear-gradient(90deg, ${SWITCH_BLUE}, #2d5a8f)`,
                    borderRadius: '14px',
                    transition: 'width 0.5s ease',
                    minWidth: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '10px'
                  }}>
                    <span style={{ 
                      color: 'white', 
                      fontWeight: '700', 
                      fontSize: '0.8rem'
                    }}>
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

// --- Helper Components ---

const SummaryCard = ({ emoji, value, label, color, suffix = '' }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '16px 12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderTop: `4px solid ${color}`
  }}>
    <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{emoji}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: '800', color }}>
      {value}<span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#999' }}>{suffix}</span>
    </div>
    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px', lineHeight: '1.2' }}>{label}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  }}>
    <h3 style={{ 
      margin: '0 0 14px', 
      fontSize: '1rem', 
      fontWeight: '700', 
      color: '#333'
    }}>
      {title}
    </h3>
    {children}
  </div>
);

const DiffBar = ({ label, value, total, color, emoji }) => {
  const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '24px', textAlign: 'center', fontSize: '1rem' }}>{emoji}</span>
      <span style={{ width: '60px', fontSize: '0.85rem', fontWeight: '500', color: '#555' }}>{label}</span>
      <div style={{ flex: 1, height: '28px', background: '#f0f0f0', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: '14px',
          transition: 'width 0.5s ease',
          minWidth: value > 0 ? '40px' : '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '10px'
        }}>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '0.8rem' }}>
            {pct}%
          </span>
        </div>
      </div>
      <span style={{ width: '24px', textAlign: 'center', fontWeight: '700', fontSize: '0.85rem', color: '#333' }}>
        {value}
      </span>
    </div>
  );
};

export default StatsTab;
