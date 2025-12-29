import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the game with no SSR (required for Three.js)
const Game = dynamic(() => import('@/components/game/Game'), {
    ssr: false,
    loading: () => <LoadingScreen />,
});

function LoadingScreen() {
    return (
        <div className="loading-screen">
            <h1 style={{ fontFamily: 'var(--font-game)', fontSize: '24px' }}>
                Java Village
            </h1>
            <div className="loading-spinner" />
            <p style={{ color: 'var(--color-text-muted)' }}>Loading world...</p>
        </div>
    );
}

export default function HomePage() {
    return (
        <main className="game-container">
            <Suspense fallback={<LoadingScreen />}>
                <Game />
            </Suspense>
        </main>
    );
}
