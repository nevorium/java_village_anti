'use client';

import { useGameStore } from '@/stores/gameStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { formatTime, formatDate } from '@java-village/game-logic';
import Hotbar from './inventory/Hotbar';
import InventoryPanel from './inventory/InventoryPanel';
import styles from './UIOverlay.module.css';

export default function UIOverlay() {
    const gameTime = useGameStore((state) => state.gameTime);
    const money = useGameStore((state) => state.money);
    const toggleInventory = useInventoryStore((state) => state.toggleInventory);

    return (
        <div className={styles.overlay}>
            {/* HUD - Top Left */}
            <div className={styles.hudContainer}>
                {/* Time Display */}
                <div className={styles.hudBar}>
                    <span className={styles.icon}>☀️</span>
                    <div className={styles.timeInfo}>
                        <span className={styles.time}>{formatTime(gameTime)}</span>
                        <span className={styles.date}>{formatDate(gameTime)}</span>
                    </div>
                </div>

                {/* Money Display */}
                <div className={styles.hudBar}>
                    <span className={styles.icon}>💰</span>
                    <span className={styles.money}>{money.toLocaleString()} G</span>
                </div>
            </div>

            {/* Top Right - Game Title & Quick Actions */}
            <div className={styles.topRight}>
                <button className={styles.iconButton} onClick={toggleInventory} title="Inventory (I)">
                    🎒
                </button>
                <button className={styles.iconButton} title="Settings">
                    ⚙️
                </button>
            </div>

            {/* Hotbar - Bottom Center */}
            <Hotbar />

            {/* Inventory Panel (modal) */}
            <InventoryPanel />
        </div>
    );
}
