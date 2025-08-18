import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, Mic, MicOff, CameraOff, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CameraSetup = () => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeMedia();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsPermissionGranted(true);
    } catch (err) {
      console.error("Error accessing camera/mic:", err);
      setIsPermissionGranted(false);
    }
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
    <div className="min-h-screen animate-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Camera Setup</h1>
          <p className="text-xl text-muted-foreground">
            Check your camera and microphone before joining
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-video-border">
              <CardContent className="p-6">
                <div className="video-panel aspect-video relative">
                  {isPermissionGranted ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }} // Mirror effect
                      />
                      
                      {!isCameraOn && (
                        <div className="absolute inset-0 bg-video-bg flex items-center justify-center">
                          <div className="text-center">
                            <CameraOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Camera is off</p>
                          </div>
                        </div>
                      )}
                      
                      {!isMicOn && (
                        <div className="absolute top-4 left-4">
                          <div className="bg-destructive rounded-full p-2">
                            <MicOff className="h-4 w-4 text-destructive-foreground" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-video-bg">
                      <div className="text-center">
                        <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Camera permission required
                        </p>
                        <Button onClick={initializeMedia}>
                          Grant Permissions
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4 mt-6">
                  <Button
                    variant={isCameraOn ? "secondary" : "destructive"}
                    size="lg"
                    onClick={toggleCamera}
                    className="control-btn"
                  >
                    {isCameraOn ? (
                      <Camera className="h-6 w-6" />
                    ) : (
                      <CameraOff className="h-6 w-6" />
                    )}
                  </Button>

                  <Button
                    variant={isMicOn ? "secondary" : "destructive"}
                    size="lg"
                    onClick={toggleMic}
                    className="control-btn"
                  >
                    {isMicOn ? (
                      <Mic className="h-6 w-6" />
                    ) : (
                      <MicOff className="h-6 w-6" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="control-btn"
                  >
                    <Settings className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions & Actions */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <span>Setup Checklist</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isPermissionGranted ? 'bg-online' : 'bg-offline'}`} />
                  <span className="text-sm">Camera Permission</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isCameraOn ? 'bg-online' : 'bg-warning'}`} />
                  <span className="text-sm">Camera Active</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isMicOn ? 'bg-online' : 'bg-warning'}`} />
                  <span className="text-sm">Microphone Active</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Link to="/video-chat" className="block">
                <Button 
                  size="lg" 
                  className="w-full animate-glow"
                  disabled={!isPermissionGranted}
                >
                  Start Chatting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraSetup;