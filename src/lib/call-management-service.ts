// Call Management Service for Doctor-Patient Video Calls

export interface CallSession {
  id: string;
  doctorName: string;
  patientName: string;
  roomName: string;
  status: 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed';
  initiatedBy: 'doctor' | 'patient';
  initiatedAt: string;
  connectedAt?: string;
  endedAt?: string;
  jitsiLink: string;
}

export interface Patient {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  role: 'patient';
}

const STORAGE_KEYS = {
  ACTIVE_CALLS: 'medilink_active_calls',
  CALL_HISTORY: 'medilink_call_history',
  PATIENTS: 'medilink_patients'
};

// Generate unique call ID
export function generateCallId(): string {
  return `CALL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate room name for call
export function generateCallRoomName(doctorName: string, patientName: string): string {
  const cleanDoctor = doctorName.replace(/\s+/g, '');
  const cleanPatient = patientName.replace(/\s+/g, '');
  const timestamp = Date.now().toString().slice(-6);
  return `MediLink-${cleanDoctor}-${cleanPatient}-${timestamp}`;
}

// Generate Jitsi URL with proper configuration
export function generateJitsiUrl(roomName: string, userName?: string, options?: {
  audioMuted?: boolean;
  videoMuted?: boolean;
}): string {
  const baseUrl = `https://meet.jit.si/${roomName}`;
  const config = [
    'config.prejoinPageEnabled=false',
    'config.enableWelcomePage=false',
    'config.enableLobby=false',
    'config.startWithAudioMuted=false',
    'config.startWithVideoMuted=false',
    ...(userName ? [`config.displayName="${userName}"`] : []),
    ...(options?.audioMuted !== undefined ? [`config.startWithAudioMuted=${options.audioMuted}`] : []),
    ...(options?.videoMuted !== undefined ? [`config.startWithVideoMuted=${options.videoMuted}`] : [])
  ];
  
  const finalUrl = `${baseUrl}#${config.join('&')}`;
  console.log('Generated Jitsi URL:', finalUrl);
  return finalUrl;
}

// Get all registered patients
export function getAllPatients(): Patient[] {
  try {
    const usersString = localStorage.getItem('users_list');
    const users = usersString ? JSON.parse(usersString) : [];
    return users.filter((user: any) => user.role === 'patient');
  } catch {
    return [];
  }
}

// Create a new call session
export function initiateCall(doctorName: string, patientName: string): CallSession {
  const callId = generateCallId();
  const roomName = generateCallRoomName(doctorName, patientName);
  const jitsiLink = generateJitsiUrl(roomName, doctorName);
  
  console.log('Initiating call:', { callId, roomName, doctorName, patientName, jitsiLink });
  
  const callSession: CallSession = {
    id: callId,
    doctorName,
    patientName,
    roomName,
    status: 'initiated',
    initiatedBy: 'doctor',
    initiatedAt: new Date().toISOString(),
    jitsiLink
  };

  // Store active call
  const activeCalls = getActiveCalls();
  activeCalls.push(callSession);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CALLS, JSON.stringify(activeCalls));

  // Notify patient (simulate real-time notification)
  notifyPatient(callSession);

  return callSession;
}

// Get all active calls
export function getActiveCalls(): CallSession[] {
  try {
    const callsString = localStorage.getItem(STORAGE_KEYS.ACTIVE_CALLS);
    return callsString ? JSON.parse(callsString) : [];
  } catch {
    return [];
  }
}

// Get calls for a specific patient
export function getPatientCalls(patientName: string): CallSession[] {
  const activeCalls = getActiveCalls();
  return activeCalls.filter(call => call.patientName === patientName);
}

// Get calls for a specific doctor
export function getDoctorCalls(doctorName: string): CallSession[] {
  const activeCalls = getActiveCalls();
  return activeCalls.filter(call => call.doctorName === doctorName);
}

// Update call status
export function updateCallStatus(callId: string, status: CallSession['status']): CallSession | null {
  const activeCalls = getActiveCalls();
  const callIndex = activeCalls.findIndex(call => call.id === callId);
  
  if (callIndex === -1) return null;

  const updatedCall = {
    ...activeCalls[callIndex],
    status,
    ...(status === 'connected' && !activeCalls[callIndex].connectedAt && { connectedAt: new Date().toISOString() }),
    ...(status === 'ended' && !activeCalls[callIndex].endedAt && { endedAt: new Date().toISOString() })
  };

  activeCalls[callIndex] = updatedCall;

  // Move to history if ended or missed
  if (status === 'ended' || status === 'missed') {
    moveCallToHistory(updatedCall);
    activeCalls.splice(callIndex, 1);
  }

  localStorage.setItem(STORAGE_KEYS.ACTIVE_CALLS, JSON.stringify(activeCalls));
  return updatedCall;
}

// Move call to history
function moveCallToHistory(call: CallSession): void {
  try {
    const historyString = localStorage.getItem(STORAGE_KEYS.CALL_HISTORY);
    const history = historyString ? JSON.parse(historyString) : [];
    history.push(call);
    localStorage.setItem(STORAGE_KEYS.CALL_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save call to history:', error);
  }
}

// Get call history
export function getCallHistory(): CallSession[] {
  try {
    const historyString = localStorage.getItem(STORAGE_KEYS.CALL_HISTORY);
    return historyString ? JSON.parse(historyString) : [];
  } catch {
    return [];
  }
}

// Notify patient (simulate real-time notification)
function notifyPatient(call: CallSession): void {
  // In a real app, this would use WebSockets, Server-Sent Events, or push notifications
  // For now, we'll use localStorage events to simulate real-time updates
  const notification = {
    type: 'incoming_call',
    callId: call.id,
    doctorName: call.doctorName,
    roomName: call.roomName,
    jitsiLink: call.jitsiLink,
    timestamp: new Date().toISOString()
  };

  // Store notification for patient
  const notificationsString = localStorage.getItem('medilink_notifications');
  const notifications = notificationsString ? JSON.parse(notificationsString) : [];
  notifications.push(notification);
  localStorage.setItem('medilink_notifications', JSON.stringify(notifications));

  // Trigger storage event for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'medilink_notifications',
    newValue: JSON.stringify(notifications)
  }));
}

// Accept call (patient)
export function acceptCall(callId: string): CallSession | null {
  return updateCallStatus(callId, 'connected');
}

// Decline call (patient)
export function declineCall(callId: string): CallSession | null {
  return updateCallStatus(callId, 'missed');
}

// End call (doctor or patient)
export function endCall(callId: string): CallSession | null {
  return updateCallStatus(callId, 'ended');
}

// Get pending calls for patient
export function getPendingCalls(patientName: string): CallSession[] {
  const activeCalls = getActiveCalls();
  return activeCalls.filter(call => 
    call.patientName === patientName && 
    (call.status === 'initiated' || call.status === 'ringing')
  );
}
