'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize, Minimize, User } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";

interface WebRTCCallProps {
  room: string;
  isCaller: boolean;
  remoteUserName: string;
  onClose: () => void;
  targetId: string; // The ID of the person to call (Socket ID or User ID mapping)
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

export function WebRTCCall({ room, isCaller, remoteUserName, onClose, targetId }: WebRTCCallProps) {
  const { socket } = useSocket();
  const { toast } = useToast();
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'requesting' | 'connecting' | 'connected' | 'ended'>('requesting');
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setCallStatus('ended');
    toast({ title: "Call Ended", description: `Consultation with ${remoteUserName} finished.` });
    
    // Notify peer
    if (socket) {
      socket.emit('call:ended', { to: targetId });
    }
    
    setTimeout(onClose, 1000);
  }, [localStream, remoteUserName, onClose, socket, targetId, toast]);

  const [isPeerReady, setIsPeerReady] = useState(!isCaller);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const pendingOffer = useRef<any>(null);
  const [iceState, setIceState] = useState<string>('new');

  const [connectionState, setConnectionState] = useState<string>('new');

  const processPendingCandidates = useCallback(async () => {
    if (!peerConnection.current || !peerConnection.current.remoteDescription) {
      console.log('⏳ Skipping pending candidates: PC or remoteDescription not ready');
      return;
    }
    
    console.log(`📦 Processing ${pendingCandidates.current.length} pending candidates`);
    while (pendingCandidates.current.length > 0) {
      const candidate = pendingCandidates.current.shift();
      if (candidate) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('✅ Added pending candidate');
        } catch (e) {
          console.error('❌ Error adding pending ice candidate', e);
        }
      }
    }
  }, []);


  // Handle Socket Events for WebRTC
  useEffect(() => {
    if (!socket) return;

    socket.on('call:accepted', ({ from }) => {
      console.log('🤝 Call accepted by peer:', from);
      setIsPeerReady(true);
    });

    socket.on('call:offer', async ({ from, offer }) => {
      console.log('📩 Received call:offer from', from);
      if (!isCaller) {
        if (peerConnection.current) {
          console.log('📑 Setting remote description (offer)');
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
          console.log('📑 Creating answer');
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit('call:answer', { to: from, answer });
          
          await processPendingCandidates();
        } else {
          console.log('⏳ PC not ready, queuing offer');
          pendingOffer.current = { from, offer };
        }
      }
    });

    socket.on('call:answer', async ({ answer }) => {
      console.log('📩 Received call:answer');
      if (isCaller && peerConnection.current) {
        console.log('📑 Setting remote description (answer)');
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        await processPendingCandidates();
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      console.log('❄️ Received ice-candidate');
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('✅ Added immediate ice candidate');
        } catch (e) {
          console.error('❌ Error adding ice candidate', e);
        }
      } else {
        console.log('⏳ Queuing ice candidate');
        pendingCandidates.current.push(candidate);
      }
    });

    socket.on('call:ended', endCall);

    return () => {
      socket.off('call:accepted');
      socket.off('call:offer');
      socket.off('call:answer');
      socket.off('ice-candidate');
      socket.off('call:ended');
    };
  }, [socket, isCaller, endCall, processPendingCandidates]);


  // Effect to send offer when peer is ready
  useEffect(() => {
    if (isCaller && isPeerReady && peerConnection.current && !peerConnection.current.localDescription) {
      const sendOffer = async () => {
        try {
          console.log('🚀 Creating and sending offer...');
          const offer = await peerConnection.current!.createOffer();
          await peerConnection.current!.setLocalDescription(offer);
          socket?.emit('call:offer', { to: targetId, offer });
          setCallStatus('connecting');
        } catch (err) {
          console.error('❌ Error creating offer:', err);
        }
      };
      sendOffer();
    }
  }, [isCaller, isPeerReady, socket, targetId]);


  // Initialize WebRTC
  const initWebRTC = useCallback(async () => {
    try {
      console.log('🛠️ Initializing WebRTC...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnection.current = pc;

      // Add local tracks
      stream.getTracks().forEach(track => {
        console.log('📤 Adding track:', track.kind);
        pc.addTrack(track, stream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        console.log('📥 Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            console.log('📺 Attached remote stream to video element');
          }
          setCallStatus('connected');
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log('📤 Sending ice candidate');
          socket.emit('ice-candidate', { to: targetId, candidate: event.candidate });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('❄️ ICE Connection State:', pc.iceConnectionState);
        setIceState(pc.iceConnectionState);
      };

      pc.onconnectionstatechange = () => {
        console.log('🤝 Connection State:', pc.connectionState);
        setConnectionState(pc.connectionState);
      };

      if (!isCaller && pendingOffer.current) {
        console.log('📑 Processing queued offer');
        const { from, offer } = pendingOffer.current;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.emit('call:answer', { to: from, answer });
        pendingOffer.current = null;
        
        await processPendingCandidates();
      }

    } catch (err) {
      console.error('❌ WebRTC Init Error:', err);
      toast({ title: "Camera Error", description: "Could not access camera/microphone.", variant: "destructive" });
    }
  }, [isCaller, socket, targetId, toast, processPendingCandidates]);





  useEffect(() => {
    initWebRTC();
    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      if (peerConnection.current) peerConnection.current.close();
    };
  }, []);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-lg animate-in fade-in duration-300 p-4 md:p-8">
      <div className="relative w-full max-w-6xl aspect-video bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
        {/* Connection Status Overlay */}
        {(callStatus === 'connecting' || iceState !== 'connected') && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Video className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">Establishing Secure Connection</p>
              <p className="text-sm text-slate-400">ICE: {iceState} | Peer: {connectionState}</p>
            </div>
          </div>
        )}

        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video (PiP) */}
        <div className="absolute bottom-6 right-6 w-48 md:w-64 aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 z-30 transition-transform hover:scale-105 duration-300">
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
          />
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <VideoOff className="text-gray-500" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white font-medium uppercase tracking-wider">
            You
          </div>
        </div>

        {/* Call Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-6 pb-6 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="icon" 
            variant={isMuted ? "destructive" : "secondary"} 
            className="rounded-full w-12 h-12 shadow-lg"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
          
          <Button 
            size="icon" 
            variant="destructive" 
            className="rounded-full w-16 h-16 shadow-xl animate-pulse-slow scale-110"
            onClick={endCall}
          >
            <PhoneOff className="w-8 h-8" />
          </Button>

          <Button 
            size="icon" 
            variant={isVideoOff ? "destructive" : "secondary"} 
            className="rounded-full w-12 h-12 shadow-lg"
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff /> : <Video />}
          </Button>
        </div>

        {/* User Badge */}
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-40">
          <div className={`w-2 h-2 rounded-full ${callStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-white text-sm font-medium">{remoteUserName}</span>
        </div>
      </div>
      
      <p className="text-gray-500 text-[10px] mt-6 tracking-[0.2em] uppercase font-medium">
        End-to-End Encrypted Consultation • WebRTC Secure Line
      </p>
    </div>
  );
}

