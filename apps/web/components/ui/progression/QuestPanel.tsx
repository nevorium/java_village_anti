'use client';

import { useRewardsStore } from '@/stores/rewardsStore';
import styles from './QuestPanel.module.css';

interface QuestPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuestPanel({ isOpen, onClose }: QuestPanelProps) {
    const dailyQuests = useRewardsStore((state) => state.dailyQuests);
    const claimQuestReward = useRewardsStore((state) => state.claimQuestReward);

    if (!isOpen) return null;

    const getRewardText = (quest: (typeof dailyQuests)[0]) => {
        if (quest.reward.type === 'money') return `${quest.reward.amount}G`;
        return `${quest.reward.amount}x ${quest.reward.itemId}`;
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>📋 Daily Quests</h2>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>

                <div className={styles.questList}>
                    {dailyQuests.map((quest) => (
                        <div
                            key={quest.id}
                            className={`${styles.questCard} ${quest.completed ? styles.completed : ''
                                } ${quest.claimed ? styles.claimed : ''}`}
                        >
                            <div className={styles.questInfo}>
                                <h3 className={styles.questTitle}>{quest.title}</h3>
                                <p className={styles.questDesc}>{quest.description}</p>
                            </div>

                            <div className={styles.questProgress}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
                                        }}
                                    />
                                </div>
                                <span className={styles.progressText}>
                                    {quest.progress}/{quest.target}
                                </span>
                            </div>

                            <div className={styles.questReward}>
                                <span className={styles.rewardLabel}>Reward:</span>
                                <span className={styles.rewardValue}>{getRewardText(quest)}</span>

                                {quest.completed && !quest.claimed && (
                                    <button
                                        className={styles.claimButton}
                                        onClick={() => claimQuestReward(quest.id)}
                                    >
                                        Claim
                                    </button>
                                )}

                                {quest.claimed && (
                                    <span className={styles.claimedBadge}>✓ Claimed</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <p className={styles.resetNote}>
                        Quests reset daily at midnight
                    </p>
                </div>
            </div>
        </div>
    );
}
