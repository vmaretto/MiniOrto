// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './config/i18n';
import './App.css';

import FooterSwitch from './components/FooterSwitch';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecognizeScreen from './screens/RecognizeScreen';
import ScanScreen from './screens/ScanScreen';
import SpectrometerScreen from './screens/SpectrometerScreen';
import ResultsScreen from './screens/ResultsScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminScreen from './screens/AdminScreen';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="App__content">
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/recognize" element={<RecognizeScreen />} />
            <Route path="/scan" element={<ScanScreen />} />
            <Route path="/scan-spectrometer" element={<SpectrometerScreen />} />
            <Route path="/results" element={<ResultsScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
          </Routes>
        </main>
        <FooterSwitch />
      </div>
    </Router>
  );
}

export default App;
