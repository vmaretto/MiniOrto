// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './config/i18n';
import './App.css';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecognizeScreen from './screens/RecognizeScreen';
import QuizScreen from './screens/QuizScreen';
import ScanScreen from './screens/ScanScreen';
import SpectrometerScreen from './screens/SpectrometerScreen';
import ResultsScreen from './screens/ResultsScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminScreen from './screens/AdminScreen';
import ScanFlowScreen from './screens/ScanFlowScreen';
import EmbedProductScreen from './screens/EmbedProductScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import './screens/ScanFlowScreen.css';
import { initGA, trackPageView } from './utils/analytics';

// Initialize analytics on app load
initGA();

// Wrapper to track page views (footer now in SwitchLayout)
function AppContent({ children }) {
  const location = useLocation();
  
  // Track page views
  React.useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);
  
  return (
    <div className="App">
      <main className="App__content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/recognize" element={<RecognizeScreen />} />
          <Route path="/quiz" element={<QuizScreen />} />
          <Route path="/scan" element={<ScanScreen />} />
          <Route path="/scan-spectrometer" element={<SpectrometerScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="/scan-flow" element={<ScanFlowScreen />} />
          <Route path="/feedback" element={<FeedbackScreen />} />
          <Route path="/embed/product/:productId" element={<EmbedProductScreen />} />
        </Routes>
      </AppContent>
    </Router>
  );
}

export default App;
