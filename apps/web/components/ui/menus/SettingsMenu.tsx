'use client';

import { useState } from 'react';
import styles from './SettingsMenu.module.css';

interface SettingsMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenTTSSettings: () => void;
}

interface Settings {
    // Graphics
    pixelEffect: boolean;
    shadowQuality: 'low' | 'medium' | 'high';
    drawDistance: number;

    // Audio
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;

    // Controls
    invertY: boolean;
    cameraSensitivity: number;
    showMobileControls: boolean;

    // Game
    language: 'en' | 'id' | 'ja';
    showTutorials: boolean;
    autoSave: boolean;
}

const defaultSettings: Settings = {
    pixelEffect: false,
    shadowQuality: 'medium',
    drawDistance: 50,
    masterVolume: 80,
    musicVolume: 60,
    sfxVolume: 80,
    voiceVolume: 100,
    invertY: false,
    cameraSensitivity: 50,
    showMobileControls: true,
    language: 'en',
    showTutorials: true,
    autoSave: true,
};

export default function SettingsMenu({ isOpen, onClose, onOpenTTSSettings }: SettingsMenuProps) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [activeTab, setActiveTab] = useState<'graphics' | 'audio' | 'controls' | 'game'>('graphics');

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem('java_village_settings', JSON.stringify(settings));
        onClose();
    };

    const handleReset = () => {
        setSettings(defaultSettings);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>⚙️ Settings</h2>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    {(['graphics', 'audio', 'controls', 'game'] as const).map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {activeTab === 'graphics' && (
                        <>
                            <div className={styles.setting}>
                                <label className={styles.label}>Pixel Effect</label>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={settings.pixelEffect}
                                        onChange={(e) => updateSetting('pixelEffect', e.target.checked)}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>Shadow Quality</label>
                                <select
                                    className={styles.select}
                                    value={settings.shadowQuality}
                                    onChange={(e) => updateSetting('shadowQuality', e.target.value as any)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>Draw Distance: {settings.drawDistance}</label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="20"
                                    max="100"
                                    value={settings.drawDistance}
                                    onChange={(e) => updateSetting('drawDistance', Number(e.target.value))}
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'audio' && (
                        <>
                            <div className={styles.setting}>
                                <label className={styles.label}>Master Volume: {settings.masterVolume}%</label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="0"
                                    max="100"
                                    value={settings.masterVolume}
                                    onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                                />
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>Music: {settings.musicVolume}%</label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="0"
                                    max="100"
                                    value={settings.musicVolume}
                                    onChange={(e) => updateSetting('musicVolume', Number(e.target.value))}
                                />
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>SFX: {settings.sfxVolume}%</label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="0"
                                    max="100"
                                    value={settings.sfxVolume}
                                    onChange={(e) => updateSetting('sfxVolume', Number(e.target.value))}
                                />
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>Voice: {settings.voiceVolume}%</label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="0"
                                    max="100"
                                    value={settings.voiceVolume}
                                    onChange={(e) => updateSetting('voiceVolume', Number(e.target.value))}
                                />
                            </div>

                            <button className={styles.linkButton} onClick={onOpenTTSSettings}>
                                🔊 Configure Voice (TTS) →
                            </button>
                        </>
                    )}

                    {activeTab === 'controls' && (
                        <>
                            <div className={styles.setting}>
                                <label className={styles.label}>Invert Y Axis</label>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={settings.invertY}
                                        onChange={(e) => updateSetting('invertY', e.target.checked)}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>Camera Sensitivity: {settings.cameraSensitivity}</label>
                                <input
                                    type="range"
                                    className={styles.slider}
                                    min="10"
                                    max="100"
                                    value={settings.cameraSensitivity}
                                    onChange={(e) => updateSetting('cameraSensitivity', Number(e.target.value))}
                                />
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>Show Mobile Controls</label>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={settings.showMobileControls}
                                        onChange={(e) => updateSetting('showMobileControls', e.target.checked)}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                        </>
                    )}

                    {activeTab === 'game' && (
                        <>
                            <div className={styles.setting}>
                                <label className={styles.label}>Language</label>
                                <select
                                    className={styles.select}
                                    value={settings.language}
                                    onChange={(e) => updateSetting('language', e.target.value as any)}
                                >
                                    <option value="en">English</option>
                                    <option value="id">Indonesian</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>Show Tutorials</label>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={settings.showTutorials}
                                        onChange={(e) => updateSetting('showTutorials', e.target.checked)}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>

                            <div className={styles.setting}>
                                <label className={styles.label}>Auto-Save</label>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={settings.autoSave}
                                        onChange={(e) => updateSetting('autoSave', e.target.checked)}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button className={styles.resetButton} onClick={handleReset}>
                        Reset Defaults
                    </button>
                    <button className={styles.saveButton} onClick={handleSave}>
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
