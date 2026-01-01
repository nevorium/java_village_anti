// HuggingFace VITS Model Scraper
// Scrapes available models from last0rder/vits-models-v space

interface VITSModel {
    category: string;
    name: string;
    fullPath: string;
}

interface VITSModelManifest {
    lastUpdated: string;
    models: VITSModel[];
    categories: string[];
}

/**
 * Scrape VITS models from HuggingFace space
 * Run with: pnpm scrape-models
 */
async function scrapeVITSModels(): Promise<VITSModelManifest> {
    const baseUrl = 'https://huggingface.co/spaces/last0rder/vits-models-v/tree/main';
    const apiUrl = 'https://huggingface.co/api/spaces/last0rder/vits-models-v/tree/main';

    console.log('🔍 Fetching model categories...');

    const models: VITSModel[] = [];
    const categories: Set<string> = new Set();

    try {
        // Fetch root directory
        const rootResponse = await fetch(apiUrl);
        if (!rootResponse.ok) {
            throw new Error(`Failed to fetch: ${rootResponse.status}`);
        }

        const rootData = await rootResponse.json();

        // Filter for directories (model categories like 'genshin', 'vtuber', etc.)
        const modelDirs = rootData.filter(
            (item: any) => item.type === 'directory' && !item.path.startsWith('.')
        );

        console.log(`📁 Found ${modelDirs.length} categories`);

        // Fetch models from each category
        for (const dir of modelDirs) {
            const category = dir.path;
            categories.add(category);

            console.log(`  📂 Scanning ${category}...`);

            try {
                const categoryUrl = `${apiUrl}/${category}`;
                const categoryResponse = await fetch(categoryUrl);

                if (!categoryResponse.ok) continue;

                const categoryData = await categoryResponse.json();

                // Look for .pth or config files to identify models
                const modelFiles = categoryData.filter(
                    (item: any) =>
                        item.type === 'directory' ||
                        item.path.endsWith('.pth') ||
                        item.path.endsWith('config.json')
                );

                // Extract unique model names
                const modelNames = new Set<string>();
                for (const file of modelFiles) {
                    if (file.type === 'directory') {
                        modelNames.add(file.path.split('/').pop());
                    } else {
                        // Extract model name from file path
                        const parts = file.path.split('/');
                        if (parts.length > 1) {
                            modelNames.add(parts[parts.length - 2]);
                        }
                    }
                }

                for (const name of modelNames) {
                    if (name && !name.startsWith('.')) {
                        models.push({
                            category,
                            name,
                            fullPath: `${category}/${name}`,
                        });
                    }
                }

                console.log(`    ✓ Found ${modelNames.size} models`);
            } catch (error) {
                console.warn(`    ⚠ Error scanning ${category}:`, error);
            }
        }

        const manifest: VITSModelManifest = {
            lastUpdated: new Date().toISOString(),
            models,
            categories: Array.from(categories),
        };

        console.log(`\n✅ Total: ${models.length} models in ${categories.size} categories`);

        return manifest;
    } catch (error) {
        console.error('❌ Scraping failed:', error);
        throw error;
    }
}

/**
 * Save manifest to file
 */
async function saveManifest(manifest: VITSModelManifest, outputPath: string) {
    const fs = await import('fs/promises');

    const content = `// Auto-generated VITS model manifest
// Last updated: ${manifest.lastUpdated}
// Run 'pnpm scrape-models' to update

export interface VITSModel {
  category: string;
  name: string;
  fullPath: string;
}

export const VITS_MODELS: VITSModel[] = ${JSON.stringify(manifest.models, null, 2)};

export const VITS_CATEGORIES: string[] = ${JSON.stringify(manifest.categories, null, 2)};

export const LAST_UPDATED = "${manifest.lastUpdated}";

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
    (m) => m.name.toLowerCase().includes(lower) || m.category.toLowerCase().includes(lower)
  );
}
`;

    await fs.writeFile(outputPath, content, 'utf-8');
    console.log(`📝 Saved manifest to ${outputPath}`);
}

// Main script
async function main() {
    try {
        const manifest = await scrapeVITSModels();

        // Save to lib/tts/models.ts
        const outputPath = './apps/web/lib/tts/models.ts';
        await saveManifest(manifest, outputPath);

        console.log('\n🎉 Done!');
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

main();
