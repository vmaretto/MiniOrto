// src/components/StatsTab.js
// Statistics dashboard for MiniOrto feedback data
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'];

const StatsTab = ({ participants }) => {
  const { t } = useTranslation();

  // Calculate feedback statistics
  const calculateStats = () => {
    const stats = {
      totalSessions: participants.length,
      completedFeedback: 0,
      
      // Differences found
      differences: { yes: 0, somewhat: 0, no: 0 },
      
      // Spectrometer usefulness (1-5)
      spectrometerUseful: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      avgSpectrometerUseful: 0,
      
      // Overall rating (1-5 stars)
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      avgRating: 0,
      
      // Products scanned
      products: {},
      
      // Scan methods
      scanMethods: { direct: 0, screenshot: 0, unknown: 0 }
    };

    let spectrometerSum = 0;
    let spectrometerCount = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    participants.forEach(p => {
      const data = p.data || {};
      const feedback = data.feedback || {};
      
      // Count completed feedback
      if (feedback.overallRating) {
        stats.completedFeedback++;
      }

      // Differences found
      if (feedback.foundDifferences) {
        stats.differences[feedback.foundDifferences] = 
          (stats.differences[feedback.foundDifferences] || 0) + 1;
      }

      // Spectrometer usefulness
      if (feedback.spectrometerUseful) {
        const val = parseInt(feedback.spectrometerUseful);
        stats.spectrometerUseful[val] = (stats.spectrometerUseful[val] || 0) + 1;
        spectrometerSum += val;
        spectrometerCount++;
      }

      // Overall rating
      if (feedback.overallRating) {
        const rating = parseInt(feedback.overallRating);
        stats.ratings[rating] = (stats.ratings[rating] || 0) + 1;
        ratingSum += rating;
        ratingCount++;
      }

      // Products
      if (data.product?.name) {
        stats.products[data.product.name] = (stats.products[data.product.name] || 0) + 1;
      }

      // Scan methods
      if (data.scanMethod) {
        stats.scanMethods[data.scanMethod] = (stats.scanMethods[data.scanMethod] || 0) + 1;
      }
    });

    stats.avgSpectrometerUseful = spectrometerCount > 0 ? (spectrometerSum / spectrometerCount).toFixed(1) : 0;
    stats.avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : 0;

    return stats;
  };

  const stats = calculateStats();

  // Prepare chart data
  const differencesData = [
    { name: t('feedback.option_yes', 'Sì'), value: stats.differences.yes, color: '#4CAF50' },
    { name: t('feedback.option_somewhat', 'In parte'), value: stats.differences.somewhat, color: '#FF9800' },
    { name: t('feedback.option_no', 'No'), value: stats.differences.no, color: '#2196F3' }
  ].filter(d => d.value > 0);

  const spectrometerData = [1, 2, 3, 4, 5].map(n => ({
    name: n.toString(),
    value: stats.spectrometerUseful[n] || 0
  }));

  const ratingsData = [1, 2, 3, 4, 5].map(n => ({
    name: '⭐'.repeat(n),
    value: stats.ratings[n] || 0
  }));

  const productsData = Object.entries(stats.products)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const scanMethodsData = [
    { name: 'Diretto', value: stats.scanMethods.direct },
    { name: 'Screenshot', value: stats.scanMethods.screenshot }
  ].filter(d => d.value > 0);

  if (participants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>📊 {t('stats.noData', 'Nessun dato disponibile')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '12px',
        marginBottom: '24px'
      }}>
        <StatCard 
          icon="👥" 
          label={t('stats.totalSessions', 'Sessioni totali')} 
          value={stats.totalSessions} 
        />
        <StatCard 
          icon="📝" 
          label={t('stats.completedFeedback', 'Feedback completati')} 
          value={stats.completedFeedback} 
        />
        <StatCard 
          icon="⭐" 
          label={t('stats.avgRating', 'Rating medio')} 
          value={stats.avgRating} 
        />
        <StatCard 
          icon="🔬" 
          label={t('stats.avgSpectrometerUseful', 'Utilità spettrometro')} 
          value={stats.avgSpectrometerUseful + '/5'} 
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Differences Found - Pie Chart */}
        {differencesData.length > 0 && (
          <ChartCard title={t('stats.differencesFound', 'Differenze SCIO vs SWITCH')}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={differencesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {differencesData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Spectrometer Usefulness - Bar Chart */}
        <ChartCard title={t('stats.spectrometerUsefulness', 'Utilità spettrometro')}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={spectrometerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666', marginTop: '8px' }}>
            1 = {t('feedback.not_useful', 'Per niente')} → 5 = {t('feedback.very_useful', 'Molto utile')}
          </div>
        </ChartCard>

        {/* Overall Ratings - Bar Chart */}
        <ChartCard title={t('stats.overallRatings', 'Valutazione esperienza')}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#FF9800" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Products Scanned - Bar Chart */}
        {productsData.length > 0 && (
          <ChartCard title={t('stats.productsScanned', 'Prodotti analizzati')}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#2196F3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Scan Methods - Pie Chart */}
        {scanMethodsData.length > 0 && (
          <ChartCard title={t('stats.scanMethods', 'Metodo di scansione')}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={scanMethodsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {scanMethodsData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value }) => (
  <div style={{
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
    <div style={{ fontSize: '0.75rem', color: '#666' }}>{label}</div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={{
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}>
    <h4 style={{ margin: '0 0 16px', color: '#333', fontSize: '0.9rem' }}>{title}</h4>
    {children}
  </div>
);

export default StatsTab;
