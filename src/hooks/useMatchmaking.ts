import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Room {
  room_id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  ended_at?: string;
}

export const useMatchmaking = () => {
  const { user, profile } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const addToWaitingQueue = async () => {
    if (!user) return;

    try {
      // Remove from any existing queue first
      await supabase
        .from('waiting_users')
        .delete()
        .eq('user_id', user.id);

      // Add to waiting queue
      const { error } = await supabase
        .from('waiting_users')
        .insert({ user_id: user.id });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding to waiting queue:', error);
      return false;
    }
  };

  const removeFromWaitingQueue = async () => {
    if (!user) return;

    try {
      await supabase
        .from('waiting_users')
        .delete()
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error removing from waiting queue:', error);
    }
  };

  const findMatch = async () => {
    if (!user) return null;

    try {
      // Look for other users in the waiting queue
      const { data: waitingUsers, error } = await supabase
        .from('waiting_users')
        .select('user_id')
        .neq('user_id', user.id)
        .limit(1);

      if (error) throw error;

      if (waitingUsers && waitingUsers.length > 0) {
        const partnerId = waitingUsers[0].user_id;

        // Create a room
        const { data: room, error: roomError } = await supabase
          .from('rooms')
          .insert({
            user1_id: user.id,
            user2_id: partnerId
          })
          .select()
          .single();

        if (roomError) throw roomError;

        // Remove both users from waiting queue
        await supabase
          .from('waiting_users')
          .delete()
          .in('user_id', [user.id, partnerId]);

        return room;
      }

      return null;
    } catch (error) {
      console.error('Error finding match:', error);
      return null;
    }
  };

  const startSearch = async () => {
    if (!user || isSearching) return;

    setIsSearching(true);
    
    // Add to waiting queue
    const added = await addToWaitingQueue();
    if (!added) {
      setIsSearching(false);
      return;
    }

    // Start looking for matches every 2 seconds
    const searchInterval = setInterval(async () => {
      const room = await findMatch();
      if (room) {
        clearInterval(searchInterval);
        setCurrentRoom(room);
        setIsSearching(false);
        
        // Fetch partner profile
        const partnerId = room.user1_id === user.id ? room.user2_id : room.user1_id;
        fetchPartnerProfile(partnerId);
      }
    }, 2000);

    // Timeout after 30 seconds
    searchTimeoutRef.current = setTimeout(() => {
      clearInterval(searchInterval);
      setIsSearching(false);
      removeFromWaitingQueue();
    }, 30000);
  };

  const fetchPartnerProfile = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', partnerId)
        .single();

      if (error) throw error;
      setPartnerProfile(data);
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom || !user) return;

    try {
      // Update room as ended
      await supabase
        .from('rooms')
        .update({ ended_at: new Date().toISOString() })
        .eq('room_id', currentRoom.room_id);

      setCurrentRoom(null);
      setPartnerProfile(null);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const nextChat = async () => {
    await leaveRoom();
    setTimeout(() => {
      startSearch();
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      removeFromWaitingQueue();
    };
  }, []);

  // Listen for new rooms being created
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rooms',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
        },
        (payload) => {
          const newRoom = payload.new as Room;
          if (newRoom.user1_id === user.id || newRoom.user2_id === user.id) {
            setCurrentRoom(newRoom);
            setIsSearching(false);
            
            // Fetch partner profile
            const partnerId = newRoom.user1_id === user.id ? newRoom.user2_id : newRoom.user1_id;
            fetchPartnerProfile(partnerId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    isSearching,
    currentRoom,
    partnerProfile,
    profile,
    startSearch,
    nextChat,
    leaveRoom
  };
};