import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import styled, { keyframes, createGlobalStyle, css } from 'styled-components';
import { FaUniversalAccess, FaCog, FaSave, FaUndo, FaVolumeUp } from 'react-icons/fa';
import { MdHighQuality, MdContrast, MdTextFields, MdLink, MdMouse } from 'react-icons/md';

// Create Context
const AccessibilityContext = createContext();

// Accessibility Provider Component
const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      highContrast: false,
      textSize: 'medium',
      voiceNavigation: false,
      grayscale: false,
      linkUnderline: true,
      largeCursor: false,
      reducedMotion: false,
      readingGuide: false,
      highlightLinks: false,
      darkMode: false,
      colorBlindMode: 'none',
      animationSpeed: 1.5
    };
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [voiceMessage, setVoiceMessage] = useState('');

  // Apply settings to document body
  useEffect(() => {
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('grayscale', settings.grayscale);
    document.body.classList.toggle('link-underline', settings.linkUnderline);
    document.body.classList.toggle('large-cursor', settings.largeCursor);
    document.body.classList.toggle('reduced-motion', settings.reducedMotion);
    document.body.classList.toggle('reading-guide', settings.readingGuide);
    document.body.classList.toggle('highlight-links', settings.highlightLinks);
    document.body.classList.toggle('dark-mode', settings.darkMode);
    
    // Color blind modes
    const colorModes = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
    document.body.classList.remove(...colorModes);
    if (settings.colorBlindMode !== 'none') {
      document.body.classList.add(settings.colorBlindMode);
    }
    
    // Text size
    document.body.classList.remove('text-small', 'text-medium', 'text-large');
    document.body.classList.add(`text-${settings.textSize}`);

    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  // Voice navigation
  useEffect(() => {
    if (settings.voiceNavigation && voiceMessage) {
      const utterance = new SpeechSynthesisUtterance(voiceMessage);
      window.speechSynthesis.speak(utterance);
      setVoiceMessage('');
    }
  }, [voiceMessage, settings.voiceNavigation]);

  // Handle Escape key to close panel
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isPanelOpen) {
        setIsPanelOpen(false);
        setVoiceMessage('Closing accessibility panel');
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isPanelOpen]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings({
      highContrast: false,
      textSize: 'medium',
      voiceNavigation: false,
      grayscale: false,
      linkUnderline: true,
      largeCursor: false,
      reducedMotion: false,
      readingGuide: false,
      highlightLinks: false,
      darkMode: false,
      colorBlindMode: 'none',
      animationSpeed: 1.5
    });
    setVoiceMessage('Settings reset to defaults');
  }, []);

  // Save current settings to named profile
  const saveProfile = useCallback((profileName) => {
    const profiles = JSON.parse(localStorage.getItem('accessibilityProfiles') || '{}');
    profiles[profileName] = settings;
    localStorage.setItem('accessibilityProfiles', JSON.stringify(profiles));
    setVoiceMessage(`Settings saved as "${profileName}" profile`);
  }, [settings]);

  // Load settings from named profile
  const loadProfile = useCallback((profileName) => {
    const profiles = JSON.parse(localStorage.getItem('accessibilityProfiles') || '{}');
    if (profiles[profileName]) {
      setSettings(profiles[profileName]);
      setVoiceMessage(`Loaded "${profileName}" profile`);
    }
  }, []);

  const value = {
    settings,
    setSettings,
    isPanelOpen,
    setIsPanelOpen,
    activeTab,
    setActiveTab,
    resetSettings,
    saveProfile,
    loadProfile,
    setVoiceMessage
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <GlobalAccessibilityStyles settings={settings} />
      {children}
      {isPanelOpen && (
        <ModalOverlay>
          <SettingsPanel />
        </ModalOverlay>
      )}
    </AccessibilityContext.Provider>
  );
};

// Custom hook for accessibility context
const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Global styles for accessibility features
const GlobalAccessibilityStyles = createGlobalStyle`
  body {
    transition: 
      background-color 0.3s ease, 
      color 0.3s ease,
      filter 0.5s ease;
  }

  body.high-contrast {
    --bg-color: #000;
    --text-color: #FFF;
    --accent-color: #FFFF00;
    background-color: var(--bg-color);
    color: var(--text-color);
    
    a {
      color: #00FFFF;
    }
  }

  body.grayscale {
    filter: grayscale(100%);
  }

  body.link-underline a {
    text-decoration: underline !important;
  }

  body.highlight-links a {
    background-color: rgba(255, 255, 0, 0.3);
    padding: 2px 4px;
    border-radius: 3px;
  }

  body.large-cursor {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='10' fill='%23000'/%3E%3C/svg%3E") 16 16, auto;
    
    button, a {
      cursor: inherit;
    }
  }

  body.text-small {
    font-size: 14px;
  }

  body.text-medium {
    font-size: 16px;
  }

  body.text-large {
    font-size: 18px;
  }

  body.reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  body.reading-guide {
    position: relative;
    
    &::after {
      content: '';
      position: fixed;
      top: 0;
      left: 50%;
      width: 1px;
      height: 100%;
      background: rgba(255, 0, 0, 0.3);
      z-index: 9999;
      transform: translateX(-50%);
      pointer-events: none;
    }
  }

  body.dark-mode {
    background-color: #1a202c;
    color: #e2e8f0;
    
    a {
      color: #63b3ed;
    }
  }

  /* Color blindness simulation */
  body.protanopia {
    filter: url('#protanopia');
  }
  
  body.deuteranopia {
    filter: url('#deuteranopia');
  }
  
  body.tritanopia {
    filter: url('#tritanopia');
  }
  
  body.achromatopsia {
    filter: grayscale(100%);
  }
`;

// Animation keyframes
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// Settings Icon Component
const AccessibilityIcon = ({ 
  size = 36,
  color = '#4A5568',
  hoverColor = '#4299E1',
  animationSpeed = 1.5,
  position = 'bottom-right'
}) => {
  const { setIsPanelOpen, settings } = useAccessibility();
  
  // Position styles
  const positionStyles = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' }
  };

  return (
    <FloatingIconButton 
      size={size}
      onClick={() => setIsPanelOpen(true)}
      $animationSpeed={animationSpeed}
      $color={color}
      $hoverColor={hoverColor}
      style={positionStyles[position]}
      aria-label="Open accessibility settings"
      role="button"
      tabIndex={0}
      $reducedMotion={settings.reducedMotion}
    >
      <FaCog />
    </FloatingIconButton>
  );
};

const FloatingIconButton = styled.button`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$color};
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  z-index: 999;
  transition: 
    color 0.3s ease,
    transform 0.3s ease,
    background-color 0.3s ease;
  
  &:hover {
    color: ${props => props.$hoverColor};
    transform: scale(1.1);
    background-color: #f8f9fa;
    
    ${props => !props.$reducedMotion && css`
      animation: ${rotate} ${props.$animationSpeed}s linear infinite;
    `}
  }
  
  &:active {
    ${props => !props.$reducedMotion && css`
      animation: ${pulse} 0.5s ease;
    `}
  }
  
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
  
  svg {
    width: 60%;
    height: 60%;
  }
`;

// Modal overlay for settings panel
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// Settings Panel Styles
const SettingsPanelContainer = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#2d3748' : 'white'};
  color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#2d3748'};
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 80vh;
  width: 90%;
  max-width: 800px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: ${props => props.theme.mode === 'dark' ? '#1a202c' : '#4299e1'};
  color: white;
  
  h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 1.2rem;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#4a5568' : '#e2e8f0'};
  padding: 0 20px;
`;

const TabButton = styled.button`
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  color: ${props => props.$isActive 
    ? (props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce') 
    : (props.theme.mode === 'dark' ? '#a0aec0' : '#718096')};
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
    transform: scaleX(${props => props.$isActive ? 1 : 0});
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
  }
`;

const PanelContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const Setting = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const SettingLabel = styled.div`
  flex: 1;
  
  label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
    cursor: pointer;
    margin-bottom: 5px;
  }
  
  p {
    margin: 0;
    color: ${props => props.theme.mode === 'dark' ? '#a0aec0' : '#718096'};
    font-size: 0.9rem;
    padding-left: 28px;
  }
`;

const SwitchContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  label {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
    transition: .4s;
    border-radius: 28px;
    
    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + label {
    background-color: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
  }
  
  input:checked + label:before {
    transform: translateX(22px);
  }
`;

const SizeSelector = styled.div`
  display: flex;
  gap: 8px;
  
  button {
    padding: 8px 16px;
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
    background: ${props => props.theme.mode === 'dark' ? '#2d3748' : 'white'};
    color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#2d3748'};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 70px;
    
    &.active {
      background: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
      color: white;
      border-color: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
    }
    
    &:hover {
      border-color: ${props => props.theme.mode === 'dark' ? '#63b3ed' : '#3182ce'};
    }
  }
`;

const SelectContainer = styled.div`
  select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
    background: ${props => props.theme.mode === 'dark' ? '#2d3748' : 'white'};
    color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#2d3748'};
    width: 100%;
    max-width: 200px;
  }
`;

const PanelActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid ${props => props.theme.mode === 'dark' ? '#4a5568' : '#e2e8f0'};
  background: ${props => props.theme.mode === 'dark' ? '#2d3748' : '#f7fafc'};
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResetButton = styled(ActionButton)`
  background: transparent;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
  color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#4a5568'};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.mode === 'dark' ? '#4a5568' : '#edf2f7'};
  }
`;

const ClosePanelButton = styled(ActionButton)`
  background: ${props => props.theme.mode === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.mode === 'dark' ? '#718096' : '#cbd5e0'};
  }
`;

const ProfileSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed ${props => props.theme.mode === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  
  button {
    padding: 8px 12px;
    background: ${props => props.theme.mode === 'dark' ? '#2d3748' : '#edf2f7'};
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: ${props => props.theme.mode === 'dark' ? '#4a5568' : '#e2e8f0'};
    }
  }
`;

const ProfileInput = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  
  input {
    flex: 1;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid ${props => props.theme.mode === 'dark' ? '#4a5568' : '#cbd5e0'};
    background: ${props => props.theme.mode === 'dark' ? '#2d3748' : 'white'};
    color: ${props => props.theme.mode === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

// Settings Panel Component
const SettingsPanel = () => {
  const { 
    settings, 
    setSettings, 
    activeTab,
    setActiveTab,
    resetSettings,
    saveProfile,
    loadProfile,
    setVoiceMessage,
    setIsPanelOpen
  } = useAccessibility();
  
  const [newProfileName, setNewProfileName] = useState('');
  const [profiles, setProfiles] = useState({});
  
  // Load saved profiles
  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem('accessibilityProfiles') || '{}');
    setProfiles(savedProfiles);
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setVoiceMessage(`Setting changed: ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
  };

  const handleSaveProfile = () => {
    if (newProfileName.trim()) {
      saveProfile(newProfileName.trim());
      setProfiles(prev => ({ ...prev, [newProfileName.trim()]: settings }));
      setNewProfileName('');
    }
  };

  const theme = { mode: settings.darkMode ? 'dark' : 'light' };

  return (
    <SettingsPanelContainer theme={theme}>
      <PanelHeader theme={theme}>
        <h3>
          <FaUniversalAccess aria-hidden="true" /> Accessibility Settings
        </h3>
        <CloseButton 
          onClick={() => setIsPanelOpen(false)}
          aria-label="Close accessibility panel"
        >
          &times;
        </CloseButton>
      </PanelHeader>
      
      <TabContainer theme={theme}>
        <TabButton 
          $isActive={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
          theme={theme}
        >
          General
        </TabButton>
        <TabButton 
          $isActive={activeTab === 'vision'}
          onClick={() => setActiveTab('vision')}
          theme={theme}
        >
          Vision
        </TabButton>
        <TabButton 
          $isActive={activeTab === 'advanced'}
          onClick={() => setActiveTab('advanced')}
          theme={theme}
        >
          Advanced
        </TabButton>
      </TabContainer>
      
      <PanelContent>
        {activeTab === 'general' && (
          <SettingsGrid>
            <Setting>
              <SettingLabel>
                <label htmlFor="darkMode">
                  <MdContrast /> Dark Mode
                </label>
                <p>Switch to dark color scheme for reduced eye strain</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="darkMode"
                  checked={settings.darkMode}
                  onChange={e => handleSettingChange('darkMode', e.target.checked)}
                />
                <label htmlFor="darkMode" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>

            <Setting>
              <SettingLabel>
                <label>
                  <MdTextFields /> Text Size
                </label>
                <p>Adjust the overall text size for better readability</p>
              </SettingLabel>
              <SizeSelector theme={theme}>
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    className={settings.textSize === size ? 'active' : ''}
                    onClick={() => handleSettingChange('textSize', size)}
                    aria-pressed={settings.textSize === size}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </SizeSelector>
            </Setting>

            <Setting>
              <SettingLabel>
                <label htmlFor="voiceNav">
                  <FaVolumeUp /> Voice Navigation
                </label>
                <p>Enable audio assistance for navigation</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="voiceNav"
                  checked={settings.voiceNavigation}
                  onChange={e => handleSettingChange('voiceNavigation', e.target.checked)}
                />
                <label htmlFor="voiceNav" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>

            <Setting>
              <SettingLabel>
                <label htmlFor="largeCursor">
                  <MdMouse /> Large Cursor
                </label>
                <p>Increase cursor size for better visibility</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="largeCursor"
                  checked={settings.largeCursor}
                  onChange={e => handleSettingChange('largeCursor', e.target.checked)}
                />
                <label htmlFor="largeCursor" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>
          </SettingsGrid>
        )}
        
        {activeTab === 'vision' && (
          <SettingsGrid>
            <Setting>
              <SettingLabel>
                <label htmlFor="highContrast">
                  <MdContrast /> High Contrast Mode
                </label>
                <p>Enhances color contrast for better readability</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="highContrast"
                  checked={settings.highContrast}
                  onChange={e => handleSettingChange('highContrast', e.target.checked)}
                />
                <label htmlFor="highContrast" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>

            <Setting>
              <SettingLabel>
                <label htmlFor="grayscale">
                  <MdHighQuality /> Grayscale Mode
                </label>
                <p>Remove color for reduced visual distraction</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="grayscale"
                  checked={settings.grayscale}
                  onChange={e => handleSettingChange('grayscale', e.target.checked)}
                />
                <label htmlFor="grayscale" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>

            <Setting>
              <SettingLabel>
                <label htmlFor="colorBlindMode">Color Blindness Mode</label>
                <p>Adjust colors for different types of color vision deficiency</p>
              </SettingLabel>
              <SelectContainer theme={theme}>
                <select
                  value={settings.colorBlindMode}
                  onChange={e => handleSettingChange('colorBlindMode', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="protanopia">Protanopia (red-blind)</option>
                  <option value="deuteranopia">Deuteranopia (green-blind)</option>
                  <option value="tritanopia">Tritanopia (blue-blind)</option>
                  <option value="achromatopsia">Achromatopsia (complete color blindness)</option>
                </select>
              </SelectContainer>
            </Setting>

            <Setting>
              <SettingLabel>
                <label htmlFor="readingGuide">
                  Reading Guide
                </label>
                <p>Show a vertical line to help track reading position</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="readingGuide"
                  checked={settings.readingGuide}
                  onChange={e => handleSettingChange('readingGuide', e.target.checked)}
                />
                <label htmlFor="readingGuide" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>
          </SettingsGrid>
        )}
        
        {activeTab === 'advanced' && (
          <SettingsGrid>
            <Setting>
              <SettingLabel>
                <label htmlFor="reducedMotion">
                  Reduced Motion
                </label>
                <p>Disable animations for reduced motion sensitivity</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="reducedMotion"
                  checked={settings.reducedMotion}
                  onChange={e => handleSettingChange('reducedMotion', e.target.checked)}
                />
                <label htmlFor="reducedMotion" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>

            <Setting>
              <SettingLabel>
                <label htmlFor="linkUnderline">
                  <MdLink /> Underline Links
                </label>
                <p>Always underline interactive links</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="linkUnderline"
                  checked={settings.linkUnderline}
                  onChange={e => handleSettingChange('linkUnderline', e.target.checked)}
                />
                <label htmlFor="linkUnderline" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>

            <Setting>
              <SettingLabel>
                <label htmlFor="highlightLinks">
                  Highlight Links
                </label>
                <p>Add background to links for better visibility</p>
              </SettingLabel>
              <SwitchContainer theme={theme}>
                <input 
                  type="checkbox"
                  id="highlightLinks"
                  checked={settings.highlightLinks}
                  onChange={e => handleSettingChange('highlightLinks', e.target.checked)}
                />
                <label htmlFor="highlightLinks" aria-hidden="true"></label>
              </SwitchContainer>
            </Setting>

            <Setting>
              <SettingLabel>
                <label>Animation Speed</label>
                <p>Adjust the speed of UI animations</p>
              </SettingLabel>
              <SizeSelector theme={theme}>
                {['slow', 'medium', 'fast'].map(speed => (
                  <button
                    key={speed}
                    className={settings.animationSpeed === 
                      (speed === 'slow' ? 2 : speed === 'medium' ? 1.5 : 1) ? 'active' : ''}
                    onClick={() => handleSettingChange('animationSpeed', 
                      speed === 'slow' ? 2 : speed === 'medium' ? 1.5 : 1)}
                    aria-pressed={settings.animationSpeed === 
                      (speed === 'slow' ? 2 : speed === 'medium' ? 1.5 : 1)}
                  >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </button>
                ))}
              </SizeSelector>
            </Setting>
          </SettingsGrid>
        )}
        
        <ProfileSection theme={theme}>
          <h4><FaSave /> Saved Profiles</h4>
          <ProfileActions>
            {Object.keys(profiles).map(profile => (
              <button 
                key={profile} 
                onClick={() => loadProfile(profile)}
              >
                {profile}
              </button>
            ))}
          </ProfileActions>
          
          <ProfileInput>
            <input
              type="text"
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              placeholder="New profile name"
              aria-label="New profile name"
            />
            <ActionButton 
              onClick={handleSaveProfile}
              disabled={!newProfileName.trim()}
              theme={theme}
            >
              <FaSave /> Save
            </ActionButton>
          </ProfileInput>
        </ProfileSection>
      </PanelContent>
      
      <PanelActions theme={theme}>
        <ResetButton onClick={resetSettings} theme={theme}>
          <FaUndo /> Reset
        </ResetButton>
        <ClosePanelButton onClick={() => setIsPanelOpen(false)} theme={theme}>
          Close
        </ClosePanelButton>
      </PanelActions>
    </SettingsPanelContainer>
  );
};

// Export the main components
export { AccessibilityProvider, AccessibilityIcon };