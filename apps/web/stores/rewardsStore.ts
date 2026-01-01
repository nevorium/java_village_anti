'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface DailyReward {
    day: number;
    reward: {
        type: 'money' | 'item' | 'exp';
        itemId?: string;
        amount: number;
    };
    claimed: boolean;
}

interface Quest {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    reward: {
        type: 'money' | 'item' | 'exp';
        itemId?: string;
        amount: number;
    };
    completed: boolean;
    claimed: boolean;
}

interface RewardsState {
    loginStreak: number;
    lastLoginDate: string | null;
    dailyRewards: DailyReward[];
    dailyQuests: Quest[];
    showDailyRewardPopup: boolean;

    // Actions
    checkDailyLogin: () => Promise<void>;
    claimDailyReward: (day: number) => void;
    updateQuestProgress: (questId: string, progress: number) => void;
    claimQuestReward: (questId: string) => void;
    closeDailyRewardPopup: () => void;
}

// Generate daily rewards for 7 days
const generateDailyRewards = (streak: number): DailyReward[] => {
    const baseRewards: DailyReward[] = [
        { day: 1, reward: { type: 'money', amount: 100 }, claimed: false },
        { day: 2, reward: { type: 'money', amount: 150 }, claimed: false },
        { day: 3, reward: { type: 'item', itemId: 'wheat_seed', amount: 5 }, claimed: false },
        { day: 4, reward: { type: 'money', amount: 200 }, claimed: false },
        { day: 5, reward: { type: 'item', itemId: 'carrot_seed', amount: 5 }, claimed: false },
        { day: 6, reward: { type: 'money', amount: 300 }, claimed: false },
        { day: 7, reward: { type: 'money', amount: 500 }, claimed: false },
    ];

    return baseRewards.map((r) => ({
        ...r,
        claimed: r.day < streak,
    }));
};

// Generate daily quests
const generateDailyQuests = (): Quest[] => [
    {
        id: 'harvest_5',
        title: 'Harvest Master',
        description: 'Harvest 5 crops',
        progress: 0,
        target: 5,
        reward: { type: 'money', amount: 150 },
        completed: false,
        claimed: false,
    },
    {
        id: 'water_10',
        title: 'Water Bearer',
        description: 'Water 10 plants',
        progress: 0,
        target: 10,
        reward: { type: 'money', amount: 100 },
        completed: false,
        claimed: false,
    },
    {
        id: 'plant_3',
        title: 'Seed Sower',
        description: 'Plant 3 new seeds',
        progress: 0,
        target: 3,
        reward: { type: 'item', itemId: 'tomato_seed', amount: 3 },
        completed: false,
        claimed: false,
    },
    {
        id: 'earn_500',
        title: 'Merchant',
        description: 'Earn 500G from sales',
        progress: 0,
        target: 500,
        reward: { type: 'money', amount: 200 },
        completed: false,
        claimed: false,
    },
];

export const useRewardsStore = create<RewardsState>((set, get) => ({
    loginStreak: 0,
    lastLoginDate: null,
    dailyRewards: generateDailyRewards(0),
    dailyQuests: generateDailyQuests(),
    showDailyRewardPopup: false,

    checkDailyLogin: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const { lastLoginDate, loginStreak } = get();

        if (lastLoginDate === today) {
            // Already logged in today
            return;
        }

        // Check if it's a consecutive day
        let newStreak = 1;
        if (lastLoginDate) {
            const lastDate = new Date(lastLoginDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor(
                (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 1) {
                // Consecutive day
                newStreak = (loginStreak % 7) + 1;
            }
            // If more than 1 day, streak resets to 1
        }

        // Update profile in Supabase
        await supabase.from('profiles').update({
            last_login: today,
            login_streak: newStreak,
        }).eq('id', user.id);

        set({
            loginStreak: newStreak,
            lastLoginDate: today,
            dailyRewards: generateDailyRewards(newStreak),
            dailyQuests: generateDailyQuests(),
            showDailyRewardPopup: true,
        });
    },

    claimDailyReward: (day) => {
        set((state) => ({
            dailyRewards: state.dailyRewards.map((r) =>
                r.day === day ? { ...r, claimed: true } : r
            ),
        }));
        // TODO: Actually add reward to inventory
    },

    updateQuestProgress: (questId, progress) => {
        set((state) => ({
            dailyQuests: state.dailyQuests.map((q) =>
                q.id === questId
                    ? {
                        ...q,
                        progress,
                        completed: progress >= q.target,
                    }
                    : q
            ),
        }));
    },

    claimQuestReward: (questId) => {
        set((state) => ({
            dailyQuests: state.dailyQuests.map((q) =>
                q.id === questId && q.completed ? { ...q, claimed: true } : q
            ),
        }));
        // TODO: Actually add reward to inventory
    },

    closeDailyRewardPopup: () => set({ showDailyRewardPopup: false }),
}));
