// src/components/ProductCard.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Database prodotti locali (fallback)
const localProducts = {
  'pomodoro': {
    id: 'pomodoro',
    name: 'Pomodoro',
    category: 'Ortaggio',
    emoji: '🍅',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    origin: 'Sicilia, Italia',
    seasonality: [6, 7, 8, 9],
    nutrition: {
      calories: 18,
      sugar: { typical: 3.9, min: 3, max: 6 },
      water: 94,
      fiber: 1.2,
      vitaminC: 21,
    },
    tips: [
      '🌡️ Conservare a temperatura ambiente per massimo sapore',
      '🚫 Evitare il frigorifero se possibile',
      '🥗 Ottimo crudo in insalate o come snack',
      '🍳 Perfetto per sughi veloci'
    ],
    curiosity: 'Il licopene, responsabile del colore rosso, è un potente antiossidante che aumenta con la cottura!'
  },
  'pomodoro ciliegino': {
    id: 'pomodoro-ciliegino',
    name: 'Pomodoro Ciliegino',
    category: 'Ortaggio',
    emoji: '🍅',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    origin: 'Sicilia, Italia',
    seasonality: [6, 7, 8, 9],
    nutrition: {
      calories: 18,
      sugar: { typical: 4.5, min: 3.5, max: 6.5 },
      water: 94,
      fiber: 1.2,
      vitaminC: 21,
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
    name: 'Mela',
    category: 'Frutta',
    emoji: '🍎',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    origin: 'Trentino Alto Adige',
    seasonality: [9, 10, 11, 12, 1, 2],
    nutrition: {
      calories: 52,
      sugar: { typical: 10.4, min: 9, max: 12 },
      water: 86,
      fiber: 2.4,
      vitaminC: 4.6,
    },
    tips: [
      '❄️ Conservare in frigorifero per mantenerla croccante',
      '🍯 Ottima con miele e noci',
      '🥧 Perfetta per torte e dolci'
    ],
    curiosity: 'Una mela al giorno toglie il medico di torno: contiene pectina che aiuta la digestione!'
  }
};

function NutrientBox({ label, value, unit, icon }) {
  if (value === null || value === undefined) return null;
  return (
    <div style={{
      background: '#f8f9fa',
      borderRadius: '12px',
      padding: '15px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{icon}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
        {typeof value === 'number' ? value.toFixed(1) : value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#666' }}>{unit}</div>
      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function ProductCard({ productName, measuredValue, productImage, switchData }) {
  const { t, i18n } = useTranslation();
  const [aiProductInfo, setAiProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Normalize product name for lookup
  const normalizedName = (productName || '').toLowerCase().trim();
  
  // Check if we have local data
  const localProduct = localProducts[normalizedName];
  
  // Fetch AI-generated info if not in local database
  useEffect(() => {
    const fetchAiInfo = async () => {
      if (localProduct || !productName) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/generate-product-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            productName,
            language: i18n.language 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setAiProductInfo(data);
        }
      } catch (error) {
        console.error('Error fetching AI product info:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAiInfo();
  }, [productName, localProduct, i18n.language]);
  
  // Merge data sources: local > AI > SWITCH > defaults
  const product = {
    name: localProduct?.name || aiProductInfo?.name || productName || t('products.unknown.name', 'Prodotto'),
    emoji: localProduct?.emoji || aiProductInfo?.emoji || '🥬',
    category: localProduct?.category || aiProductInfo?.category || switchData?.category?.group || t('products.category.other', 'Altro'),
    origin: localProduct?.origin || aiProductInfo?.origin || null,
    seasonality: localProduct?.seasonality || aiProductInfo?.seasonality || [],
    tips: localProduct?.tips || aiProductInfo?.tips || [],
    curiosity: localProduct?.curiosity || aiProductInfo?.curiosity || null,
    pairings: aiProductInfo?.pairings || [],
  };
  
  // Nutrition: prefer SWITCH data, then local/AI
  const nutrition = {
    calories: switchData?.nutrition?.energy || localProduct?.nutrition?.calories || aiProductInfo?.nutrition?.calories || null,
    water: localProduct?.nutrition?.water || aiProductInfo?.nutrition?.water || null,
    fiber: switchData?.nutrition?.fiber || localProduct?.nutrition?.fiber || aiProductInfo?.nutrition?.fiber || null,
    vitaminC: localProduct?.nutrition?.vitaminC || aiProductInfo?.nutrition?.vitaminC || null,
    protein: switchData?.nutrition?.proteins || null,
    carbs: switchData?.nutrition?.carbohydrates || null,
    fat: switchData?.nutrition?.fat || null,
    sugar: {
      typical: localProduct?.nutrition?.sugar?.typical || aiProductInfo?.nutrition?.sugar?.typical || null,
      min: localProduct?.nutrition?.sugar?.min || aiProductInfo?.nutrition?.sugar?.min || 0,
      max: localProduct?.nutrition?.sugar?.max || aiProductInfo?.nutrition?.sugar?.max || 15,
    }
  };
  
  // Use custom image if provided
  const displayImage = productImage || localProduct?.image || null;
  
  // Calculate quality based on measured sugar vs expected range
  const getQualityIndicator = () => {
    if (!measuredValue || !nutrition.sugar.min) return null;
    const measured = parseFloat(measuredValue);
    
    if (measured >= nutrition.sugar.min && measured <= nutrition.sugar.max) {
      return { status: 'optimal', label: t('productCard.quality.optimal', 'Ottimale'), color: '#4CAF50', icon: '✅' };
    } else if (measured < nutrition.sugar.min) {
      return { status: 'low', label: t('productCard.quality.belowAverage', 'Sotto la media'), color: '#FF9800', icon: '📉' };
    } else {
      return { status: 'high', label: t('productCard.quality.aboveAverage', 'Sopra la media'), color: '#FF5722', icon: '📈' };
    }
  };
  
  const quality = getQualityIndicator();
  
  // Month names
  const monthNames = i18n.language === 'en' 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

  // Show loading state while fetching AI data
  if (loading && !localProduct) {
    return (
      <div style={{
        background: 'linear-gradient(180deg, #f8fdf8 0%, #ffffff 100%)',
        borderRadius: '20px',
        padding: '40px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
        <p style={{ color: '#666' }}>{t('productCard.loading', 'Generazione scheda prodotto...')}</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(180deg, #f8fdf8 0%, #ffffff 100%)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      {/* Header with image */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={product.name}
            style={{
              width: '100%',
              height: '180px',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '120px',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '4rem' }}>{product.emoji}</span>
          </div>
        )}
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
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {product.emoji} {product.name}
          </div>
          {product.origin && (
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>📍 {product.origin}</div>
          )}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* SCIO Measured Value */}
        {measuredValue && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '5px' }}>
              🔬 {t('productCard.scioMeasurement', 'Misurazione SCIO')}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {parseFloat(measuredValue).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {t('productCard.sugarContent', 'Contenuto zuccherino')}
            </div>
            
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

        {/* Nutritional Values */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #eee'
        }}>
          <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem' }}>
            📊 {t('productCard.nutritionalValues', 'Valori Nutrizionali')}
          </h3>
          
          {/* Sugar comparison bar */}
          {nutrition.sugar.min > 0 && measuredValue && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                fontSize: '0.9rem'
              }}>
                <span>{t('productCard.sugar', 'Zuccheri')}</span>
                <span style={{ color: '#666' }}>
                  {nutrition.sugar.min}-{nutrition.sugar.max}%
                </span>
              </div>
              <div style={{
                height: '12px',
                background: '#e0e0e0',
                borderRadius: '6px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Optimal range */}
                <div style={{
                  position: 'absolute',
                  left: `${(nutrition.sugar.min / 15) * 100}%`,
                  width: `${((nutrition.sugar.max - nutrition.sugar.min) / 15) * 100}%`,
                  height: '100%',
                  background: '#c8e6c9',
                  borderRadius: '6px'
                }} />
                {/* Measured value marker */}
                <div style={{
                  position: 'absolute',
                  left: `${Math.min((parseFloat(measuredValue) / 15) * 100, 100)}%`,
                  top: '-4px',
                  width: '20px',
                  height: '20px',
                  background: quality?.color || '#667eea',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transform: 'translateX(-50%)'
                }} />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <NutrientBox label={t('productCard.calories', 'Calorie')} value={nutrition.calories} unit="kcal/100g" icon="🔥" />
            <NutrientBox label={t('productCard.water', 'Acqua')} value={nutrition.water} unit="%" icon="💧" />
            <NutrientBox label={t('productCard.fiber', 'Fibre')} value={nutrition.fiber} unit="g" icon="🌾" />
            <NutrientBox label={t('productCard.vitaminC', 'Vitamina C')} value={nutrition.vitaminC} unit="mg" icon="🍊" />
            {nutrition.protein && <NutrientBox label={t('productCard.protein', 'Proteine')} value={nutrition.protein} unit="g" icon="💪" />}
            {nutrition.carbs && <NutrientBox label={t('productCard.carbs', 'Carboidrati')} value={nutrition.carbs} unit="g" icon="🍞" />}
          </div>
          
          {/* Source indicator */}
          {switchData?.found && (
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#999', textAlign: 'center' }}>
              📊 {t('productCard.dataSource', 'Fonte')}: SWITCH Food Explorer Database
            </div>
          )}
        </div>

        {/* Seasonality */}
        {product.seasonality.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #eee'
          }}>
            <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem' }}>
              📅 {t('productCard.seasonality', 'Stagionalità')}
            </h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {monthNames.map((month, index) => (
                <div 
                  key={month}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    background: product.seasonality.includes(index + 1) ? '#4CAF50' : '#f0f0f0',
                    color: product.seasonality.includes(index + 1) ? 'white' : '#999'
                  }}
                >
                  {month}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {product.tips.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #eee'
          }}>
            <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem' }}>
              💡 {t('productCard.tips', 'Consigli')}
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
        )}

        {/* Pairings */}
        {product.pairings.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #eee'
          }}>
            <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem' }}>
              🍽️ {t('productCard.pairings', 'Abbinamenti')}
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.pairings.map((pairing, i) => (
                <span key={i} style={{
                  padding: '6px 12px',
                  background: '#e3f2fd',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  color: '#1976d2'
                }}>
                  {pairing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Curiosity */}
        {product.curiosity && (
          <div style={{
            background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px', color: '#f57f17', fontSize: '1rem' }}>
              🤓 {t('productCard.didYouKnow', 'Lo sapevi?')}
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {product.curiosity}
            </p>
          </div>
        )}
        
        {/* AI Generated indicator */}
        {aiProductInfo?.generated && (
          <div style={{ 
            marginTop: '16px', 
            fontSize: '0.75rem', 
            color: '#999', 
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            ✨ {t('productCard.aiGenerated', 'Contenuti generati da AI')}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
