// Supabase Database Schema Types
// These types should match your Supabase database schema

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    username: string;
                    display_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                    money: number;
                    last_login: string | null;
                    login_streak: number;
                };
                Insert: {
                    id: string;
                    username: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    money?: number;
                    last_login?: string | null;
                    login_streak?: number;
                };
                Update: {
                    id?: string;
                    username?: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                    money?: number;
                    last_login?: string | null;
                    login_streak?: number;
                };
            };
            worlds: {
                Row: {
                    id: string;
                    owner_id: string;
                    name: string;
                    is_public: boolean;
                    max_players: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    owner_id: string;
                    name: string;
                    is_public?: boolean;
                    max_players?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    owner_id?: string;
                    name?: string;
                    is_public?: boolean;
                    max_players?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            world_state: {
                Row: {
                    id: string;
                    world_id: string;
                    game_time: {
                        day: number;
                        hour: number;
                        minute: number;
                        season: string;
                        year: number;
                    };
                    farm_tiles: unknown[];
                    buildings: unknown[];
                    npcs: unknown[];
                    animals: unknown[];
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    world_id: string;
                    game_time?: unknown;
                    farm_tiles?: unknown[];
                    buildings?: unknown[];
                    npcs?: unknown[];
                    animals?: unknown[];
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    world_id?: string;
                    game_time?: unknown;
                    farm_tiles?: unknown[];
                    buildings?: unknown[];
                    npcs?: unknown[];
                    animals?: unknown[];
                    updated_at?: string;
                };
            };
            player_positions: {
                Row: {
                    id: string;
                    world_id: string;
                    player_id: string;
                    x: number;
                    y: number;
                    z: number;
                    rotation: number;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    world_id: string;
                    player_id: string;
                    x?: number;
                    y?: number;
                    z?: number;
                    rotation?: number;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    world_id?: string;
                    player_id?: string;
                    x?: number;
                    y?: number;
                    z?: number;
                    rotation?: number;
                    updated_at?: string;
                };
            };
            friends: {
                Row: {
                    id: string;
                    user_id: string;
                    friend_id: string;
                    status: 'pending' | 'accepted' | 'blocked';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    friend_id: string;
                    status?: 'pending' | 'accepted' | 'blocked';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    friend_id?: string;
                    status?: 'pending' | 'accepted' | 'blocked';
                    created_at?: string;
                };
            };
            guilds: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    owner_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    owner_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    owner_id?: string;
                    created_at?: string;
                };
            };
            guild_members: {
                Row: {
                    id: string;
                    guild_id: string;
                    user_id: string;
                    role: 'owner' | 'admin' | 'member';
                    joined_at: string;
                };
                Insert: {
                    id?: string;
                    guild_id: string;
                    user_id: string;
                    role?: 'owner' | 'admin' | 'member';
                    joined_at?: string;
                };
                Update: {
                    id?: string;
                    guild_id?: string;
                    user_id?: string;
                    role?: 'owner' | 'admin' | 'member';
                    joined_at?: string;
                };
            };
        };
    };
}
