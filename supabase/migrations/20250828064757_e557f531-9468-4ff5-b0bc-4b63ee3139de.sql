-- Fix security warnings by setting search path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;