// AI Provider abstraction for NPC dialogue
// Supports Gemini (primary) and OpenRouter (fallback)

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AIResponse {
    content: string;
    provider: 'gemini' | 'openrouter';
}

interface AIProviderConfig {
    geminiApiKey?: string;
    openrouterApiKey?: string;
    preferredProvider?: 'gemini' | 'openrouter';
}

class AIProvider {
    private geminiApiKey: string | null = null;
    private openrouterApiKey: string | null = null;
    private preferredProvider: 'gemini' | 'openrouter' = 'gemini';

    configure(config: AIProviderConfig) {
        this.geminiApiKey = config.geminiApiKey || null;
        this.openrouterApiKey = config.openrouterApiKey || null;
        this.preferredProvider = config.preferredProvider || 'gemini';
    }

    async chat(messages: AIMessage[], options?: {
        maxTokens?: number;
        temperature?: number;
    }): Promise<AIResponse> {
        const { maxTokens = 150, temperature = 0.8 } = options || {};

        // Try preferred provider first
        if (this.preferredProvider === 'gemini' && this.geminiApiKey) {
            try {
                return await this.chatWithGemini(messages, maxTokens, temperature);
            } catch (error) {
                console.warn('Gemini failed, trying OpenRouter:', error);
            }
        }

        // Fallback to OpenRouter
        if (this.openrouterApiKey) {
            return await this.chatWithOpenRouter(messages, maxTokens, temperature);
        }

        // Try Gemini as last resort
        if (this.geminiApiKey) {
            return await this.chatWithGemini(messages, maxTokens, temperature);
        }

        throw new Error('No AI provider configured');
    }

    private async chatWithGemini(
        messages: AIMessage[],
        maxTokens: number,
        temperature: number
    ): Promise<AIResponse> {
        // Convert messages to Gemini format
        const contents = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

        // Add system instruction if present
        const systemMessage = messages.find((m) => m.role === 'system');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    systemInstruction: systemMessage
                        ? { parts: [{ text: systemMessage.content }] }
                        : undefined,
                    generationConfig: {
                        maxOutputTokens: maxTokens,
                        temperature,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return { content, provider: 'gemini' };
    }

    private async chatWithOpenRouter(
        messages: AIMessage[],
        maxTokens: number,
        temperature: number
    ): Promise<AIResponse> {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.openrouterApiKey}`,
                'HTTP-Referer': window.location.origin,
            },
            body: JSON.stringify({
                model: 'google/gemini-flash-1.5',
                messages,
                max_tokens: maxTokens,
                temperature,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        return { content, provider: 'openrouter' };
    }
}

// Singleton instance
export const aiProvider = new AIProvider();

// Initialize from environment
if (typeof window !== 'undefined') {
    aiProvider.configure({
        geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
        openrouterApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
    });
}
