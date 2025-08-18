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
  VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: 'you' | 'stranger';
  timestamp: Date;
}

const VideoChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Video states
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeLocalVideo();
    simulateConnection();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  // Simulate finding a connection
  const simulateConnection = () => {
    setTimeout(() => {
      setIsSearching(false);
      setIsConnected(true);
      toast({
        title: "Connected!",
        description: "You're now connected with a stranger"
      });
      
      // Add a welcome message from stranger
      setTimeout(() => {
        addMessage("Hello! How are you?", "stranger");
      }, 1000);
    }, 3000);
  };

  const addMessage = (text: string, sender: 'you' | 'stranger') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      addMessage(messageInput, "you");
      setMessageInput("");
      
      // Simulate stranger response
      setTimeout(() => {
        const responses = [
          "That's interesting!",
          "Tell me more about that",
          "I agree!",
          "What do you think about...",
          "Nice to meet you!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, "stranger");
      }, 1000 + Math.random() * 2000);
    }
  };

  const nextChat = () => {
    setIsConnected(false);
    setIsSearching(true);
    setMessages([]);
    toast({
      title: "Searching...",
      description: "Looking for your next connection"
    });
    simulateConnection();
  };

  const reportUser = () => {
    toast({
      title: "User Reported",
      description: "Thank you for keeping our community safe",
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

  return (
    <div className="min-h-screen animate-gradient p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold gradient-text">RandomTalk</h1>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="text-sm"
          >
            Leave Chat
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Remote Video */}
            <Card className="bg-card/50 backdrop-blur-sm border-video-border">
              <CardContent className="p-4">
                <div className="video-panel aspect-video relative">
                  {isConnected ? (
                    <>
                      <video
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover"
                        poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjMUExQTFBIi8+CjxjaXJjbGUgY3g9IjMyMCIgY3k9IjEyMCIgcj0iNDAiIGZpbGw9IiM0QzRDNEMiLz4KPHJlY3QgeD0iMjYwIiB5PSIxODAiIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIHJ4PSI0MCIgZmlsbD0iIzRDNEM0QyIvPgo8L3N2Zz4K"
                      />
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
                        <p className="text-muted-foreground">No connection</p>
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
                        onClick={nextChat}
                        className="w-full"
                        disabled={!isConnected}
                      >
                        <SkipForward className="mr-2 h-4 w-4" />
                        Next Chat
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={reportUser}
                        className="w-full"
                        disabled={!isConnected}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </Button>
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
                        message.sender === 'you'
                          ? 'ml-auto bg-primary text-primary-foreground'
                          : 'mr-auto bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={sendMessage}>
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