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
      background: `linear-gradient(180deg, ${SWITCH_COLORS.gold} 0%, ${SWITCH_COLORS.gold} ${compact ? '15%' : '25%'}, white ${compact ? '15%' : '25%'})`,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: SWITCH_COLORS.gold,
        padding: compact ? '12px 20px' : '20px',
        textAlign: 'center'
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
        margin: '-20px 16px 20px',
        background: 'white',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: SWITCH_COLORS.darkBlue,
        padding: '20px',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <img 
          src="https://switchdiet.eu/wp-content/uploads/2022/12/logo-white-1.svg" 
          alt="Switch Diet"
          style={{ height: '28px', marginBottom: '8px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginBottom: '12px',
          flexWrap: 'wrap'
        }}>
          {['FOOD HUBS', 'ABOUT', 'NEWS', 'CONTACTS'].map(item => (
            <a 
              key={item}
              href={`https://switchdiet.eu/${item.toLowerCase().replace(' ', '-')}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: '0.7rem',
                opacity: 0.8
              }}
            >
              {item}
            </a>
          ))}
        </nav>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px',
          marginBottom: '12px'
        }}>
          {[
            { name: 'Twitter', url: 'https://twitter.com/switchdiet' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/company/switchdiet/' },
            { name: 'Instagram', url: 'https://www.instagram.com/switch.diet/' }
          ].map(social => (
            <a 
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: 'white', 
                fontSize: '0.7rem',
                opacity: 0.7
              }}
            >
              {social.name}
            </a>
          ))}
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <img 
            src="https://switchdiet.eu/wp-content/uploads/2022/12/EU-flag.png"
            alt="EU Funded"
            style={{ height: '24px' }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <div style={{ fontSize: '0.6rem', color: 'white', opacity: 0.7, textAlign: 'left' }}>
            SWITCH – Project 101060483<br/>
            Horizon Europe - FARM2FORK
          </div>
        </div>

        <p style={{ 
          fontSize: '0.55rem', 
          color: 'white', 
          opacity: 0.5,
          margin: 0,
          lineHeight: 1.4
        }}>
          Funded by the European Union. Views expressed are those of the author(s) only.
        </p>
      </footer>
    </div>
  );
}

export default SwitchLayout;
