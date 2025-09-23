'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Settings, 
  Users, 
  MessageSquare, 
  Share2, 
  Copy, 
  Check,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { webrtcService, WebRTCConfig, WebRTCCallState } from '@/lib/webrtc-service';
import { websocketService } from '@/lib/websocket-service';

interface WebRTCVideoCallProps {
  roomId: string;
  userId: string;
  userName: string;
  isInitiator: boolean;
  onClose: () => void;
  onCallEnded?: () => void;
}

export function WebRTCVideoCall({ 
  roomId, 
  userId, 
  userName, 
  isInitiator, 
  onClose, 
  onCallEnded 
}: WebRTCVideoCallProps) {
  const [callState, setCallState] = useState<WebRTCCallState>(webrtcService.getCallState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Initialize WebRTC
  useEffect(() => {
    const initializeCall = async () => {
      try {
        setIsConnecting(true);
        setConnectionError(null);

        const config: WebRTCConfig = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
          signalingServerUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws',
          roomId,
          userId,
          userName
        };

        await webrtcService.initialize(config);

        // Set up state change listener
        webrtcService.onStateChange((state) => {
          setCallState(state);
          
          if (state.error) {
            setConnectionError(state.error);
            setIsConnecting(false);
          }
        });

        // Start or join call
        if (isInitiator) {
          await webrtcService.startCall();
        } else {
          await webrtcService.joinCall();
        }

        // Set up local video stream
        const localStream = webrtcService.getLocalStream();
        if (localStream && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Set up remote video streams
        const remoteStreams = webrtcService.getRemoteStreams();
        if (remoteStreams.size > 0 && remoteVideoRef.current) {
          const firstRemoteStream = remoteStreams.values().next().value;
          if (firstRemoteStream) {
            remoteVideoRef.current.srcObject = firstRemoteStream;
          }
        }

        setIsConnecting(false);
      } catch (error) {
        console.error('Failed to initialize call:', error);
        setConnectionError('Failed to start video call');
        setIsConnecting(false);
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      webrtcService.offStateChange(setCallState);
    };
  }, [roomId, userId, userName, isInitiator]);

  // Handle call state changes
  useEffect(() => {
    if (callState.isConnected) {
      setConnectionError(null);
    }
  }, [callState.isConnected]);

  // Handle local video stream changes
  useEffect(() => {
    const localStream = webrtcService.getLocalStream();
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [callState.isVideoOff]);

  // Handle remote video stream changes
  useEffect(() => {
    const remoteStreams = webrtcService.getRemoteStreams();
    if (remoteStreams.size > 0 && remoteVideoRef.current) {
      const firstRemoteStream = remoteStreams.values().next().value;
      if (firstRemoteStream) {
        remoteVideoRef.current.srcObject = firstRemoteStream;
      }
    }
  }, [callState.participants]);

  const handleMuteToggle = useCallback(async () => {
    try {
      await webrtcService.toggleMute();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      toast({
        title: "Error",
        description: "Failed to toggle microphone",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleVideoToggle = useCallback(async () => {
    try {
      await webrtcService.toggleVideo();
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast({
        title: "Error",
        description: "Failed to toggle camera",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleScreenShareToggle = useCallback(async () => {
    try {
      await webrtcService.toggleScreenShare();
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      toast({
        title: "Error",
        description: "Failed to toggle screen sharing",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleEndCall = useCallback(async () => {
    try {
      await webrtcService.endCall();
      onCallEnded?.();
      onClose();
    } catch (error) {
      console.error('Failed to end call:', error);
      onClose();
    }
  }, [onClose, onCallEnded]);

  const copyRoomLink = useCallback(async () => {
    try {
      const roomLink = `${window.location.origin}/video-call/${roomId}`;
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      toast({
        title: "Room link copied!",
        description: "Share this link with others to join the call.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the room link. Please try again.",
        variant: "destructive",
      });
    }
  }, [roomId, toast]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'fair': return 'text-orange-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="text-xl font-bold">MediLink Video Consultation</DialogTitle>
                <p className="text-sm opacity-90">Room: {roomId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {callState.participants.length + 1} participants
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`bg-white/20 text-white ${getConnectionQualityColor(callState.connectionQuality)}`}
                >
                  {callState.connectionQuality}
                </Badge>
                {callState.isConnected && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {formatDuration(callState.callDuration)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomLink}
                className="text-white hover:bg-white/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndCall}
                className="text-white hover:bg-white/20"
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-grow bg-black relative flex">
          {/* Main video area */}
          <div className="flex-grow relative">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* Local video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              {callState.isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {/* Connection status overlay */}
            {isConnecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Connecting to video call...</p>
                </div>
              </div>
            )}
            
            {connectionError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <div className="text-center text-white">
                  <VideoOff className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <p className="text-lg font-semibold mb-2">Connection Failed</p>
                  <p className="text-sm opacity-75 mb-4">{connectionError}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Retry Connection
                  </Button>
                </div>
              </div>
            )}

            {/* Video off overlay for remote participant */}
            {callState.participants.length > 0 && callState.participants[0].isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <VideoOff className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">{callState.participants[0].name}</p>
                  <p className="text-sm opacity-75">Camera is off</p>
                </div>
              </div>
            )}
          </div>

          {/* Participants sidebar */}
          {isSettingsOpen && (
            <div className="w-80 bg-gray-900 text-white p-4 border-l">
              <h3 className="text-lg font-semibold mb-4">Call Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Audio Settings</h4>
                  <div className="space-y-2">
                    <Button
                      variant={callState.isMuted ? "destructive" : "outline"}
                      size="sm"
                      onClick={handleMuteToggle}
                      className="w-full justify-start"
                    >
                      {callState.isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {callState.isMuted ? 'Unmute' : 'Mute'}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Video Settings</h4>
                  <div className="space-y-2">
                    <Button
                      variant={callState.isVideoOff ? "destructive" : "outline"}
                      size="sm"
                      onClick={handleVideoToggle}
                      className="w-full justify-start"
                    >
                      {callState.isVideoOff ? <VideoOff className="w-4 h-4 mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                      {callState.isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
                    </Button>
                    <Button
                      variant={callState.isScreenSharing ? "default" : "outline"}
                      size="sm"
                      onClick={handleScreenShareToggle}
                      className="w-full justify-start"
                    >
                      {callState.isScreenSharing ? <MonitorOff className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                      {callState.isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Participants ({callState.participants.length + 1})</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium">{userName} (You)</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {callState.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                          {callState.isVideoOff ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                    
                    {callState.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium">{participant.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {participant.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                            {participant.isVideoOff ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                            <span className={`${getConnectionQualityColor(participant.connectionQuality)}`}>
                              {participant.connectionQuality}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Call Controls */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={callState.isMuted ? "destructive" : "outline"}
              size="lg"
              onClick={handleMuteToggle}
              className="flex items-center gap-2"
            >
              {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {callState.isMuted ? 'Unmute' : 'Mute'}
            </Button>
            
            <Button
              variant={callState.isVideoOff ? "destructive" : "outline"}
              size="lg"
              onClick={handleVideoToggle}
              className="flex items-center gap-2"
            >
              {callState.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              {callState.isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleScreenShareToggle}
              className="flex items-center gap-2"
            >
              {callState.isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              {callState.isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={copyRoomLink}
              className="flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="flex items-center gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

