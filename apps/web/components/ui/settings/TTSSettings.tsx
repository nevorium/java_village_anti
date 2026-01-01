'use client';

import { useState, useEffect } from 'react';
import { ttsClient } from '@/lib/tts/vits-client';
import { VITS_MODELS, VITS_CATEGORIES, searchModels } from '@/lib/tts/models';
import styles from './TTSSettings.module.css';

interface TTSSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TTSSettings({ isOpen, onClose }: TTSSettingsProps) {
    const [apiUrl, setApiUrl] = useState(ttsClient.getBaseUrl());
    const [selectedCategory, setSelectedCategory] = useState('genshin');
    const [selectedModel, setSelectedModel] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [testText, setTestText] = useState('こんにちは、私はAIアシスタントです。');
    const [isPlaying, setIsPlaying] = useState(false);

    // Filter models based on category and search
    const filteredModels = searchQuery
        ? searchModels(searchQuery)
        : VITS_MODELS.filter((m) => m.category === selectedCategory);

    const handleSave = () => {
        ttsClient.configure({ baseUrl: apiUrl });
        if (selectedModel) {
            ttsClient.setModel(selectedModel);
        }
        onClose();
    };

    const handleTest = async () => {
        if (!testText.trim()) return;

        setIsPlaying(true);
        try {
            await ttsClient.playText({
                text: testText,
                language: ttsClient.detectLanguage(testText),
                model: selectedModel || undefined,
            });
        } catch (error) {
            console.error('TTS test failed:', error);
            alert('TTS test failed. Check console for details.');
        } finally {
            setIsPlaying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>🔊 Voice Settings (TTS)</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.content}>
                    {/* API URL */}
                    <div className={styles.field}>
                        <label className={styles.label}>TTS Server URL</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="http://127.0.0.1:7861"
                        />
                        <span className={styles.hint}>
                            URL to your self-hosted VITS server
                        </span>
                    </div>

                    {/* Model Selection */}
                    <div className={styles.field}>
                        <label className={styles.label}>Voice Model</label>

                        {/* Search */}
                        <input
                            type="text"
                            className={styles.input}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search models..."
                        />

                        {/* Category Tabs */}
                        {!searchQuery && (
                            <div className={styles.tabs}>
                                {VITS_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`${styles.tab} ${selectedCategory === cat ? styles.activeTab : ''
                                            }`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Model List */}
                        <div className={styles.modelList}>
                            {filteredModels.map((model) => (
                                <button
                                    key={model.fullPath}
                                    className={`${styles.modelItem} ${selectedModel === model.fullPath ? styles.selected : ''
                                        }`}
                                    onClick={() => setSelectedModel(model.fullPath)}
                                >
                                    <span className={styles.modelName}>{model.name}</span>
                                    <span className={styles.modelCategory}>{model.category}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Test */}
                    <div className={styles.field}>
                        <label className={styles.label}>Test Voice</label>
                        <div className={styles.testRow}>
                            <input
                                type="text"
                                className={styles.input}
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                placeholder="Enter text to test..."
                            />
                            <button
                                className={styles.testButton}
                                onClick={handleTest}
                                disabled={isPlaying}
                            >
                                {isPlaying ? '🔊...' : '▶️ Play'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button className={styles.saveButton} onClick={handleSave}>
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
