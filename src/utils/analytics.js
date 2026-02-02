// src/utils/analytics.js
// Google Analytics 4 helper functions

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize GA4
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  // Don't initialize if no valid measurement ID
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.log('Analytics: No measurement ID configured');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // We'll track manually
  });

  console.log('Analytics initialized:', GA_MEASUREMENT_ID);
};

// Track page view
export const trackPageView = (path, title) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title
  });
};

// Track custom event
export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, params);
};

// Common events
export const trackScanStart = (productName, method) => {
  trackEvent('scan_start', {
    product_name: productName,
    scan_method: method // 'direct' or 'screenshot'
  });
};

export const trackScanComplete = (productName, success, values = {}) => {
  trackEvent('scan_complete', {
    product_name: productName,
    success: success,
    sugar_value: values.sugar,
    brix_value: values.brix
  });
};

export const trackProductRecognized = (productName, confidence) => {
  trackEvent('product_recognized', {
    product_name: productName,
    confidence: confidence
  });
};

export const trackEnvironmentalDataViewed = (productName, score) => {
  trackEvent('environmental_data_viewed', {
    product_name: productName,
    environmental_score: score
  });
};

export const trackFeedbackSubmitted = (rating, spectrometerUseful) => {
  trackEvent('feedback_submitted', {
    overall_rating: rating,
    spectrometer_useful: spectrometerUseful
  });
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackScanStart,
  trackScanComplete,
  trackProductRecognized,
  trackEnvironmentalDataViewed,
  trackFeedbackSubmitted
};
