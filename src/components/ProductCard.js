// src/components/ProductCard.js
import React from 'react';
import { useTranslation } from 'react-i18next';

// Database prodotti
const products = {
  'pomodoro': {
    id: 'pomodoro',
    nameKey: 'products.tomato.name',
    category: 'products.category.vegetable',
    emoji: '🍅',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    descriptionKey: 'products.tomato.description',
    origin: 'Sicilia, Italia',
    seasonality: [6, 7, 8, 9], // Months (1-12)
    nutrition: {
      calories: { value: 18, unit: 'kcal/100g' },
      sugar: { value: 3.9, min: 3, max: 6, unit: '%' },
      water: { value: 94, unit: '%' },
      fiber: { value: 1.2, unit: 'g' },
      vitaminC: { value: 21, unit: 'mg' },
      lycopene: { value: 2.5, unit: 'mg' }
    },
    tipsKeys: ['products.tomato.tip1', 'products.tomato.tip2', 'products.tomato.tip3', 'products.tomato.tip4'],
    curiosityKey: 'products.tomato.curiosity'
  },
  'pomodoro ciliegino': {
    id: 'pomodoro-ciliegino',
    nameKey: 'products.cherryTomato.name',
    category: 'products.category.vegetable',
    emoji: '🍅',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
    descriptionKey: 'products.cherryTomato.description',
    origin: 'Sicilia, Italia',
    seasonality: [6, 7, 8, 9],
    nutrition: {
      calories: { value: 18, unit: 'kcal/100g' },
      sugar: { value: 3.9, min: 3, max: 6, unit: '%' },
      water: { value: 94, unit: '%' },
      fiber: { value: 1.2, unit: 'g' },
      vitaminC: { value: 21, unit: 'mg' },
      lycopene: { value: 2.5, unit: 'mg' }
    },
    tipsKeys: ['products.tomato.tip1', 'products.tomato.tip2', 'products.tomato.tip3', 'products.tomato.tip4'],
    curiosityKey: 'products.tomato.curiosity'
  },
  'mela': {
    id: 'mela',
    nameKey: 'products.apple.name',
    category: 'products.category.fruit',
    emoji: '🍎',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    descriptionKey: 'products.apple.description',
    origin: 'Trentino Alto Adige',
    seasonality: [9, 10, 11, 12, 1, 2],
    nutrition: {
      calories: { value: 52, unit: 'kcal/100g' },
      sugar: { value: 10.4, min: 9, max: 12, unit: '%' },
      water: { value: 86, unit: '%' },
      fiber: { value: 2.4, unit: 'g' },
      vitaminC: { value: 4.6, unit: 'mg' }
    },
    tipsKeys: ['products.apple.tip1', 'products.apple.tip2', 'products.apple.tip3'],
    curiosityKey: 'products.apple.curiosity'
  }
};

// Fallback product for unknown items
const defaultProduct = {
  id: 'unknown',
  nameKey: 'products.unknown.name',
  category: 'products.category.other',
  emoji: '🥬',
  image: null,
  descriptionKey: 'products.unknown.description',
  origin: null,
  seasonality: [],
  nutrition: {
    calories: { value: null, unit: 'kcal/100g' },
    sugar: { value: null, min: 0, max: 15, unit: '%' },
    water: { value: null, unit: '%' },
    fiber: { value: null, unit: 'g' },
    vitaminC: { value: null, unit: 'mg' }
  },
  tipsKeys: [],
  curiosityKey: null
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
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#666' }}>{unit}</div>
      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function ProductCard({ productName, measuredValue, productImage }) {
  const { t, i18n } = useTranslation();
  
  // Find product in database
  const normalizedName = (productName || '').toLowerCase().trim();
  const product = products[normalizedName] || defaultProduct;
  
  // Use custom image if provided, otherwise use default
  const displayImage = productImage || product.image;
  
  // Calculate quality based on measured sugar
  const getQualityIndicator = () => {
    if (!measuredValue || !product.nutrition.sugar.min) return null;
    const measured = parseFloat(measuredValue);
    const expected = product.nutrition.sugar;
    
    if (measured >= expected.min && measured <= expected.max) {
      return { status: 'optimal', labelKey: 'productCard.quality.optimal', color: '#4CAF50', icon: '✅' };
    } else if (measured < expected.min) {
      return { status: 'low', labelKey: 'productCard.quality.belowAverage', color: '#FF9800', icon: '📉' };
    } else {
      return { status: 'high', labelKey: 'productCard.quality.aboveAverage', color: '#FF5722', icon: '📈' };
    }
  };
  
  const quality = getQualityIndicator();
  
  // Get month names based on language
  const monthNames = i18n.language === 'en' 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

  return (
    <div style={{
      background: 'linear-gradient(180deg, #f8fdf8 0%, #ffffff 100%)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      {/* Header with image */}
      {displayImage && (
        <div style={{
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img 
            src={displayImage} 
            alt={t(product.nameKey, productName)}
            style={{
              width: '100%',
              height: '180px',
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
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{t(product.category)}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {product.emoji} {t(product.nameKey, productName)}
            </div>
            {product.origin && (
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>📍 {product.origin}</div>
            )}
          </div>
        </div>
      )}

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
              🔬 {t('productCard.scioMeasurement')}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {parseFloat(measuredValue).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{t('productCard.sugarContent')}</div>
            
            {quality && (
              <div style={{
                marginTop: '15px',
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                display: 'inline-block'
              }}>
                {quality.icon} {t(quality.labelKey)}
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
            📊 {t('productCard.nutritionalValues')}
          </h3>
          
          {/* Sugar comparison bar */}
          {product.nutrition.sugar.min && measuredValue && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                fontSize: '0.9rem'
              }}>
                <span>{t('productCard.sugar')}</span>
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
                {/* Optimal range */}
                <div style={{
                  position: 'absolute',
                  left: `${(product.nutrition.sugar.min / 15) * 100}%`,
                  width: `${((product.nutrition.sugar.max - product.nutrition.sugar.min) / 15) * 100}%`,
                  height: '100%',
                  background: '#c8e6c9',
                  borderRadius: '6px'
                }} />
                {/* Measured value marker */}
                <div style={{
                  position: 'absolute',
                  left: `${(parseFloat(measuredValue) / 15) * 100}%`,
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
            <NutrientBox label={t('productCard.calories')} value={product.nutrition.calories.value} unit={product.nutrition.calories.unit} icon="🔥" />
            <NutrientBox label={t('productCard.water')} value={product.nutrition.water.value} unit={product.nutrition.water.unit} icon="💧" />
            <NutrientBox label={t('productCard.fiber')} value={product.nutrition.fiber.value} unit={product.nutrition.fiber.unit} icon="🌾" />
            <NutrientBox label={t('productCard.vitaminC')} value={product.nutrition.vitaminC.value} unit={product.nutrition.vitaminC.unit} icon="🍊" />
          </div>
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
              📅 {t('productCard.seasonality')}
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
        {product.tipsKeys.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #eee'
          }}>
            <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem' }}>
              💡 {t('productCard.tips')}
            </h3>
            {product.tipsKeys.map((tipKey, i) => (
              <div key={i} style={{ 
                padding: '10px 0', 
                borderBottom: i < product.tipsKeys.length - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: '0.9rem',
                color: '#555'
              }}>
                {t(tipKey)}
              </div>
            ))}
          </div>
        )}

        {/* Curiosity */}
        {product.curiosityKey && (
          <div style={{
            background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px', color: '#f57f17', fontSize: '1rem' }}>
              🤓 {t('productCard.didYouKnow')}
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {t(product.curiosityKey)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
