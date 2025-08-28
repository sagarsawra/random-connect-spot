import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  SkipForward, 
  Flag, 
  MessageCircle, 
  X,
  Send,
  Volume2,
  VolumeX,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useChat } from "@/hooks/useChat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const VideoChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const { isSearching, currentRoom, partnerProfile, startSearch, nextChat } = useMatchmaking();
  const { messages, sendMessage, handleTyping, partnerTyping, reportUser } = useChat(currentRoom?.room_id || null);
  
  // Video states
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      initializeLocalVideo();
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  const initializeLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera/mic:", err);
      toast({
        title: "Camera Error",
        description: "Could not access camera or microphone",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() && currentRoom) {
      await sendMessage(messageInput);
      setMessageInput("");
    }
  };

  const handleReportUser = async () => {
    if (!partnerProfile || !reportReason.trim()) return;

    const success = await reportUser(partnerProfile.user_id, reportReason);
    if (success) {
      toast({
        title: "User Reported",
        description: "Thank you for keeping our community safe"
      });
      setReportDialogOpen(false);
      setReportReason("");
    } else {
      toast({
        title: "Error",
        description: "Failed to report user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartSearch = () => {
    if (!isSearching && !currentRoom) {
      startSearch();
      toast({
        title: "Searching...",
        description: "Looking for someone to chat with"
      });
    }
  };

  const handleNextChat = () => {
    nextChat();
    toast({
      title: "Searching...",
      description: "Looking for your next connection"
    });
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isCameraOn;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  if (!user) return null;

  const isConnected = !!currentRoom;

  return (
    <div className="min-h-screen animate-gradient p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold gradient-text">RandomTalk</h1>
            {profile && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{profile.avatar}</span>
                <span>{profile.nickname}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={signOut}
              className="text-sm"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Remote Video */}
            <Card className="bg-card/50 backdrop-blur-sm border-video-border">
              <CardContent className="p-4">
                <div className="video-panel aspect-video relative">
                  {isConnected && partnerProfile ? (
                    <>
                      <div className="flex items-center justify-center h-full bg-video-bg">
                        <div className="text-center">
                          <div className="text-6xl mb-4">{partnerProfile.avatar}</div>
                          <h3 className="text-xl font-semibold mb-2">{partnerProfile.nickname}</h3>
                          <p className="text-muted-foreground">Connected</p>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-online rounded-full px-3 py-1 text-xs font-medium text-white">
                        Connected
                      </div>
                    </>
                  ) : isSearching ? (
                    <div className="flex items-center justify-center h-full bg-video-bg">
                      <div className="text-center">
                        <div className="animate-pulse-gentle mb-4">
                          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Finding Someone...</h3>
                        <p className="text-muted-foreground">This may take a few moments</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-video-bg">
                      <div className="text-center">
                        <Button onClick={handleStartSearch} size="lg">
                          Start Chatting
                        </Button>
                        <p className="text-muted-foreground mt-2">Click to find someone to chat with</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Local Video & Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Local Video */}
              <Card className="flex-1 bg-card/50 backdrop-blur-sm border-video-border">
                <CardContent className="p-4">
                  <div className="video-panel aspect-video relative">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    
                    {!isCameraOn && (
                      <div className="absolute inset-0 bg-video-bg flex items-center justify-center">
                        <CameraOff className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 text-xs bg-background/80 rounded px-2 py-1">
                      You
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Control Panel */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-4">
                    {/* Primary Controls */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={isCameraOn ? "secondary" : "destructive"}
                        onClick={toggleCamera}
                        className="control-btn"
                      >
                        {isCameraOn ? (
                          <Camera className="h-5 w-5" />
                        ) : (
                          <CameraOff className="h-5 w-5" />
                        )}
                      </Button>

                      <Button
                        variant={isMicOn ? "secondary" : "destructive"}
                        onClick={toggleMic}
                        className="control-btn"
                      >
                        {isMicOn ? (
                          <Mic className="h-5 w-5" />
                        ) : (
                          <MicOff className="h-5 w-5" />
                        )}
                      </Button>

                      <Button
                        variant={isSpeakerOn ? "secondary" : "outline"}
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className="control-btn"
                      >
                        {isSpeakerOn ? (
                          <Volume2 className="h-5 w-5" />
                        ) : (
                          <VolumeX className="h-5 w-5" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setShowChat(!showChat)}
                        className="control-btn"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Action Controls */}
                    <div className="space-y-2">
                      <Button
                        onClick={handleNextChat}
                        className="w-full"
                        disabled={!isConnected}
                      >
                        <SkipForward className="mr-2 h-4 w-4" />
                        Next Chat
                      </Button>

                      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full"
                            disabled={!isConnected}
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Report User</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Please describe why you're reporting this user. Your report helps keep our community safe.
                            </p>
                            <Textarea
                              placeholder="Reason for reporting..."
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              rows={3}
                            />
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleReportUser}
                                disabled={!reportReason.trim()}
                                className="flex-1"
                              >
                                Submit Report
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setReportDialogOpen(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="lg:col-span-1">
              <Card className="bg-chat-bg/90 backdrop-blur-sm h-96 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold">Chat</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`chat-bubble ${
                        message.user_id === user?.id
                          ? 'ml-auto bg-primary text-primary-foreground'
                          : 'mr-auto bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs">
                          {message.profile?.avatar} {message.profile?.nickname || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                  {partnerTyping && (
                    <div className="mr-auto bg-secondary text-secondary-foreground chat-bubble">
                      <p className="text-sm italic">Typing...</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={!isConnected}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSendMessage} disabled={!isConnected}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoChat;