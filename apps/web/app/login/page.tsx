'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import styles from './LoginPage.module.css';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const { signInWithEmail, signUpWithEmail, signInWithProvider, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'login') {
            await signInWithEmail(email, password);
        } else {
            await signUpWithEmail(email, password, username);
        }
    };

    const handleSocialLogin = (provider: 'google' | 'discord' | 'facebook') => {
        signInWithProvider(provider);
    };

    return (
        <div className={styles.container}>
            <div className={styles.panel}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>🌾 Java Village</h1>
                    <p className={styles.subtitle}>
                        {mode === 'login' ? 'Welcome back, farmer!' : 'Start your farming adventure!'}
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className={styles.error} onClick={clearError}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {mode === 'signup' && (
                        <div className={styles.field}>
                            <label className={styles.label}>Username</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    )}

                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                {/* Divider */}
                <div className={styles.divider}>
                    <span>or continue with</span>
                </div>

                {/* Social login buttons */}
                <div className={styles.socialButtons}>
                    <button
                        className={`${styles.socialButton} ${styles.google}`}
                        onClick={() => handleSocialLogin('google')}
                        disabled={isLoading}
                    >
                        <span className={styles.socialIcon}>🔷</span>
                        Google
                    </button>
                    <button
                        className={`${styles.socialButton} ${styles.discord}`}
                        onClick={() => handleSocialLogin('discord')}
                        disabled={isLoading}
                    >
                        <span className={styles.socialIcon}>💬</span>
                        Discord
                    </button>
                    <button
                        className={`${styles.socialButton} ${styles.facebook}`}
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={isLoading}
                    >
                        <span className={styles.socialIcon}>📘</span>
                        Facebook
                    </button>
                </div>

                {/* Mode toggle */}
                <div className={styles.modeToggle}>
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button onClick={() => setMode('signup')}>Sign up</button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => setMode('login')}>Sign in</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
