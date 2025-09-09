// Video Call Service for Jitsi Meet integration
export interface VideoCallConfig {
  roomName: string;
  userName: string;
  domain?: string;
  options?: {
    startWithAudioMuted?: boolean;
    startWithVideoMuted?: boolean;
    prejoinPageEnabled?: boolean;
  };
}

export function generateRoomName(patientName: string, doctorName: string, date: string): string {
  const cleanPatient = patientName.replace(/\s+/g, '');
  const cleanDoctor = doctorName.replace(/\s+/g, '');
  const cleanDate = date.replace(/-/g, '');
  return `MediLink-${cleanPatient}-${cleanDoctor}-${cleanDate}`;
}

export function createJitsiUrl(config: VideoCallConfig): string {
  const domain = config.domain || 'meet.jit.si';
  const options = config.options || {};
  
  const params = new URLSearchParams({
    config: JSON.stringify({
      displayName: config.userName,
      prejoinPageEnabled: options.prejoinPageEnabled || false,
      startWithAudioMuted: options.startWithAudioMuted || false,
      startWithVideoMuted: options.startWithVideoMuted || false,
    })
  });
  
  return `https://${domain}/${config.roomName}#${params.toString()}`;
}

export function validateRoomName(roomName: string): boolean {
  // Jitsi room names should be alphanumeric with hyphens
  return /^[a-zA-Z0-9-]+$/.test(roomName) && roomName.length > 0;
}

export function getCallDuration(startTime: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - startTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  
  return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
}
