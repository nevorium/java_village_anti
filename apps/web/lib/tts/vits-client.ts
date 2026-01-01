// VITS TTS Client
// Connects to self-hosted VITS API for Indonesian and Japanese text-to-speech

export interface TTSOptions {
    text: string;
    language: 'Indonesian' | 'Japanese';
    model?: string;
    noiseScale?: number;
    noiseScaleW?: number;
    lengthScale?: number;
}

export interface TTSResponse {
    path: string;
    audioUrl?: string;
}

class VITSClient {
    private baseUrl: string = 'http://127.0.0.1:7861';
    private currentModel: string = 'default';

    /**
     * Configure the TTS client
     */
    configure(options: { baseUrl?: string; defaultModel?: string }) {
        if (options.baseUrl) {
            this.baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        }
        if (options.defaultModel) {
            this.currentModel = options.defaultModel;
        }
    }

    /**
     * Get the current base URL
     */
    getBaseUrl(): string {
        return this.baseUrl;
    }

    /**
     * Set the current model
     */
    setModel(model: string) {
        this.currentModel = model;
    }

    /**
     * Generate speech from text
     */
    async speak(options: TTSOptions): Promise<TTSResponse> {
        const {
            text,
            language,
            model = this.currentModel,
            noiseScale = 0.667,
            noiseScaleW = 0.8,
            lengthScale = 1.0,
        } = options;

        try {
            const response = await fetch(`${this.baseUrl}/api/tts_fast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    language,
                    noise_scale: noiseScale,
                    noise_scale_w: noiseScaleW,
                    length_scale: lengthScale,
                    is_symbol: false,
                    model,
                }),
            });

            if (!response.ok) {
                throw new Error(`TTS API error: ${response.status}`);
            }

            const data: TTSResponse = await response.json();

            // Convert file path to URL if needed
            if (data.path && !data.audioUrl) {
                data.audioUrl = `${this.baseUrl}/audio/${encodeURIComponent(data.path)}`;
            }

            return data;
        } catch (error) {
            console.error('TTS error:', error);
            throw error;
        }
    }

    /**
     * Play audio directly
     */
    async playText(options: TTSOptions): Promise<void> {
        const response = await this.speak(options);

        if (response.audioUrl) {
            const audio = new Audio(response.audioUrl);
            await audio.play();
        } else if (response.path) {
            // Try to fetch the audio file directly
            const audio = new Audio(`${this.baseUrl}/files/${response.path}`);
            await audio.play();
        }
    }

    /**
     * Detect language from text
     */
    detectLanguage(text: string): 'Indonesian' | 'Japanese' {
        // Simple detection based on character ranges
        const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

        if (japanesePattern.test(text)) {
            return 'Japanese';
        }

        return 'Indonesian';
    }

    /**
     * Speak with auto-detected language
     */
    async speakAuto(text: string, model?: string): Promise<TTSResponse> {
        const language = this.detectLanguage(text);
        return this.speak({ text, language, model });
    }
}

// Singleton instance
export const ttsClient = new VITSClient();

// Initialize from environment
if (typeof window !== 'undefined') {
    const ttsUrl = process.env.NEXT_PUBLIC_TTS_API_URL;
    if (ttsUrl) {
        ttsClient.configure({ baseUrl: ttsUrl });
    }
}
