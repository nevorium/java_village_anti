'use client';

import { createClient } from '@/lib/supabase/client';

export interface World {
    id: string;
    ownerId: string;
    name: string;
    isPublic: boolean;
    maxPlayers: number;
    createdAt: string;
}

export interface WorldWithOwner extends World {
    ownerUsername?: string;
    playerCount?: number;
}

class WorldManager {
    private supabase = createClient();

    /**
     * Create a new world
     */
    async createWorld(name: string, isPublic: boolean = false): Promise<World> {
        const { data: user } = await this.supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        // Create the world
        const { data: world, error } = await this.supabase
            .from('worlds')
            .insert({
                owner_id: user.user.id,
                name,
                is_public: isPublic,
                max_players: 10,
            })
            .select()
            .single();

        if (error) throw error;

        // Initialize world state
        await this.supabase.from('world_state').insert({
            world_id: world.id,
            game_time: { day: 1, hour: 6, minute: 0, season: 'spring', year: 1 },
            farm_tiles: [],
            buildings: [],
            npcs: [],
            animals: [],
        });

        return this.mapWorld(world);
    }

    /**
     * Get worlds owned by the current user
     */
    async getMyWorlds(): Promise<World[]> {
        const { data: user } = await this.supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        const { data, error } = await this.supabase
            .from('worlds')
            .select('*')
            .eq('owner_id', user.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(this.mapWorld);
    }

    /**
     * Get public worlds
     */
    async getPublicWorlds(): Promise<WorldWithOwner[]> {
        const { data, error } = await this.supabase
            .from('worlds')
            .select(`
        *,
        profiles:owner_id (username)
      `)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return (data || []).map((w: any) => ({
            ...this.mapWorld(w),
            ownerUsername: w.profiles?.username,
        }));
    }

    /**
     * Get world by ID
     */
    async getWorld(worldId: string): Promise<World | null> {
        const { data, error } = await this.supabase
            .from('worlds')
            .select('*')
            .eq('id', worldId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return this.mapWorld(data);
    }

    /**
     * Join a world by ID
     */
    async joinWorld(worldId: string): Promise<World> {
        const world = await this.getWorld(worldId);
        if (!world) throw new Error('World not found');

        const { data: user } = await this.supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        // Create initial player position
        await this.supabase.from('player_positions').upsert({
            world_id: worldId,
            player_id: user.user.id,
            x: 0,
            y: 0,
            z: 0,
            rotation: 0,
        });

        // Create initial inventory
        await this.supabase.from('player_inventory').upsert({
            world_id: worldId,
            player_id: user.user.id,
            inventory: [],
        });

        return world;
    }

    /**
     * Delete a world (owner only)
     */
    async deleteWorld(worldId: string): Promise<void> {
        const { error } = await this.supabase
            .from('worlds')
            .delete()
            .eq('id', worldId);

        if (error) throw error;
    }

    /**
     * Update world settings
     */
    async updateWorld(
        worldId: string,
        updates: Partial<Pick<World, 'name' | 'isPublic' | 'maxPlayers'>>
    ): Promise<World> {
        const { data, error } = await this.supabase
            .from('worlds')
            .update({
                name: updates.name,
                is_public: updates.isPublic,
                max_players: updates.maxPlayers,
            })
            .eq('id', worldId)
            .select()
            .single();

        if (error) throw error;

        return this.mapWorld(data);
    }

    /**
     * Get world state
     */
    async getWorldState(worldId: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('world_state')
            .select('*')
            .eq('world_id', worldId)
            .single();

        if (error) throw error;

        return data;
    }

    /**
     * Update world state
     */
    async updateWorldState(worldId: string, state: any): Promise<void> {
        const { error } = await this.supabase
            .from('world_state')
            .update(state)
            .eq('world_id', worldId);

        if (error) throw error;
    }

    private mapWorld(data: any): World {
        return {
            id: data.id,
            ownerId: data.owner_id,
            name: data.name,
            isPublic: data.is_public,
            maxPlayers: data.max_players,
            createdAt: data.created_at,
        };
    }
}

// Singleton instance
export const worldManager = new WorldManager();
