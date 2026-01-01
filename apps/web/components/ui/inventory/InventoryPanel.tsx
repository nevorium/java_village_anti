'use client';

import { useCallback, useEffect } from 'react';
import { useInventoryStore, HOTBAR_SIZE, INVENTORY_SIZE } from '@/stores/inventoryStore';
import styles from './InventoryPanel.module.css';

export default function InventoryPanel() {
    const isOpen = useInventoryStore((state) => state.isOpen);
    const slots = useInventoryStore((state) => state.slots);
    const draggedSlot = useInventoryStore((state) => state.draggedSlot);
    const closeInventory = useInventoryStore((state) => state.closeInventory);
    const moveItem = useInventoryStore((state) => state.moveItem);
    const startDrag = useInventoryStore((state) => state.startDrag);
    const endDrag = useInventoryStore((state) => state.endDrag);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeInventory();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeInventory]);

    const handleSlotClick = useCallback((index: number) => {
        if (draggedSlot !== null) {
            // Drop item
            moveItem(draggedSlot, index);
            endDrag();
        } else if (slots[index].item) {
            // Pick up item
            startDrag(index);
        }
    }, [draggedSlot, slots, moveItem, startDrag, endDrag]);

    const handleRightClick = useCallback((e: React.MouseEvent, index: number) => {
        e.preventDefault();
        // Split stack on right click
        if (draggedSlot !== null) {
            moveItem(draggedSlot, index, 1);
        }
    }, [draggedSlot, moveItem]);

    if (!isOpen) return null;

    // Split slots: hotbar (0-8) and main inventory (9-35)
    const hotbarSlots = slots.slice(0, HOTBAR_SIZE);
    const mainSlots = slots.slice(HOTBAR_SIZE, HOTBAR_SIZE + INVENTORY_SIZE);

    return (
        <div className={styles.overlay} onClick={closeInventory}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Inventory</h2>
                    <button className={styles.closeButton} onClick={closeInventory}>
                        ✕
                    </button>
                </div>

                {/* Main Inventory Grid */}
                <div className={styles.section}>
                    <div className={styles.grid}>
                        {mainSlots.map((slot, i) => {
                            const index = HOTBAR_SIZE + i;
                            return (
                                <div
                                    key={index}
                                    className={`${styles.slot} ${draggedSlot === index ? styles.dragging : ''
                                        }`}
                                    onClick={() => handleSlotClick(index)}
                                    onContextMenu={(e) => handleRightClick(e, index)}
                                >
                                    {slot.item && (
                                        <>
                                            <span className={styles.icon}>{slot.item.icon}</span>
                                            {slot.quantity > 1 && (
                                                <span className={styles.quantity}>{slot.quantity}</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hotbar */}
                <div className={styles.section}>
                    <span className={styles.label}>Hotbar</span>
                    <div className={styles.hotbarGrid}>
                        {hotbarSlots.map((slot, index) => (
                            <div
                                key={index}
                                className={`${styles.slot} ${draggedSlot === index ? styles.dragging : ''
                                    }`}
                                onClick={() => handleSlotClick(index)}
                                onContextMenu={(e) => handleRightClick(e, index)}
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
                </div>
            </div>

            {/* Dragged item cursor follower */}
            {draggedSlot !== null && slots[draggedSlot].item && (
                <DraggedItem item={slots[draggedSlot].item} quantity={slots[draggedSlot].quantity} />
            )}
        </div>
    );
}

function DraggedItem({ item, quantity }: { item: any; quantity: number }) {
    useEffect(() => {
        const follower = document.getElementById('dragged-item');
        if (!follower) return;

        const handleMouseMove = (e: MouseEvent) => {
            follower.style.left = `${e.clientX}px`;
            follower.style.top = `${e.clientY}px`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div id="dragged-item" className={styles.draggedItem}>
            <span className={styles.icon}>{item.icon}</span>
            {quantity > 1 && <span className={styles.quantity}>{quantity}</span>}
        </div>
    );
}
