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

function ProductCard({ productName, measuredValue, measuredData, productImage, switchData }) {
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
  
  // Nutrition: SOLO dati DB SWITCH - niente dati inventati/AI
  const nutrition = {
    calories: switchData?.nutrition?.energy || null,
    protein: switchData?.nutrition?.proteins || null,
    carbs: switchData?.nutrition?.carbohydrates || null,
    fat: switchData?.nutrition?.fat || null,
    saturatedFat: switchData?.nutrition?.saturatedFat || null,
    fiber: switchData?.nutrition?.fiber || null,
    sugar: switchData?.nutrition?.soluble || null, // "soluble" = zuccheri nel DB SWITCH
  };
  
  // Use custom image if provided
  const displayImage = productImage || localProduct?.image || null;
  
  // Quality indicator removed - no longer using sugar min/max ranges
  const quality = null;
  
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
        {/* VALORI MISURATI (SCIO) - mostrati solo se disponibili */}
        {measuredData && (measuredData.calories || measuredData.water || measuredData.protein || measuredData.fat) && (
          <div style={{
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔬 {t('productCard.measuredValues', 'Valori Misurati')}
              <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 'normal' }}>
                ({t('productCard.fromScio', 'dal tuo prodotto')})
              </span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {measuredData.calories && (
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>🔥 Calorie</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{measuredData.calories} <span style={{ fontSize: '0.7rem' }}>kcal</span></div>
                </div>
              )}
              {measuredData.water && (
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>💧 Acqua</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{measuredData.water} <span style={{ fontSize: '0.7rem' }}>g</span></div>
                </div>
              )}
              {measuredData.protein && (
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>💪 Proteine</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{measuredData.protein} <span style={{ fontSize: '0.7rem' }}>g</span></div>
                </div>
              )}
              {measuredData.fat && (
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>🧈 Grassi</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{measuredData.fat} <span style={{ fontSize: '0.7rem' }}>g</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vecchia sezione SCIO singolo valore - manteniamo per °Brix se presente */}
        {measuredValue && !measuredData?.calories && (
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
          <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            📊 {t('productCard.nutritionalValues', 'Valori Nutrizionali')}
            <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'normal' }}>
              ({t('productCard.averageValues', 'valori medi')})
            </span>
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {nutrition.calories && <NutrientBox label={t('productCard.calories', 'Calorie')} value={nutrition.calories} unit="kcal/100g" icon="🔥" />}
            {nutrition.protein && <NutrientBox label={t('productCard.protein', 'Proteine')} value={nutrition.protein} unit="g" icon="💪" />}
            {nutrition.carbs && <NutrientBox label={t('productCard.carbs', 'Carboidrati')} value={nutrition.carbs} unit="g" icon="🍞" />}
            {nutrition.fat && <NutrientBox label={t('productCard.fat', 'Grassi')} value={nutrition.fat} unit="g" icon="🧈" />}
            {nutrition.fiber && <NutrientBox label={t('productCard.fiber', 'Fibre')} value={nutrition.fiber} unit="g" icon="🌾" />}
            {nutrition.sugar && <NutrientBox label={t('productCard.sugar', 'Zuccheri')} value={nutrition.sugar} unit="g" icon="🍬" />}
          </div>
          
          {/* Source indicator with matched item */}
          {switchData?.found && (
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#999', textAlign: 'center' }}>
              📊 {t('productCard.dataFor', 'Dati per:')} <strong style={{ color: '#1565c0' }}>{switchData.matchedItem}</strong>
              <div style={{ marginTop: '2px' }}>{t('productCard.source', 'Fonte: SWITCH Food Explorer Database')}</div>
            </div>
          )}
        </div>

        {/* Environmental Impact - inside Product Card */}
        {switchData?.found && switchData?.environmental && (
          <div style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#1565c0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🌍 {t('productCard.environmentalImpact', 'Impatto Ambientale')}
            </h3>

            {/* Environmental Score Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                background: switchData.environmental.environmentalScore === 'A' ? '#1b5e20' : 
                           switchData.environmental.environmentalScore === 'B' ? '#4caf50' :
                           switchData.environmental.environmentalScore === 'C' ? '#ffc107' :
                           switchData.environmental.environmentalScore === 'D' ? '#ff9800' : '#f44336',
                color: ['A', 'B', 'D', 'E'].includes(switchData.environmental.environmentalScore) ? '#fff' : '#000',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {switchData.environmental.environmentalScore}
              </div>
              <div style={{ marginLeft: '12px', textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
                  {t('productCard.envScore', 'Punteggio Ambientale')}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1565c0', fontWeight: '600' }}>
                  {switchData.matchedItem}
                </div>
              </div>
            </div>

            {/* Carbon and Water Footprint */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>🏭</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                  {switchData.environmental.carbonFootprint?.toFixed(2) || '—'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>kg CO₂e/kg</div>
                <div style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  marginTop: '6px',
                  background: switchData.environmental.carbonFootprintBanding?.includes('green') ? '#4caf50' : '#ffc107',
                  color: '#fff'
                }}>
                  {switchData.environmental.carbonFootprintImpact || 'N/A'}
                </div>
              </div>

              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>💧</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                  {switchData.environmental.waterFootprint?.toFixed(0) || '—'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>{t('productCard.litersPerKg', 'litri/kg')}</div>
                <div style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '10px',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  marginTop: '6px',
                  background: switchData.environmental.waterFootprintBanding?.includes('green') ? '#4caf50' : '#ffc107',
                  color: '#fff'
                }}>
                  {switchData.environmental.waterFootprintImpact || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

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
