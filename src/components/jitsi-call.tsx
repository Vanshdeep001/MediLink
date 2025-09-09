
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, Users, MessageSquare, Share2, Copy, Check } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateJitsiUrl } from '@/lib/call-management-service';

interface JitsiCallProps {
    roomName: string;
    userName: string;
    onClose: () => void;
}

export function JitsiCall({ roomName, userName, onClose }: JitsiCallProps) {
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    
    const jitsiUrl = generateJitsiUrl(roomName, userName, {
        audioMuted: isMicMuted,
        videoMuted: isCameraOff
    });

    const copyRoomLink = async () => {
        try {
            await navigator.clipboard.writeText(jitsiUrl);
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
    };

    const handleIframeLoad = () => {
        setIsLoading(false);
        setConnectionError(false);
    };

    const handleIframeError = () => {
        setIsLoading(false);
        setConnectionError(true);
    };

    useEffect(() => {
        // Auto-focus on iframe when component mounts
        const timer = setTimeout(() => {
            const iframe = document.querySelector('iframe[src*="meet.jit.si"]') as HTMLIFrameElement;
            if (iframe) {
                iframe.focus();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
       <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">MediLink Video Consultation</DialogTitle>
                <p className="text-sm opacity-90">Room: {roomName}</p>
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
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <PhoneOff className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-grow bg-black relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Connecting to video call...</p>
                </div>
              </div>
            )}
            
            {connectionError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <VideoOff className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <p className="text-lg font-semibold mb-2">Connection Failed</p>
                  <p className="text-sm opacity-75 mb-4">Unable to connect to the video call</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Retry Connection
                  </Button>
                </div>
              </div>
            )}
            
            <iframe
              src={jitsiUrl}
              style={{ width: '100%', height: '100%', border: '0' }}
              allow="camera; microphone; fullscreen; display-capture"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Jitsi Meet Video Call"
            />
          </div>
          
          {/* Call Controls */}
          <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isMicMuted ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsMicMuted(!isMicMuted)}
                className="flex items-center gap-2"
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMicMuted ? 'Unmute' : 'Mute'}
              </Button>
              
              <Button
                variant={isCameraOff ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsCameraOff(!isCameraOff)}
                className="flex items-center gap-2"
              >
                {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                {isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomLink}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
}
