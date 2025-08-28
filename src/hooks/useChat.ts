import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    nickname: string;
    avatar: string;
  };
}

const PROFANITY_WORDS = [
  'badword1', 'badword2', 'spam', 'abuse'
  // Add more words as needed
];

export const useChat = (roomId: string | null) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>();

  const filterProfanity = (text: string): string => {
    let filtered = text;
    PROFANITY_WORDS.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
  };

  const sendMessage = async (content: string) => {
    if (!roomId || !user || !content.trim()) return;

    const filteredContent = filterProfanity(content.trim());

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: filteredContent
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendTypingIndicator = (typing: boolean) => {
    if (!roomId || !channelRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user?.id,
        typing
      }
    });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };

  const reportUser = async (reportedUserId: string, reason: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_id: reportedUserId,
          reason
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reporting user:', error);
      return false;
    }
  };

  // Load messages for the room
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Fetch profiles for all messages
        const messagesWithProfiles = await Promise.all(
          (messagesData || []).map(async (message) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('nickname, avatar')
              .eq('user_id', message.user_id)
              .single();

            return {
              ...message,
              profile: profileData || null
            };
          })
        );
        
        setMessages(messagesWithProfiles);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [roomId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!roomId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // Fetch profile for the message
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname, avatar')
            .eq('user_id', newMessage.user_id)
            .single();

          setMessages(prev => [...prev, {
            ...newMessage,
            profile
          }]);
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== user?.id) {
          setPartnerTyping(payload.payload.typing);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, user?.id]);

  // Clean up typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    sendMessage,
    handleTyping,
    partnerTyping,
    reportUser
  };
};