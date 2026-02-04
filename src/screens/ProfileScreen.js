// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SwitchLayout, { SWITCH_COLORS } from '../components/SwitchLayout';
import GlobalProgress from '../components/GlobalProgress';

function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language || 'it';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const [formData, setFormData] = useState(() => {
    // Restore previously saved data when navigating back
    const saved = sessionStorage.getItem('profileData');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return {
      age: '',
      gender: '',
      profession: '',
      consumption: '',
      purchaseChannel: '',
      sustainability: '',
      labelReading: ''
    };
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.age || !formData.gender || !formData.profession || !formData.consumption || 
        !formData.purchaseChannel || !formData.sustainability || !formData.labelReading) {
      alert(t('common.error') + ': ' + t('profile.fillAll'));
      return;
    }

    sessionStorage.setItem('profileData', JSON.stringify(formData));
    navigate('/recognize');
  };

  const isFormValid = formData.age && formData.gender && formData.profession && formData.consumption && 
                      formData.purchaseChannel && formData.sustainability && formData.labelReading;

  const RadioGroup = ({ name, options, value, onChange }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(option => (
        <label 
          key={option.value}
          style={{
            flex: '1 1 auto',
            minWidth: '80px',
            padding: '12px 8px',
            borderRadius: '10px',
            border: value === option.value ? `2px solid ${SWITCH_COLORS.gold}` : '2px solid #e5e7eb',
            background: value === option.value ? `${SWITCH_COLORS.gold}15` : 'white',
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: value === option.value ? '600' : '400',
            color: value === option.value ? SWITCH_COLORS.darkBlue : '#666',
            transition: 'all 0.2s'
          }}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            style={{ display: 'none' }}
          />
          {option.label}
        </label>
      ))}
    </div>
  );

  return (
    <SwitchLayout 
      title={t('profile.title')}
      subtitle={language === 'it' ? 'Raccontaci di te' : 'Tell us about yourself'}
      compact={true}
    >
      <GlobalProgress currentStep="profile" language={language} />
      
      <form onSubmit={handleSubmit}>
        {/* Age */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: SWITCH_COLORS.darkBlue 
          }}>
            {t('profile.age')}
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            min="1"
            max="120"
            placeholder="25"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '10px',
              border: '2px solid #e5e7eb',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Gender */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: SWITCH_COLORS.darkBlue 
          }}>
            {t('profile.gender')}
          </label>
          <RadioGroup
            name="gender"
            value={formData.gender}
            onChange={(v) => handleChange('gender', v)}
            options={[
              { value: 'M', label: t('profile.gender.m') },
              { value: 'F', label: t('profile.gender.f') },
              { value: 'NB', label: t('profile.gender.nb') },
              { value: 'Other', label: t('profile.gender.other') },
              { value: 'PNR', label: t('profile.gender.pnr') },
            ]}
          />
        </div>

        {/* Profession */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: SWITCH_COLORS.darkBlue 
          }}>
            {t('profile.profession')}
          </label>
          <select
            value={formData.profession}
            onChange={(e) => handleChange('profession', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              borderRadius: '10px',
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: SWITCH_COLORS.darkBlue 
          }}>
            {t('profile.consumption')}
          </label>
          <RadioGroup
            name="consumption"
            value={formData.consumption}
            onChange={(v) => handleChange('consumption', v)}
            options={[
              { value: 'daily', label: t('profile.consumption.daily') },
              { value: 'weekly', label: t('profile.consumption.weekly') },
              { value: 'rarely', label: t('profile.consumption.rarely') },
            ]}
          />
        </div>

        {/* Purchase Channel */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: SWITCH_COLORS.darkBlue 
          }}>
            {t('profile.purchaseChannel')}
          </label>
          <RadioGroup
            name="purchaseChannel"
            value={formData.purchaseChannel}
            onChange={(v) => handleChange('purchaseChannel', v)}
            options={[
              { value: 'supermarket', label: t('profile.purchaseChannel.supermarket') },
              { value: 'local', label: t('profile.purchaseChannel.local') },
              { value: 'online', label: t('profile.purchaseChannel.online') },
              { value: 'mixed', label: t('profile.purchaseChannel.mixed') },
            ]}
          />
        </div>

        {/* Sustainability */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: SWITCH_COLORS.darkBlue 
          }}>
            {t('profile.sustainability')}
          </label>
          <RadioGroup
            name="sustainability"
            value={formData.sustainability}
            onChange={(v) => handleChange('sustainability', v)}
            options={[
              { value: 'very', label: t('profile.sustainability.very') },
              { value: 'somewhat', label: t('profile.sustainability.somewhat') },
              { value: 'little', label: t('profile.sustainability.little') },
              { value: 'not', label: t('profile.sustainability.not') },
            ]}
          />
        </div>

        {/* Label Reading */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: SWITCH_COLORS.darkBlue 
          }}>
            {t('profile.labelReading')}
          </label>
          <RadioGroup
            name="labelReading"
            value={formData.labelReading}
            onChange={(v) => handleChange('labelReading', v)}
            options={[
              { value: 'always', label: t('profile.labelReading.always') },
              { value: 'often', label: t('profile.labelReading.often') },
              { value: 'rarely', label: t('profile.labelReading.rarely') },
              { value: 'never', label: t('profile.labelReading.never') },
            ]}
          />
        </div>

        <button 
          type="submit" 
          disabled={!isFormValid}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'white',
            background: isFormValid ? SWITCH_COLORS.green : '#ccc',
            border: 'none',
            borderRadius: '12px',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
            boxShadow: isFormValid ? `0 4px 12px ${SWITCH_COLORS.green}50` : 'none'
          }}
        >
          {t('profile.next')} →
        </button>
      </form>
    </SwitchLayout>
  );
}

export default ProfileScreen;
