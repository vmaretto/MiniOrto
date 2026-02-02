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

      {/* Footer - Official SWITCH branding */}
      <footer style={{
        background: SWITCH_COLORS.darkBlue,
        padding: '30px 20px',
        textAlign: 'center',
        marginTop: 'auto',
        width: '100%'
      }}>
        {/* Logo */}
        <img 
          src="https://switchdiet.eu/wp-content/uploads/2023/03/H-white-logo_switch.png" 
          alt="SWITCH"
          style={{ height: '40px', marginBottom: '20px' }}
          onError={(e) => e.target.style.display = 'none'}
        />
        
        {/* Navigation Links - Vertical */}
        <nav style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px', 
          marginBottom: '20px'
        }}>
          {[
            { label: 'FOOD HUBS', url: 'https://switchdiet.eu/food-hubs/' },
            { label: 'ABOUT', url: 'https://switchdiet.eu/about/' },
            { label: 'NEWS & EVENTS', url: 'https://switchdiet.eu/news/' },
            { label: 'CONTACTS', url: 'https://switchdiet.eu/contacts/' }
          ].map(item => (
            <a 
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontSize: '0.8rem',
                fontWeight: '500'
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Follow us */}
        <p style={{ 
          color: 'white', 
          fontSize: '0.85rem', 
          marginBottom: '12px',
          fontWeight: '500'
        }}>
          Follow us
        </p>
        
        {/* Social Icons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '16px',
          marginBottom: '20px',
          fontSize: '1.4rem'
        }}>
          <a href="https://twitter.com/switchdiet" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>𝕏</a>
          <a href="https://www.linkedin.com/company/switchdiet/" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>in</a>
          <a href="https://www.instagram.com/switch.diet/" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>📷</a>
          <a href="https://www.facebook.com/SWITCHdiet" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>f</a>
          <a href="https://www.tiktok.com/@switch.diet" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>♪</a>
          <a href="https://www.youtube.com/@SWITCHDiet" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>▶</a>
        </div>

        {/* Privacy Links */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          <a 
            href="https://switchdiet.eu/privacy-and-cookie-policy/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white', fontSize: '0.7rem', textDecoration: 'underline' }}
          >
            Privacy and Cookie Policy
          </a>
          <a 
            href="https://switchdiet.eu/project-privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white', fontSize: '0.7rem', textDecoration: 'underline' }}
          >
            Project Privacy Policy
          </a>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)', margin: '20px 0' }} />

        {/* EU Badge */}
        <div style={{ marginBottom: '12px' }}>
          <img 
            src="https://switchdiet.eu/wp-content/uploads/2023/03/EN-Funded-by-the-EU-WHITE-Outline-1024x215.png"
            alt="Funded by the European Union"
            style={{ height: '40px' }}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>

        {/* Project Info */}
        <p style={{ 
          fontSize: '0.7rem', 
          color: 'white', 
          margin: '0 0 8px 0',
          fontWeight: '500'
        }}>
          SWITCH – Project number: 101060483
        </p>
        
        <p style={{ 
          fontSize: '0.6rem', 
          color: 'white', 
          opacity: 0.8,
          margin: '0 0 12px 0'
        }}>
          Call: HORIZON-CL6-2021-FARM2FORK-01-15: Transition to sustainable and healthy dietary behaviour
        </p>

        {/* Full Disclaimer */}
        <p style={{ 
          fontSize: '0.55rem', 
          color: 'white', 
          opacity: 0.6,
          margin: 0,
          lineHeight: 1.5,
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union. Neither the European Union nor the granting authority can be held responsible for them.
        </p>
      </footer>
    </div>
  );
}

export default SwitchLayout;
