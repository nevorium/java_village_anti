'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
    signInWithProvider: (provider: 'google' | 'discord' | 'facebook') => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    error: null,

    initialize: async () => {
        const supabase = createClient();

        try {
            // Get current session
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            set({
                session,
                user: session?.user ?? null,
                isLoading: false,
            });

            // Listen for auth changes
            supabase.auth.onAuthStateChange((event, session) => {
                set({
                    session,
                    user: session?.user ?? null,
                });
            });
        } catch (error: any) {
            set({
                error: error.message,
                isLoading: false,
            });
        }
    },

    signInWithEmail: async (email, password) => {
        const supabase = createClient();
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            set({
                session: data.session,
                user: data.user,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message,
                isLoading: false,
            });
        }
    },

    signUpWithEmail: async (email, password, username) => {
        const supabase = createClient();
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                    },
                },
            });

            if (error) throw error;

            set({
                session: data.session,
                user: data.user,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message,
                isLoading: false,
            });
        }
    },

    signInWithProvider: async (provider) => {
        const supabase = createClient();
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            set({
                error: error.message,
                isLoading: false,
            });
        }
    },

    signOut: async () => {
        const supabase = createClient();
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            set({
                session: null,
                user: null,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message,
                isLoading: false,
            });
        }
    },

    clearError: () => set({ error: null }),
}));
