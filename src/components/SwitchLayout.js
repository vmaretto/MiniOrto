// src/components/SwitchLayout.js
// Layout condiviso per tutte le schermate - branding SWITCH

import React from 'react';
import { useTranslation } from 'react-i18next';

// SWITCH brand colors
export const SWITCH_COLORS = {
  gold: '#FFC300',
  darkBlue: '#1E3A5F',
  green: '#28A745',
  lightBg: '#F8F9FA',
  white: '#FFFFFF'
};

function SwitchLayout({ children, title, subtitle, showLangToggle = true, compact = false }) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(newLang);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: `linear-gradient(180deg, ${SWITCH_COLORS.gold} 0%, ${SWITCH_COLORS.gold} ${compact ? '15%' : '25%'}, white ${compact ? '15%' : '25%'})`,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Header */}
      <header style={{
        background: SWITCH_COLORS.gold,
        padding: compact ? '12px 20px' : '20px',
        textAlign: 'center',
        width: '100%'
      }}>
        {showLangToggle && (
          <div style={{ textAlign: 'right', marginBottom: compact ? '4px' : '10px' }}>
            <button 
              onClick={toggleLanguage}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {i18n.language === 'it' ? '🇬🇧 EN' : '🇮🇹 IT'}
            </button>
          </div>
        )}

        <div style={{
          fontSize: '0.75rem',
          color: SWITCH_COLORS.darkBlue,
          marginBottom: '4px',
          fontWeight: '600',
          letterSpacing: '1px'
        }}>
          SWITCH PROJECT
        </div>
        
        {title && (
          <h1 style={{ 
            fontSize: compact ? '1.4rem' : '1.8rem', 
            margin: '0 0 4px 0',
            color: SWITCH_COLORS.darkBlue,
            fontWeight: 'bold'
          }}>
            {title}
          </h1>
        )}
        
        {subtitle && (
          <p style={{ 
            color: SWITCH_COLORS.darkBlue,
            opacity: 0.8,
            margin: 0,
            fontSize: '0.9rem'
          }}>
            {subtitle}
          </p>
        )}
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        margin: subtitle ? '16px 16px 20px' : '0 16px 20px',
        background: 'white',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1,
        maxWidth: '600px',
        width: 'calc(100% - 32px)',
        alignSelf: 'center'
      }}>
        {children}
      </main>

      {/* Footer - Compact SWITCH branding */}
      <footer style={{
        background: SWITCH_COLORS.darkBlue,
        padding: '20px',
        textAlign: 'center',
        marginTop: 'auto',
        width: '100%'
      }}>
        {/* Row 1: Logo + Nav Links (horizontal) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '12px'
        }}>
          <img 
            src="https://switchdiet.eu/wp-content/uploads/2023/03/H-white-logo_switch.png" 
            alt="SWITCH"
            style={{ height: '28px' }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <nav style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Food Hubs', url: 'https://switchdiet.eu/discover-our-food-hubs/' },
              { label: 'About', url: 'https://switchdiet.eu/about-switch-project/' },
              { label: 'News', url: 'https://switchdiet.eu/news-and-events/' },
              { label: 'Contact', url: 'https://switchdiet.eu/contact/' }
            ].map(item => (
              <a 
                key={item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'white', textDecoration: 'none', fontSize: '0.75rem', opacity: 0.9 }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Row 2: Social + Privacy (horizontal) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', gap: '12px', fontSize: '1rem' }}>
            <a href="https://twitter.com/switchdiet" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.8 }}>𝕏</a>
            <a href="https://www.linkedin.com/company/switchdiet/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.8 }}>in</a>
            <a href="https://www.instagram.com/switch.diet/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.8 }}>📷</a>
            <a href="https://www.youtube.com/@SWITCHDiet" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.8 }}>▶</a>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="https://switchdiet.eu/privacy-policy/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '0.65rem', opacity: 0.7 }}>Privacy Policy</a>
            <a href="https://switchdiet.eu/project-privacy-policy/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '0.65rem', opacity: 0.7 }}>Project Privacy</a>
          </div>
        </div>

        {/* Row 3: EU Badge + Project info (horizontal) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <img 
            src="https://switchdiet.eu/wp-content/uploads/2023/03/EN-Funded-by-the-EU-WHITE-Outline-1024x215.png"
            alt="Funded by EU"
            style={{ height: '28px' }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <span style={{ fontSize: '0.6rem', color: 'white', opacity: 0.7 }}>
            SWITCH Project 101060483 | HORIZON-FARM2FORK
          </span>
        </div>

        {/* Row 4: Disclaimer (compact) */}
        <p style={{ 
          fontSize: '0.5rem', 
          color: 'white', 
          opacity: 0.5,
          margin: 0,
          lineHeight: 1.4
        }}>
          Funded by the EU. Views expressed are those of the author(s) only.
        </p>
      </footer>
    </div>
  );
}

export default SwitchLayout;
