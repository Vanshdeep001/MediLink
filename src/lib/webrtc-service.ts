// WebRTC Service for secure, low-latency video calls
import { CallSession } from './call-management-service';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  signalingServerUrl: string;
  roomId: string;
  userId: string;
  userName: string;
}

export interface WebRTCCallState {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  participants: Participant[];
  callDuration: number;
  error?: string;
}

export interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left' | 'call-ended' | 'mute-toggle' | 'video-toggle' | 'screen-share-toggle';
  from: string;
  to?: string;
  data: any;
  timestamp: number;
}

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();
  private signalingSocket: WebSocket | null = null;
  private config: WebRTCConfig | null = null;
  private callState: WebRTCCallState = {
    isConnected: false,
    isConnecting: false,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    connectionQuality: 'excellent',
    participants: [],
    callDuration: 0
  };
  private callStartTime: Date | null = null;
  private callDurationInterval: NodeJS.Timeout | null = null;
  private stateChangeCallbacks: ((state: WebRTCCallState) => void)[] = [];

  // ICE servers configuration for better connectivity
  private readonly defaultIceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Add TURN servers for production (requires credentials)
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
  ];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.callState.isConnected) {
        this.pauseCall();
      } else if (!document.hidden && this.callState.isConnected) {
        this.resumeCall();
      }
    });

    // Handle network changes
    window.addEventListener('online', () => {
      if (this.callState.isConnecting) {
        this.reconnect();
      }
    });

    window.addEventListener('offline', () => {
      this.updateCallState({ error: 'Network connection lost' });
    });
  }

  async initialize(config: WebRTCConfig): Promise<void> {
    this.config = config;
    
    try {
      // Initialize peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: config.iceServers || this.defaultIceServers,
        iceCandidatePoolSize: 10
      });

      this.setupPeerConnectionHandlers();
      await this.connectToSignalingServer();
      
      this.updateCallState({ isConnecting: true });
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      this.updateCallState({ error: 'Failed to initialize video call' });
      throw error;
    }
  }

  private setupPeerConnectionHandlers() {
    if (!this.peerConnection) return;

    // Handle incoming remote streams
    this.peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      const participantId = event.track.id;
      
      this.remoteStreams.set(participantId, remoteStream);
      this.updateParticipants();
      
      // Notify about new participant
      this.sendSignalingMessage({
        type: 'user-joined',
        from: this.config?.userId || '',
        data: { participantId, streamId: remoteStream.id },
        timestamp: Date.now()
      });
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          from: this.config?.userId || '',
          data: { candidate: event.candidate },
          timestamp: Date.now()
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      
      switch (state) {
        case 'connected':
          this.updateCallState({ 
            isConnected: true, 
            isConnecting: false,
            error: undefined 
          });
          this.startCallTimer();
          break;
        case 'disconnected':
        case 'failed':
          this.updateCallState({ 
            isConnected: false, 
            isConnecting: false,
            error: 'Connection lost' 
          });
          this.stopCallTimer();
          break;
        case 'connecting':
          this.updateCallState({ isConnecting: true });
          break;
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      
      switch (state) {
        case 'connected':
        case 'completed':
          this.updateCallState({ connectionQuality: 'excellent' });
          break;
        case 'checking':
          this.updateCallState({ connectionQuality: 'good' });
          break;
        case 'disconnected':
          this.updateCallState({ connectionQuality: 'fair' });
          break;
        case 'failed':
          this.updateCallState({ connectionQuality: 'poor' });
          break;
      }
    };
  }

  private async connectToSignalingServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For now, we'll use a mock signaling server
        // In production, this would connect to your actual signaling server
        this.signalingSocket = new WebSocket(this.config?.signalingServerUrl || 'ws://localhost:8080/signaling');
        
        this.signalingSocket.onopen = () => {
          console.log('Connected to signaling server');
          resolve();
        };

        this.signalingSocket.onmessage = (event) => {
          this.handleSignalingMessage(JSON.parse(event.data));
        };

        this.signalingSocket.onerror = (error) => {
          console.error('Signaling server error:', error);
          reject(error);
        };

        this.signalingSocket.onclose = () => {
          console.log('Disconnected from signaling server');
          this.updateCallState({ error: 'Signaling server disconnected' });
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleSignalingMessage(message: SignalingMessage) {
    switch (message.type) {
      case 'offer':
        this.handleOffer(message.data);
        break;
      case 'answer':
        this.handleAnswer(message.data);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message.data);
        break;
      case 'user-joined':
        this.handleUserJoined(message.data);
        break;
      case 'user-left':
        this.handleUserLeft(message.data);
        break;
      case 'call-ended':
        this.endCall();
        break;
      case 'mute-toggle':
        this.handleMuteToggle(message.data);
        break;
      case 'video-toggle':
        this.handleVideoToggle(message.data);
        break;
      case 'screen-share-toggle':
        this.handleScreenShareToggle(message.data);
        break;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.sendSignalingMessage({
        type: 'answer',
        from: this.config?.userId || '',
        data: answer,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleUserJoined(data: any) {
    // Update participants list
    this.updateParticipants();
  }

  private handleUserLeft(data: any) {
    this.remoteStreams.delete(data.participantId);
    this.updateParticipants();
  }

  private handleMuteToggle(data: any) {
    // Handle remote participant mute toggle
    this.updateParticipants();
  }

  private handleVideoToggle(data: any) {
    // Handle remote participant video toggle
    this.updateParticipants();
  }

  private handleScreenShareToggle(data: any) {
    // Handle remote participant screen share toggle
    this.updateParticipants();
  }

  private updateParticipants() {
    const participants: Participant[] = [];
    
    this.remoteStreams.forEach((stream, participantId) => {
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      
      participants.push({
        id: participantId,
        name: `Participant ${participantId}`,
        isMuted: audioTracks.length === 0 || audioTracks[0].muted,
        isVideoOff: videoTracks.length === 0 || videoTracks[0].muted,
        isScreenSharing: false, // This would be tracked separately
        connectionQuality: this.callState.connectionQuality
      });
    });

    this.updateCallState({ participants });
  }

  async startCall(): Promise<void> {
    if (!this.peerConnection || !this.config) {
      throw new Error('WebRTC not initialized');
    }

    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignalingMessage({
        type: 'offer',
        from: this.config.userId,
        data: offer,
        timestamp: Date.now()
      });

      this.updateCallState({ isConnecting: true });
    } catch (error) {
      console.error('Error starting call:', error);
      this.updateCallState({ error: 'Failed to start video call' });
      throw error;
    }
  }

  async joinCall(): Promise<void> {
    if (!this.peerConnection || !this.config) {
      throw new Error('WebRTC not initialized');
    }

    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });

      this.updateCallState({ isConnecting: true });
    } catch (error) {
      console.error('Error joining call:', error);
      this.updateCallState({ error: 'Failed to join video call' });
      throw error;
    }
  }

  async toggleMute(): Promise<void> {
    if (!this.localStream) return;

    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    this.updateCallState({ isMuted: !this.callState.isMuted });

    this.sendSignalingMessage({
      type: 'mute-toggle',
      from: this.config?.userId || '',
      data: { isMuted: this.callState.isMuted },
      timestamp: Date.now()
    });
  }

  async toggleVideo(): Promise<void> {
    if (!this.localStream) return;

    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    this.updateCallState({ isVideoOff: !this.callState.isVideoOff });

    this.sendSignalingMessage({
      type: 'video-toggle',
      from: this.config?.userId || '',
      data: { isVideoOff: this.callState.isVideoOff },
      timestamp: Date.now()
    });
  }

  async toggleScreenShare(): Promise<void> {
    try {
      if (this.callState.isScreenSharing) {
        // Stop screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.peerConnection?.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = this.peerConnection?.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      }

      this.updateCallState({ isScreenSharing: !this.callState.isScreenSharing });

      this.sendSignalingMessage({
        type: 'screen-share-toggle',
        from: this.config?.userId || '',
        data: { isScreenSharing: this.callState.isScreenSharing },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }

  async endCall(): Promise<void> {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Close signaling connection
    if (this.signalingSocket) {
      this.signalingSocket.close();
      this.signalingSocket = null;
    }

    // Stop call timer
    this.stopCallTimer();

    // Update state
    this.updateCallState({
      isConnected: false,
      isConnecting: false,
      participants: [],
      callDuration: 0
    });

    // Notify about call end
    this.sendSignalingMessage({
      type: 'call-ended',
      from: this.config?.userId || '',
      data: {},
      timestamp: Date.now()
    });
  }

  private startCallTimer() {
    this.callStartTime = new Date();
    this.callDurationInterval = setInterval(() => {
      if (this.callStartTime) {
        const duration = Math.floor((Date.now() - this.callStartTime.getTime()) / 1000);
        this.updateCallState({ callDuration: duration });
      }
    }, 1000);
  }

  private stopCallTimer() {
    if (this.callDurationInterval) {
      clearInterval(this.callDurationInterval);
      this.callDurationInterval = null;
    }
    this.callStartTime = null;
  }

  private pauseCall() {
    // Pause video/audio when tab is not visible
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.enabled = false;
      });
    }
  }

  private resumeCall() {
    // Resume video/audio when tab becomes visible
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.enabled = true;
      });
    }
  }

  private async reconnect() {
    if (this.callState.isConnected || this.callState.isConnecting) {
      try {
        await this.connectToSignalingServer();
        this.updateCallState({ error: undefined });
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }
  }

  private sendSignalingMessage(message: SignalingMessage) {
    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify(message));
    }
  }

  private updateCallState(updates: Partial<WebRTCCallState>) {
    this.callState = { ...this.callState, ...updates };
    this.stateChangeCallbacks.forEach(callback => callback(this.callState));
  }

  // Public methods
  getCallState(): WebRTCCallState {
    return { ...this.callState };
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStreams(): Map<string, MediaStream> {
    return new Map(this.remoteStreams);
  }

  onStateChange(callback: (state: WebRTCCallState) => void) {
    this.stateChangeCallbacks.push(callback);
  }

  offStateChange(callback: (state: WebRTCCallState) => void) {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  // Cleanup
  destroy() {
    this.endCall();
    this.stateChangeCallbacks = [];
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
export default webrtcService;

