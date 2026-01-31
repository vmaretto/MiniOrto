// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ProfileScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    profession: '',
    consumption: '',
    // SWITCH profiling
    purchaseChannel: '',
    sustainability: '',
    labelReading: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.age || !formData.gender || !formData.profession || !formData.consumption || 
        !formData.purchaseChannel || !formData.sustainability || !formData.labelReading) {
      alert(t('common.error') + ': ' + t('profile.fillAll'));
      return;
    }

    // Store profile data in sessionStorage
    sessionStorage.setItem('profileData', JSON.stringify(formData));
    
    // Navigate to recognize product first
    navigate('/recognize');
  };

  const isFormValid = formData.age && formData.gender && formData.profession && formData.consumption && 
                      formData.purchaseChannel && formData.sustainability && formData.labelReading;

  return (
    <div className="screen">
      <div className="card">
        <h2>{t('profile.title')}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Age */}
          <div className="form-group">
            <label className="form-label">{t('profile.age')}</label>
            <input
              type="number"
              className="form-input"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              min="1"
              max="120"
              placeholder="25"
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">{t('profile.gender')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.gender === 'M' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={formData.gender === 'M'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                {t('profile.gender.m')}
              </label>
              <label className={`radio-option ${formData.gender === 'F' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={formData.gender === 'F'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                {t('profile.gender.f')}
              </label>
              <label className={`radio-option ${formData.gender === 'NB' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="NB"
                  checked={formData.gender === 'NB'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                {t('profile.gender.nb')}
              </label>
              <label className={`radio-option ${formData.gender === 'Other' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={formData.gender === 'Other'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                {t('profile.gender.other')}
              </label>
              <label className={`radio-option ${formData.gender === 'PNR' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="PNR"
                  checked={formData.gender === 'PNR'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                {t('profile.gender.pnr')}
              </label>
            </div>
          </div>

          {/* Profession */}
          <div className="form-group">
            <label className="form-label">{t('profile.profession')}</label>
            <select
              className="form-input"
              value={formData.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              style={{
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">{t('profile.profession.select')}</option>
              <option value="student">{t('profile.profession.student')}</option>
              <option value="employee">{t('profile.profession.employee')}</option>
              <option value="consultant">{t('profile.profession.consultant')}</option>
              <option value="entrepreneur">{t('profile.profession.entrepreneur')}</option>
              <option value="teacher">{t('profile.profession.teacher')}</option>
              <option value="retired">{t('profile.profession.retired')}</option>
              <option value="homemaker">{t('profile.profession.homemaker')}</option>
              <option value="healthcare">{t('profile.profession.healthcare')}</option>
              <option value="researcher">{t('profile.profession.researcher')}</option>
              <option value="other">{t('profile.profession.other')}</option>
            </select>
          </div>

          {/* Fruit/Vegetable Consumption */}
          <div className="form-group">
            <label className="form-label">{t('profile.consumption')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.consumption === 'daily' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="consumption"
                  value="daily"
                  checked={formData.consumption === 'daily'}
                  onChange={(e) => handleChange('consumption', e.target.value)}
                />
                {t('profile.consumption.daily')}
              </label>
              <label className={`radio-option ${formData.consumption === 'weekly' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="consumption"
                  value="weekly"
                  checked={formData.consumption === 'weekly'}
                  onChange={(e) => handleChange('consumption', e.target.value)}
                />
                {t('profile.consumption.weekly')}
              </label>
              <label className={`radio-option ${formData.consumption === 'rarely' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="consumption"
                  value="rarely"
                  checked={formData.consumption === 'rarely'}
                  onChange={(e) => handleChange('consumption', e.target.value)}
                />
                {t('profile.consumption.rarely')}
              </label>
            </div>
          </div>

          {/* SWITCH: Purchase Channel */}
          <div className="form-group">
            <label className="form-label">{t('profile.purchaseChannel')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.purchaseChannel === 'supermarket' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="purchaseChannel"
                  value="supermarket"
                  checked={formData.purchaseChannel === 'supermarket'}
                  onChange={(e) => handleChange('purchaseChannel', e.target.value)}
                />
                {t('profile.purchaseChannel.supermarket')}
              </label>
              <label className={`radio-option ${formData.purchaseChannel === 'local' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="purchaseChannel"
                  value="local"
                  checked={formData.purchaseChannel === 'local'}
                  onChange={(e) => handleChange('purchaseChannel', e.target.value)}
                />
                {t('profile.purchaseChannel.local')}
              </label>
              <label className={`radio-option ${formData.purchaseChannel === 'online' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="purchaseChannel"
                  value="online"
                  checked={formData.purchaseChannel === 'online'}
                  onChange={(e) => handleChange('purchaseChannel', e.target.value)}
                />
                {t('profile.purchaseChannel.online')}
              </label>
              <label className={`radio-option ${formData.purchaseChannel === 'mixed' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="purchaseChannel"
                  value="mixed"
                  checked={formData.purchaseChannel === 'mixed'}
                  onChange={(e) => handleChange('purchaseChannel', e.target.value)}
                />
                {t('profile.purchaseChannel.mixed')}
              </label>
            </div>
          </div>

          {/* SWITCH: Sustainability importance */}
          <div className="form-group">
            <label className="form-label">{t('profile.sustainability')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.sustainability === 'very' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="sustainability"
                  value="very"
                  checked={formData.sustainability === 'very'}
                  onChange={(e) => handleChange('sustainability', e.target.value)}
                />
                {t('profile.sustainability.very')}
              </label>
              <label className={`radio-option ${formData.sustainability === 'somewhat' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="sustainability"
                  value="somewhat"
                  checked={formData.sustainability === 'somewhat'}
                  onChange={(e) => handleChange('sustainability', e.target.value)}
                />
                {t('profile.sustainability.somewhat')}
              </label>
              <label className={`radio-option ${formData.sustainability === 'little' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="sustainability"
                  value="little"
                  checked={formData.sustainability === 'little'}
                  onChange={(e) => handleChange('sustainability', e.target.value)}
                />
                {t('profile.sustainability.little')}
              </label>
              <label className={`radio-option ${formData.sustainability === 'not' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="sustainability"
                  value="not"
                  checked={formData.sustainability === 'not'}
                  onChange={(e) => handleChange('sustainability', e.target.value)}
                />
                {t('profile.sustainability.not')}
              </label>
            </div>
          </div>

          {/* SWITCH: Label reading */}
          <div className="form-group">
            <label className="form-label">{t('profile.labelReading')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.labelReading === 'always' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="labelReading"
                  value="always"
                  checked={formData.labelReading === 'always'}
                  onChange={(e) => handleChange('labelReading', e.target.value)}
                />
                {t('profile.labelReading.always')}
              </label>
              <label className={`radio-option ${formData.labelReading === 'often' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="labelReading"
                  value="often"
                  checked={formData.labelReading === 'often'}
                  onChange={(e) => handleChange('labelReading', e.target.value)}
                />
                {t('profile.labelReading.often')}
              </label>
              <label className={`radio-option ${formData.labelReading === 'rarely' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="labelReading"
                  value="rarely"
                  checked={formData.labelReading === 'rarely'}
                  onChange={(e) => handleChange('labelReading', e.target.value)}
                />
                {t('profile.labelReading.rarely')}
              </label>
              <label className={`radio-option ${formData.labelReading === 'never' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="labelReading"
                  value="never"
                  checked={formData.labelReading === 'never'}
                  onChange={(e) => handleChange('labelReading', e.target.value)}
                />
                {t('profile.labelReading.never')}
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
            {t('profile.next')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileScreen;
