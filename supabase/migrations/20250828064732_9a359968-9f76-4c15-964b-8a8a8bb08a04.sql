-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar TEXT,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waiting_users table for matchmaking queue
CREATE TABLE public.waiting_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table for chat rooms
CREATE TABLE public.rooms (
  room_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table for chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(room_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table for user reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for waiting_users
CREATE POLICY "Users can manage their own waiting status" ON public.waiting_users FOR ALL USING (auth.uid() = user_id);

-- Create policies for rooms
CREATE POLICY "Users can view their own rooms" ON public.rooms FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "System can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own rooms" ON public.rooms FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create policies for messages
CREATE POLICY "Users can view messages in their rooms" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE room_id = messages.room_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);
CREATE POLICY "Users can insert messages in their rooms" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE room_id = messages.room_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Create policies for reports
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    random_nicknames TEXT[] := ARRAY[
        'HappyPanda', 'CoolCat', 'WiseOwl', 'BraveLion', 'QuickFox',
        'SmartWhale', 'FunnyBear', 'CleverDog', 'FastRabbit', 'StrongElephant',
        'GentleDeer', 'PlayfulDolphin', 'CuriousMonkey', 'FriendlyTiger', 'KindUnicorn'
    ];
    random_avatars TEXT[] := ARRAY[
        '🐼', '😺', '🦉', '🦁', '🦊', '🐋', '🐻', '🐶', '🐰', '🐘',
        '🦌', '🐬', '🐵', '🐯', '🦄', '🐨', '🐸', '🐧', '🦆', '🐙'
    ];
    random_number INTEGER;
    nickname_base TEXT;
    avatar_emoji TEXT;
    final_nickname TEXT;
BEGIN
    -- Generate random nickname and avatar
    nickname_base := random_nicknames[floor(random() * array_length(random_nicknames, 1) + 1)];
    avatar_emoji := random_avatars[floor(random() * array_length(random_avatars, 1) + 1)];
    random_number := floor(random() * 9999 + 1);
    final_nickname := nickname_base || random_number::TEXT;
    
    INSERT INTO public.profiles (user_id, nickname, avatar)
    VALUES (NEW.id, final_nickname, avatar_emoji);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiting_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Set replica identity for realtime updates
ALTER TABLE public.waiting_users REPLICA IDENTITY FULL;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;