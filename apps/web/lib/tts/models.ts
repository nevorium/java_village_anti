// Placeholder VITS model manifest
// Run 'pnpm scrape-models' to populate with real data

export interface VITSModel {
    category: string;
    name: string;
    fullPath: string;
}

// Default models (will be replaced by scraper)
export const VITS_MODELS: VITSModel[] = [
    { category: 'genshin', name: 'paimon', fullPath: 'genshin/paimon' },
    { category: 'genshin', name: 'zhongli', fullPath: 'genshin/zhongli' },
    { category: 'genshin', name: 'hutao', fullPath: 'genshin/hutao' },
    { category: 'vtuber', name: 'korone', fullPath: 'vtuber/korone' },
    { category: 'vtuber', name: 'pekora', fullPath: 'vtuber/pekora' },
    { category: 'anime', name: 'rem', fullPath: 'anime/rem' },
];

export const VITS_CATEGORIES: string[] = ['genshin', 'vtuber', 'anime'];

export const LAST_UPDATED = '2024-01-01T00:00:00.000Z';

/**
 * Get models by category
 */
export function getModelsByCategory(category: string): VITSModel[] {
    return VITS_MODELS.filter((m) => m.category === category);
}

/**
 * Search models by name
 */
export function searchModels(query: string): VITSModel[] {
    const lower = query.toLowerCase();
    return VITS_MODELS.filter(
        (m) =>
            m.name.toLowerCase().includes(lower) ||
            m.category.toLowerCase().includes(lower)
    );
}
