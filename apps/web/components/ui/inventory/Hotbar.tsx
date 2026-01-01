'use client';

import { useCallback } from 'react';
import { useInventoryStore, HOTBAR_SIZE } from '@/stores/inventoryStore';
import styles from './Hotbar.module.css';

export default function Hotbar() {
    const slots = useInventoryStore((state) => state.slots);
    const hotbarIndex = useInventoryStore((state) => state.hotbarIndex);
    const setHotbarIndex = useInventoryStore((state) => state.setHotbarIndex);

    // Get only hotbar slots (first 9)
    const hotbarSlots = slots.slice(0, HOTBAR_SIZE);

    const handleSlotClick = useCallback((index: number) => {
        setHotbarIndex(index);
    }, [setHotbarIndex]);

    return (
        <div className={styles.hotbar}>
            {hotbarSlots.map((slot, index) => (
                <div
                    key={index}
                    className={`${styles.slot} ${index === hotbarIndex ? styles.selected : ''}`}
                    onClick={() => handleSlotClick(index)}
                >
                    {slot.item && (
                        <>
                            <span className={styles.icon}>{slot.item.icon}</span>
                            {slot.quantity > 1 && (
                                <span className={styles.quantity}>{slot.quantity}</span>
                            )}
                        </>
                    )}
                    <span className={styles.shortcut}>{index + 1}</span>
                </div>
            ))}
        </div>
    );
}
