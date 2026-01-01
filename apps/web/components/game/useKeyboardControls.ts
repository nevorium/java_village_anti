'use client';

import { useState, useEffect, useCallback } from 'react';

interface KeyboardState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    sprint: boolean;
    jump: boolean;
    interact: boolean;
    inventory: boolean;
    hotbar1: boolean;
    hotbar2: boolean;
    hotbar3: boolean;
    hotbar4: boolean;
    hotbar5: boolean;
    hotbar6: boolean;
    hotbar7: boolean;
    hotbar8: boolean;
    hotbar9: boolean;
}

const initialState: KeyboardState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    interact: false,
    inventory: false,
    hotbar1: false,
    hotbar2: false,
    hotbar3: false,
    hotbar4: false,
    hotbar5: false,
    hotbar6: false,
    hotbar7: false,
    hotbar8: false,
    hotbar9: false,
};

// Key mappings
const keyMap: Record<string, keyof KeyboardState> = {
    KeyW: 'forward',
    ArrowUp: 'forward',
    KeyS: 'backward',
    ArrowDown: 'backward',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    ShiftLeft: 'sprint',
    ShiftRight: 'sprint',
    Space: 'jump',
    KeyE: 'interact',
    KeyI: 'inventory',
    Digit1: 'hotbar1',
    Digit2: 'hotbar2',
    Digit3: 'hotbar3',
    Digit4: 'hotbar4',
    Digit5: 'hotbar5',
    Digit6: 'hotbar6',
    Digit7: 'hotbar7',
    Digit8: 'hotbar8',
    Digit9: 'hotbar9',
};

export function useKeyboardControls() {
    const [keys, setKeys] = useState<KeyboardState>(initialState);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const action = keyMap[event.code];
        if (action) {
            event.preventDefault();
            setKeys((prev) => ({ ...prev, [action]: true }));
        }
    }, []);

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        const action = keyMap[event.code];
        if (action) {
            setKeys((prev) => ({ ...prev, [action]: false }));
        }
    }, []);

    // Handle window blur (reset all keys when window loses focus)
    const handleBlur = useCallback(() => {
        setKeys(initialState);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
        };
    }, [handleKeyDown, handleKeyUp, handleBlur]);

    return keys;
}

// Hook for handling hotbar selection
export function useHotbarControls(onSelect: (index: number) => void) {
    const keys = useKeyboardControls();

    useEffect(() => {
        if (keys.hotbar1) onSelect(0);
        if (keys.hotbar2) onSelect(1);
        if (keys.hotbar3) onSelect(2);
        if (keys.hotbar4) onSelect(3);
        if (keys.hotbar5) onSelect(4);
        if (keys.hotbar6) onSelect(5);
        if (keys.hotbar7) onSelect(6);
        if (keys.hotbar8) onSelect(7);
        if (keys.hotbar9) onSelect(8);
    }, [
        keys.hotbar1, keys.hotbar2, keys.hotbar3,
        keys.hotbar4, keys.hotbar5, keys.hotbar6,
        keys.hotbar7, keys.hotbar8, keys.hotbar9,
        onSelect,
    ]);

    return keys;
}
