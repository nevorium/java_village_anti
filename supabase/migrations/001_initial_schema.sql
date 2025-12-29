-- Java Village Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  money INTEGER DEFAULT 500,
  last_login TIMESTAMPTZ,
  login_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worlds table
CREATE TABLE public.worlds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  max_players INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- World state (game data)
CREATE TABLE public.world_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID UNIQUE NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  game_time JSONB DEFAULT '{"day": 1, "hour": 6, "minute": 0, "season": "spring", "year": 1}',
  farm_tiles JSONB DEFAULT '[]',
  buildings JSONB DEFAULT '[]',
  npcs JSONB DEFAULT '[]',
  animals JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player positions (for real-time sync)
CREATE TABLE public.player_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  x FLOAT DEFAULT 0,
  y FLOAT DEFAULT 0,
  z FLOAT DEFAULT 0,
  rotation FLOAT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(world_id, player_id)
);

-- Friends table
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Guilds table
CREATE TABLE public.guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guild members
CREATE TABLE public.guild_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

-- Player inventory (persisted per world)
CREATE TABLE public.player_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  inventory JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(world_id, player_id)
);

-- Row Level Security Policies

-- Profiles: Users can read all, update own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Worlds: Public worlds viewable by all, private by owner/members
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public worlds are viewable"
  ON public.worlds FOR SELECT
  USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "Users can create worlds"
  ON public.worlds FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their worlds"
  ON public.worlds FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their worlds"
  ON public.worlds FOR DELETE
  USING (owner_id = auth.uid());

-- World state: Same access as world
ALTER TABLE public.world_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "World state follows world access"
  ON public.world_state FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.worlds
      WHERE worlds.id = world_state.world_id
      AND (worlds.is_public = true OR worlds.owner_id = auth.uid())
    )
  );

-- Player positions: Players in same world can see each other
ALTER TABLE public.player_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can see positions in their world"
  ON public.player_positions FOR SELECT
  USING (true);

CREATE POLICY "Players can update own position"
  ON public.player_positions FOR ALL
  USING (player_id = auth.uid());

-- Friends: Users can manage their own friendships
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their friends"
  ON public.friends FOR SELECT
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can manage friendships"
  ON public.friends FOR ALL
  USING (user_id = auth.uid());

-- Guilds: Public
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guilds are viewable"
  ON public.guilds FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage guilds"
  ON public.guilds FOR ALL
  USING (owner_id = auth.uid());

-- Guild members
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild members are viewable"
  ON public.guild_members FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own membership"
  ON public.guild_members FOR ALL
  USING (user_id = auth.uid());

-- Player inventory
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can access own inventory"
  ON public.player_inventory FOR ALL
  USING (player_id = auth.uid());

-- Functions

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'player_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for player positions
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_positions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.world_state;
