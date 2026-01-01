'use client';

import { useRewardsStore } from '@/stores/rewardsStore';
import styles from './DailyRewards.module.css';

export default function DailyRewardsPopup() {
    const showPopup = useRewardsStore((state) => state.showDailyRewardPopup);
    const dailyRewards = useRewardsStore((state) => state.dailyRewards);
    const loginStreak = useRewardsStore((state) => state.loginStreak);
    const claimDailyReward = useRewardsStore((state) => state.claimDailyReward);
    const closePopup = useRewardsStore((state) => state.closeDailyRewardPopup);

    if (!showPopup) return null;

    const getRewardIcon = (reward: (typeof dailyRewards)[0]['reward']) => {
        if (reward.type === 'money') return '💰';
        if (reward.itemId?.includes('seed')) return '🌱';
        return '🎁';
    };

    const getRewardText = (reward: (typeof dailyRewards)[0]['reward']) => {
        if (reward.type === 'money') return `${reward.amount}G`;
        return `${reward.amount}x ${reward.itemId}`;
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <div className={styles.header}>
                    <h2 className={styles.title}>🎉 Daily Login Rewards!</h2>
                    <p className={styles.streak}>
                        Login Streak: <span className={styles.streakNumber}>{loginStreak}</span> days
                    </p>
                </div>

                <div className={styles.rewardsGrid}>
                    {dailyRewards.map((reward) => (
                        <div
                            key={reward.day}
                            className={`${styles.rewardCard} ${reward.claimed ? styles.claimed : ''
                                } ${reward.day === loginStreak ? styles.today : ''}`}
                        >
                            <span className={styles.day}>Day {reward.day}</span>
                            <span className={styles.icon}>{getRewardIcon(reward.reward)}</span>
                            <span className={styles.rewardText}>{getRewardText(reward.reward)}</span>

                            {reward.day === loginStreak && !reward.claimed && (
                                <button
                                    className={styles.claimButton}
                                    onClick={() => claimDailyReward(reward.day)}
                                >
                                    Claim!
                                </button>
                            )}

                            {reward.claimed && <span className={styles.claimedBadge}>✓</span>}
                        </div>
                    ))}
                </div>

                <button className={styles.closeButton} onClick={closePopup}>
                    Continue Playing
                </button>
            </div>
        </div>
    );
}
