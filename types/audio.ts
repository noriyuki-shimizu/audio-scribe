// Audio transcription types
export interface TranscriptResult {
  success: boolean
  text: string
  timestamp: string
}

export interface Transcript {
  text: string
  timestamp: string
}

export interface AudioRecordingOptions {
  echoCancellation: boolean
  noiseSuppression: boolean
  sampleRate: number
}

// MediaRecorder types
export interface MediaRecorderOptions {
  mimeType: string
}

// API Error types
export interface ApiError {
  statusCode: number
  statusMessage: string
}
