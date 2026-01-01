'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './MobileControls.module.css';

interface JoystickState {
    x: number; // -1 to 1
    y: number; // -1 to 1
    active: boolean;
}

interface MobileControlsProps {
    onMove: (x: number, y: number) => void;
    onAction: (action: 'interact' | 'inventory' | 'sprint') => void;
    enabled?: boolean;
}

export default function MobileControls({
    onMove,
    onAction,
    enabled = true,
}: MobileControlsProps) {
    const [joystick, setJoystick] = useState<JoystickState>({
        x: 0,
        y: 0,
        active: false,
    });
    const [isSprinting, setIsSprinting] = useState(false);

    const joystickRef = useRef<HTMLDivElement>(null);
    const joystickCenter = useRef({ x: 0, y: 0 });

    const handleJoystickStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (!joystickRef.current) return;

        const rect = joystickRef.current.getBoundingClientRect();
        joystickCenter.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };

        setJoystick((prev) => ({ ...prev, active: true }));
    }, []);

    const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
        if (!joystick.active) return;

        const maxRadius = 40;
        const dx = clientX - joystickCenter.current.x;
        const dy = clientY - joystickCenter.current.y;

        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxRadius);
        const angle = Math.atan2(dy, dx);

        const x = (Math.cos(angle) * distance) / maxRadius;
        const y = (Math.sin(angle) * distance) / maxRadius;

        setJoystick((prev) => ({ ...prev, x, y }));
        onMove(x, -y); // Invert Y for game coordinates
    }, [joystick.active, onMove]);

    const handleJoystickEnd = useCallback(() => {
        setJoystick({ x: 0, y: 0, active: false });
        onMove(0, 0);
    }, [onMove]);

    // Touch event handlers
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleJoystickMove(touch.clientX, touch.clientY);
    }, [handleJoystickMove]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        handleJoystickMove(e.clientX, e.clientY);
    }, [handleJoystickMove]);

    // Sprint toggle
    const toggleSprint = useCallback(() => {
        setIsSprinting((prev) => !prev);
        onAction('sprint');
    }, [onAction]);

    if (!enabled) return null;

    return (
        <div className={styles.container}>
            {/* Virtual Joystick */}
            <div
                ref={joystickRef}
                className={styles.joystickBase}
                onTouchStart={handleJoystickStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleJoystickEnd}
                onMouseDown={handleJoystickStart}
                onMouseMove={handleMouseMove}
                onMouseUp={handleJoystickEnd}
                onMouseLeave={handleJoystickEnd}
            >
                <div
                    className={styles.joystickHandle}
                    style={{
                        transform: `translate(${joystick.x * 40}px, ${joystick.y * 40}px)`,
                    }}
                />
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
                {/* Interact Button */}
                <button
                    className={styles.actionButton}
                    onTouchStart={() => onAction('interact')}
                    onClick={() => onAction('interact')}
                >
                    <span className={styles.buttonIcon}>👆</span>
                    <span className={styles.buttonLabel}>Use</span>
                </button>

                {/* Inventory Button */}
                <button
                    className={styles.actionButton}
                    onTouchStart={() => onAction('inventory')}
                    onClick={() => onAction('inventory')}
                >
                    <span className={styles.buttonIcon}>🎒</span>
                    <span className={styles.buttonLabel}>Bag</span>
                </button>

                {/* Sprint Toggle */}
                <button
                    className={`${styles.actionButton} ${isSprinting ? styles.active : ''}`}
                    onTouchStart={toggleSprint}
                    onClick={toggleSprint}
                >
                    <span className={styles.buttonIcon}>🏃</span>
                    <span className={styles.buttonLabel}>Run</span>
                </button>
            </div>
        </div>
    );
}
