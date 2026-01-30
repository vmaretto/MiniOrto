// src/screens/EmbedProductScreen.js
// Scheda prodotto embeddabile - esempio per mostrare a Daniele
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

// Database prodotti di esempio
const products = {
  'pomodoro-ciliegino': {
    id: 'pomodoro-ciliegino',
    name: 'Pomodoro Ciliegino',
    category: 'Ortaggio',
    emoji: '🍅',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    description: 'Il pomodoro ciliegino è una varietà di pomodoro caratterizzata da frutti piccoli e dolci, molto apprezzata per il suo sapore intenso.',
    origin: 'Sicilia, Italia',
    seasonality: ['Giu', 'Lug', 'Ago', 'Set'],
    nutrition: {
      calories: { value: 18, unit: 'kcal/100g' },
      sugar: { value: 3.9, min: 3, max: 6, unit: '%' },
      water: { value: 94, unit: '%' },
      fiber: { value: 1.2, unit: 'g' },
      vitaminC: { value: 21, unit: 'mg' },
      lycopene: { value: 2.5, unit: 'mg' }
    },
    tips: [
      '🌡️ Conservare a temperatura ambiente per massimo sapore',
      '🚫 Evitare il frigorifero se possibile',
      '🥗 Ottimo crudo in insalate o come snack',
      '🍳 Perfetto per sughi veloci'
    ],
    curiosity: 'Il licopene, responsabile del colore rosso, è un potente antiossidante che aumenta con la cottura!'
  },
  'mela': {
    id: 'mela',
    name: 'Mela Golden',
    category: 'Frutta',
    emoji: '🍎',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    description: 'La mela Golden è una delle varietà più diffuse, dal sapore dolce e leggermente acidulo.',
    origin: 'Trentino Alto Adige',
    seasonality: ['Set', 'Ott', 'Nov', 'Dic', 'Gen', 'Feb'],
    nutrition: {
      calories: { value: 52, unit: 'kcal/100g' },
      sugar: { value: 10.4, min: 9, max: 12, unit: '%' },
      water: { value: 86, unit: '%' },
      fiber: { value: 2.4, unit: 'g' },
      vitaminC: { value: 4.6, unit: 'mg' }
    },
    tips: [
      '❄️ Conservare in frigorifero per mantenerla croccante',
      '🍯 Ottima con miele e noci',
      '🥧 Perfetta per torte e dolci'
    ],
    curiosity: 'Una mela al giorno toglie il medico di torno: contiene pectina che aiuta la digestione!'
  }
};

function EmbedProductScreen() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  
  const measuredSugar = searchParams.get('sugar');
  const product = products[productId] || products['pomodoro-ciliegino'];
  
  // Calcola la qualità basata sullo zucchero misurato
  const getQualityIndicator = () => {
    if (!measuredSugar) return null;
    const measured = parseFloat(measuredSugar);
    const expected = product.nutrition.sugar;
    
    if (measured >= expected.min && measured <= expected.max) {
      return { status: 'optimal', label: 'Ottimale', color: '#4CAF50', icon: '✅' };
    } else if (measured < expected.min) {
      return { status: 'low', label: 'Sotto la media', color: '#FF9800', icon: '📉' };
    } else {
      return { status: 'high', label: 'Sopra la media', color: '#FF5722', icon: '📈' };
    }
  };
  
  const quality = getQualityIndicator();

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px',
      background: 'linear-gradient(180deg, #f8fdf8 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      {/* Header con immagine */}
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          padding: '40px 20px 20px',
          color: 'white'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{product.category}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            {product.emoji} {product.name}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>📍 {product.origin}</div>
        </div>
      </div>

      {/* Valore SCIO misurato */}
      {measuredSugar && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '5px' }}>
            🔬 Misurazione SCIO
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
            {parseFloat(measuredSugar).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Contenuto zuccherino</div>
          
          {quality && (
            <div style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              display: 'inline-block'
            }}>
              {quality.icon} {quality.label}
            </div>
          )}
        </div>
      )}

      {/* Valori di riferimento */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem' }}>
          📊 Valori Nutrizionali
        </h3>
        
        {/* Sugar comparison bar */}
        {product.nutrition.sugar && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              fontSize: '0.9rem'
            }}>
              <span>Zuccheri</span>
              <span style={{ color: '#666' }}>
                {product.nutrition.sugar.min}-{product.nutrition.sugar.max}%
              </span>
            </div>
            <div style={{
              height: '12px',
              background: '#e0e0e0',
              borderRadius: '6px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Range ottimale */}
              <div style={{
                position: 'absolute',
                left: `${(product.nutrition.sugar.min / 15) * 100}%`,
                width: `${((product.nutrition.sugar.max - product.nutrition.sugar.min) / 15) * 100}%`,
                height: '100%',
                background: '#c8e6c9',
                borderRadius: '6px'
              }} />
              {/* Valore misurato */}
              {measuredSugar && (
                <div style={{
                  position: 'absolute',
                  left: `${(parseFloat(measuredSugar) / 15) * 100}%`,
                  top: '-4px',
                  width: '20px',
                  height: '20px',
                  background: quality?.color || '#667eea',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transform: 'translateX(-50%)'
                }} />
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <NutrientBox label="Calorie" value={product.nutrition.calories.value} unit={product.nutrition.calories.unit} icon="🔥" />
          <NutrientBox label="Acqua" value={product.nutrition.water.value} unit={product.nutrition.water.unit} icon="💧" />
          <NutrientBox label="Fibre" value={product.nutrition.fiber.value} unit={product.nutrition.fiber.unit} icon="🌾" />
          <NutrientBox label="Vitamina C" value={product.nutrition.vitaminC.value} unit={product.nutrition.vitaminC.unit} icon="🍊" />
        </div>
      </div>

      {/* Stagionalità */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem' }}>
          📅 Stagionalità
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'].map(month => (
            <div 
              key={month}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '500',
                background: product.seasonality.includes(month) ? '#4CAF50' : '#f0f0f0',
                color: product.seasonality.includes(month) ? 'white' : '#999'
              }}
            >
              {month}
            </div>
          ))}
        </div>
      </div>

      {/* Consigli */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem' }}>
          💡 Consigli
        </h3>
        {product.tips.map((tip, i) => (
          <div key={i} style={{ 
            padding: '10px 0', 
            borderBottom: i < product.tips.length - 1 ? '1px solid #f0f0f0' : 'none',
            fontSize: '0.9rem',
            color: '#555'
          }}>
            {tip}
          </div>
        ))}
      </div>

      {/* Curiosità */}
      <div style={{
        background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px', color: '#f57f17', fontSize: '1rem' }}>
          🤓 Lo sapevi?
        </h3>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {product.curiosity}
        </p>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        color: '#999', 
        fontSize: '0.75rem',
        padding: '10px'
      }}>
        Powered by Mini-Orto 🌱
      </div>
    </div>
  );
}

function NutrientBox({ label, value, unit, icon }) {
  return (
    <div style={{
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: '15px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{icon}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#666' }}>{unit}</div>
      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

export default EmbedProductScreen;
