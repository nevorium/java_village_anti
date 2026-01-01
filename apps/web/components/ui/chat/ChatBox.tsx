'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './ChatBox.module.css';

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    type: 'player' | 'system' | 'npc';
}

interface ChatBoxProps {
    worldId: string;
    currentPlayerId: string;
    currentPlayerName: string;
}

export default function ChatBox({ worldId, currentPlayerId, currentPlayerName }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Subscribe to chat channel
    useEffect(() => {
        const channel = supabase
            .channel(`chat:${worldId}`)
            .on('broadcast', { event: 'message' }, ({ payload }) => {
                setMessages((prev) => [...prev, payload as ChatMessage]);
            })
            .subscribe();

        // Add welcome message
        setMessages([
            {
                id: 'welcome',
                senderId: 'system',
                senderName: 'System',
                content: 'Welcome to Java Village! Use chat to communicate with other players.',
                timestamp: new Date().toISOString(),
                type: 'system',
            },
        ]);

        return () => {
            supabase.removeChannel(channel);
        };
    }, [worldId, supabase]);

    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        const message: ChatMessage = {
            id: `${Date.now()}-${currentPlayerId}`,
            senderId: currentPlayerId,
            senderName: currentPlayerName,
            content: inputValue.trim(),
            timestamp: new Date().toISOString(),
            type: 'player',
        };

        // Broadcast to channel
        await supabase.channel(`chat:${worldId}`).send({
            type: 'broadcast',
            event: 'message',
            payload: message,
        });

        // Add to local messages
        setMessages((prev) => [...prev, message]);
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isMinimized) {
        return (
            <button
                className={styles.minimizedButton}
                onClick={() => setIsMinimized(false)}
            >
                💬 Chat
                {messages.length > 1 && (
                    <span className={styles.badge}>{messages.length - 1}</span>
                )}
            </button>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>💬 Chat</span>
                <button
                    className={styles.minimizeButton}
                    onClick={() => setIsMinimized(true)}
                >
                    −
                </button>
            </div>

            <div className={styles.messages}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.message} ${styles[msg.type]} ${msg.senderId === currentPlayerId ? styles.own : ''
                            }`}
                    >
                        {msg.type !== 'system' && (
                            <span className={styles.sender}>{msg.senderName}</span>
                        )}
                        <span className={styles.content}>{msg.content}</span>
                        <span className={styles.time}>{formatTime(msg.timestamp)}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
                <input
                    type="text"
                    className={styles.input}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    maxLength={200}
                />
                <button className={styles.sendButton} onClick={sendMessage}>
                    ➤
                </button>
            </div>
        </div>
    );
}
