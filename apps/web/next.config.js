/** @type {import('next').NextConfig} */
const nextConfig = {
    // Transpile Three.js ecosystem packages
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier', '@react-three/postprocessing'],

    // Webpack configuration for Three.js
    webpack: (config) => {
        config.externals = [...(config.externals || []), { canvas: 'canvas' }];
        return config;
    },

    // Image optimization for game assets
    images: {
        unoptimized: true,
    },

    // Experimental features
    experimental: {
        // Enable server actions for Supabase
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

module.exports = nextConfig;
