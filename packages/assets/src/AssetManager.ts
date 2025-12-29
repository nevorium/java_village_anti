import { AssetManifest, DEFAULT_ASSET_MANIFEST, ModelAsset, TextureAsset, SoundAsset } from './manifest';

// Cached assets
const modelCache = new Map<string, unknown>();
const textureCache = new Map<string, unknown>();
const soundCache = new Map<string, HTMLAudioElement>();

// Current active manifest
let currentManifest: AssetManifest = DEFAULT_ASSET_MANIFEST;

/**
 * Initialize the asset manager with a manifest
 */
export function initAssetManager(manifest?: AssetManifest): void {
    currentManifest = manifest || DEFAULT_ASSET_MANIFEST;
    console.log(`[AssetManager] Initialized with pack: ${currentManifest.pack.name} v${currentManifest.pack.version}`);
}

/**
 * Switch to a different asset pack
 */
export function switchAssetPack(manifest: AssetManifest): void {
    // Clear caches when switching packs
    modelCache.clear();
    textureCache.clear();
    soundCache.clear();

    currentManifest = manifest;
    console.log(`[AssetManager] Switched to pack: ${currentManifest.pack.name}`);
}

/**
 * Get the current manifest
 */
export function getManifest(): AssetManifest {
    return currentManifest;
}

/**
 * Get a model asset definition
 */
export function getModelAsset(id: string): ModelAsset | undefined {
    return currentManifest.models[id];
}

/**
 * Get the full path for a model
 */
export function getModelPath(id: string): string | undefined {
    const asset = currentManifest.models[id];
    if (!asset) return undefined;

    return `${currentManifest.pack.basePath}${asset.path}`;
}

/**
 * Get a texture asset definition
 */
export function getTextureAsset(id: string): TextureAsset | undefined {
    return currentManifest.textures[id];
}

/**
 * Get the full path for a texture
 */
export function getTexturePath(id: string): string | undefined {
    const asset = currentManifest.textures[id];
    if (!asset) return undefined;

    return `${currentManifest.pack.basePath}${asset.path}`;
}

/**
 * Get a sound asset definition
 */
export function getSoundAsset(id: string): SoundAsset | undefined {
    return currentManifest.sounds[id];
}

/**
 * Play a sound by ID
 */
export function playSound(id: string): void {
    const asset = currentManifest.sounds[id];
    if (!asset) {
        console.warn(`[AssetManager] Sound not found: ${id}`);
        return;
    }

    const path = `${currentManifest.pack.basePath}${asset.path}`;

    // Check cache
    let audio = soundCache.get(id);
    if (!audio) {
        audio = new Audio(path);
        audio.volume = asset.volume || 1;
        soundCache.set(id, audio);
    }

    // Clone to allow overlapping plays
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = asset.volume || 1;
    clone.play().catch(() => {
        // Ignore autoplay restrictions
    });
}

/**
 * Preload essential assets
 */
export async function preloadAssets(assetIds: string[]): Promise<void> {
    console.log(`[AssetManager] Preloading ${assetIds.length} assets...`);

    // This would be implemented with actual loaders in the 3D components
    // For now, just log
    for (const id of assetIds) {
        if (currentManifest.models[id]) {
            console.log(`[AssetManager] Preloading model: ${id}`);
        } else if (currentManifest.textures[id]) {
            console.log(`[AssetManager] Preloading texture: ${id}`);
        } else if (currentManifest.sounds[id]) {
            console.log(`[AssetManager] Preloading sound: ${id}`);
        }
    }
}
