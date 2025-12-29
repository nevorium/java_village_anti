'use client';

export default function UIOverlay() {
    return (
        <div className="ui-overlay">
            {/* HUD - Top Left */}
            <div className="hud-container">
                <div className="hud-bar">
                    <span style={{ fontSize: '14px' }}>☀️</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                        Day 1 - 6:00 AM
                    </span>
                </div>
                <div className="hud-bar">
                    <span style={{ fontSize: '14px' }}>💰</span>
                    <span style={{ color: 'var(--color-money)', fontSize: '12px' }}>
                        500 G
                    </span>
                </div>
            </div>

            {/* Hotbar - Bottom Center */}
            <div className="hotbar">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className={`item-slot ${i === 0 ? 'selected' : ''}`}
                        style={{ width: '48px', height: '48px' }}
                    >
                        {i === 0 && <span style={{ fontSize: '20px' }}>🪓</span>}
                        {i === 1 && <span style={{ fontSize: '20px' }}>⛏️</span>}
                        {i === 2 && <span style={{ fontSize: '20px' }}>🪣</span>}
                    </div>
                ))}
            </div>

            {/* Game Title (temporary) */}
            <div
                style={{
                    position: 'fixed',
                    top: 'var(--spacing-md)',
                    right: 'var(--spacing-md)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    background: 'rgba(26, 26, 46, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    backdropFilter: 'blur(5px)',
                }}
            >
                <span style={{
                    color: 'var(--color-primary-light)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '1px'
                }}>
                    JAVA VILLAGE
                </span>
            </div>
        </div>
    );
}
