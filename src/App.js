// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './config/i18n';
import './App.css';

import FooterSwitch from './components/FooterSwitch';

// Wrapper to conditionally show footer
function AppContent({ children }) {
  const location = useLocation();
  const isEmbed = location.pathname.startsWith('/embed');
  
  return (
    <div className="App">
      <main className="App__content">
        {children}
      </main>
      {!isEmbed && <FooterSwitch />}
    </div>
  );
}

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecognizeScreen from './screens/RecognizeScreen';
import ScanScreen from './screens/ScanScreen';
import SpectrometerScreen from './screens/SpectrometerScreen';
import ResultsScreen from './screens/ResultsScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminScreen from './screens/AdminScreen';
import ScanFlowScreen from './screens/ScanFlowScreen';
import EmbedProductScreen from './screens/EmbedProductScreen';
import './screens/ScanFlowScreen.css';

function App() {
  return (
    <Router>
      <AppContent>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/recognize" element={<RecognizeScreen />} />
          <Route path="/scan" element={<ScanScreen />} />
          <Route path="/scan-spectrometer" element={<SpectrometerScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="/scan-flow" element={<ScanFlowScreen />} />
          <Route path="/embed/product/:productId" element={<EmbedProductScreen />} />
        </Routes>
      </AppContent>
    </Router>
  );
}

export default App;
