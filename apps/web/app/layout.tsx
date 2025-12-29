import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Java Village - Multiplayer Farming Game',
    description: 'A pixelated 3D multiplayer farming game with AI NPCs, guilds, and mythological creatures.',
    keywords: ['farming', 'multiplayer', 'game', '3D', 'pixel art', 'MMO'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
