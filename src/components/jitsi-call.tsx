
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Upload, Send } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";

interface JitsiCallProps {
    roomName: string;
    userName: string;
    onClose: () => void;
}

export function JitsiCall({ roomName, userName, onClose }: JitsiCallProps) {
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    
    const jitsiUrl = `https://meet.jit.si/${roomName}#config.displayName="${userName}"`;

    return (
       <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Video Call</DialogTitle>
          </DialogHeader>
          <div className="flex-grow bg-black">
             <iframe
                src={jitsiUrl}
                style={{ width: '100%', height: '100%', border: '0' }}
                allow="camera; microphone; fullscreen"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
}
