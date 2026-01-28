// src/config/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  it: {
    translation: {
      // Welcome Screen
      "welcome.title": "MINI-ORTO",
      "welcome.subtitle": "Analizza i valori nutrizionali con lo spettrometro SCIO",
      "welcome.howItWorks": "Come funziona",
      "welcome.step1": "Misura l'alimento con SCIO",
      "welcome.step2": "Fai uno screenshot dall'app SCIO",
      "welcome.step3": "Carica lo screenshot qui",
      "welcome.step4": "Visualizza e invia i dati",
      "welcome.privacy": "Tutti i dati saranno raccolti in forma anonima e utilizzati esclusivamente per uno studio europeo sulle abitudini alimentari sostenibili, nel rispetto della normativa sulla privacy.",
      "welcome.start": "Inizia",
      
      // Profile Form
      "profile.title": "Parlaci di te",
      "profile.age": "Età",
      "profile.gender": "Sesso",
      "profile.gender.f": "Femmina",
      "profile.gender.m": "Maschio",
      "profile.gender.other": "Altro",
      "profile.profession": "Professione",
      "profile.profession.select": "Seleziona...",
      "profile.profession.student": "Studente",
      "profile.profession.employee": "Dipendente",
      "profile.profession.consultant": "Consulente",
      "profile.profession.entrepreneur": "Imprenditore",
      "profile.profession.teacher": "Insegnante",
      "profile.profession.retired": "Pensionato",
      "profile.profession.homemaker": "Casalinga/o",
      "profile.profession.healthcare": "Operatore sanitario",
      "profile.profession.researcher": "Ricercatore",
      "profile.profession.other": "Altro",
      "profile.consumption": "Consumi abitualmente frutta e verdura?",
      "profile.consumption.daily": "Sì, ogni giorno",
      "profile.consumption.weekly": "Qualche volta a settimana",
      "profile.consumption.rarely": "Raramente",
      "profile.fillAll": "Compila tutti i campi",
      // SWITCH profiling
      "profile.purchaseChannel": "Dove acquisti principalmente frutta e verdura?",
      "profile.purchaseChannel.supermarket": "Supermercato",
      "profile.purchaseChannel.local": "Mercato / filiera corta",
      "profile.purchaseChannel.online": "Online",
      "profile.purchaseChannel.mixed": "Un po' di tutto",
      "profile.sustainability": "Quanto è importante la sostenibilità nelle tue scelte alimentari?",
      "profile.sustainability.very": "Molto importante",
      "profile.sustainability.somewhat": "Abbastanza",
      "profile.sustainability.little": "Poco",
      "profile.sustainability.not": "Per niente",
      "profile.labelReading": "Leggi le etichette nutrizionali quando fai la spesa?",
      "profile.labelReading.always": "Sempre",
      "profile.labelReading.often": "Spesso",
      "profile.labelReading.rarely": "Raramente",
      "profile.labelReading.never": "Mai",
      "profile.next": "Avanti",
      
      // Scan Screen
      "scan.title": "Carica Screenshot SCIO",
      "scan.instructions": "Fai uno screenshot dall'app SCIO dopo aver misurato l'alimento e caricalo qui.",
      "scan.tapToUpload": "Tocca per caricare l'immagine",
      "scan.hint": "Suggerimento",
      "scan.hintText": "Assicurati che i valori nutrizionali siano ben visibili nello screenshot.",
      "scan.analyze": "Analizza immagine",
      "scan.analyzing": "Analisi in corso...",
      "scan.processing": "Estrazione valori nutrizionali...",
      "scan.noImage": "Seleziona un'immagine prima",
      "scan.error": "Errore durante l'analisi. Riprova.",
      
      // Results Screen
      "results.title": "Risultati Analisi",
      "results.noData": "Nessun dato disponibile",
      "results.goToScan": "Vai alla scansione",
      "results.nutritionValues": "Valori Nutrizionali",
      "results.calories": "Calorie",
      "results.carbs": "Carboidrati",
      "results.sugar": "Zuccheri",
      "results.fiber": "Fibre",
      "results.protein": "Proteine",
      "results.fat": "Grassi",
      "results.water": "Acqua",
      "results.portion": "Porzione",
      "results.confidence.high": "Alta affidabilità",
      "results.confidence.medium": "Media affidabilità",
      "results.confidence.low": "Bassa affidabilità - verifica i dati",
      "results.sendToMiniOrto": "Invia a Mini-Orto",
      "results.sending": "Invio in corso...",
      "results.sentSuccess": "Dati inviati con successo!",
      "results.sendError": "Errore durante l'invio. Riprova.",
      "results.newScan": "Nuova scansione",
      "results.startOver": "Ricomincia da capo",
      
      // Dashboard
      "dashboard.title": "MINI-ORTO - STATISTICHE",
      "dashboard.participants": "Partecipanti",
      "dashboard.scans": "Scansioni totali",
      "dashboard.avgCalories": "Calorie medie",
      
      // Common
      "common.yes": "Sì",
      "common.no": "No",
      "common.back": "Indietro",
      "common.next": "Avanti",
      "common.loading": "Caricamento...",
      "common.error": "Errore",
      "common.success": "Successo!"
    }
  },
  en: {
    translation: {
      // Welcome Screen
      "welcome.title": "MINI-ORTO",
      "welcome.subtitle": "Analyze nutritional values with the SCIO spectrometer",
      "welcome.howItWorks": "How it works",
      "welcome.step1": "Measure the food with SCIO",
      "welcome.step2": "Take a screenshot from the SCIO app",
      "welcome.step3": "Upload the screenshot here",
      "welcome.step4": "View and send the data",
      "welcome.privacy": "All data will be collected anonymously and used exclusively for a European study on sustainable eating habits, in compliance with privacy regulations.",
      "welcome.start": "Start",
      
      // Profile Form
      "profile.title": "Tell us about you",
      "profile.age": "Age",
      "profile.gender": "Gender",
      "profile.gender.f": "Female",
      "profile.gender.m": "Male",
      "profile.gender.other": "Other",
      "profile.profession": "Profession",
      "profile.profession.select": "Select...",
      "profile.profession.student": "Student",
      "profile.profession.employee": "Employee",
      "profile.profession.consultant": "Consultant",
      "profile.profession.entrepreneur": "Entrepreneur",
      "profile.profession.teacher": "Teacher",
      "profile.profession.retired": "Retired",
      "profile.profession.homemaker": "Homemaker",
      "profile.profession.healthcare": "Healthcare worker",
      "profile.profession.researcher": "Researcher",
      "profile.profession.other": "Other",
      "profile.consumption": "Do you regularly consume fruits and vegetables?",
      "profile.consumption.daily": "Yes, every day",
      "profile.consumption.weekly": "A few times a week",
      "profile.consumption.rarely": "Rarely",
      "profile.fillAll": "Please fill all fields",
      // SWITCH profiling
      "profile.purchaseChannel": "Where do you mainly buy fruits and vegetables?",
      "profile.purchaseChannel.supermarket": "Supermarket",
      "profile.purchaseChannel.local": "Local market / short chain",
      "profile.purchaseChannel.online": "Online",
      "profile.purchaseChannel.mixed": "A bit of everything",
      "profile.sustainability": "How important is sustainability in your food choices?",
      "profile.sustainability.very": "Very important",
      "profile.sustainability.somewhat": "Somewhat",
      "profile.sustainability.little": "A little",
      "profile.sustainability.not": "Not at all",
      "profile.labelReading": "Do you read nutritional labels when shopping?",
      "profile.labelReading.always": "Always",
      "profile.labelReading.often": "Often",
      "profile.labelReading.rarely": "Rarely",
      "profile.labelReading.never": "Never",
      "profile.next": "Next",
      
      // Scan Screen
      "scan.title": "Upload SCIO Screenshot",
      "scan.instructions": "Take a screenshot from the SCIO app after measuring the food and upload it here.",
      "scan.tapToUpload": "Tap to upload image",
      "scan.hint": "Tip",
      "scan.hintText": "Make sure the nutritional values are clearly visible in the screenshot.",
      "scan.analyze": "Analyze image",
      "scan.analyzing": "Analyzing...",
      "scan.processing": "Extracting nutritional values...",
      "scan.noImage": "Select an image first",
      "scan.error": "Error during analysis. Please try again.",
      
      // Results Screen
      "results.title": "Analysis Results",
      "results.noData": "No data available",
      "results.goToScan": "Go to scan",
      "results.nutritionValues": "Nutritional Values",
      "results.calories": "Calories",
      "results.carbs": "Carbohydrates",
      "results.sugar": "Sugar",
      "results.fiber": "Fiber",
      "results.protein": "Protein",
      "results.fat": "Fat",
      "results.water": "Water",
      "results.portion": "Portion",
      "results.confidence.high": "High confidence",
      "results.confidence.medium": "Medium confidence",
      "results.confidence.low": "Low confidence - please verify",
      "results.sendToMiniOrto": "Send to Mini-Orto",
      "results.sending": "Sending...",
      "results.sentSuccess": "Data sent successfully!",
      "results.sendError": "Error sending data. Please try again.",
      "results.newScan": "New scan",
      "results.startOver": "Start over",
      
      // Dashboard
      "dashboard.title": "MINI-ORTO - STATISTICS",
      "dashboard.participants": "Participants",
      "dashboard.scans": "Total scans",
      "dashboard.avgCalories": "Average calories",
      
      // Common
      "common.yes": "Yes",
      "common.no": "No",
      "common.back": "Back",
      "common.next": "Next",
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success!"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'it',
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
